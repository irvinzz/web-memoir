import { exec, spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import * as forge from "node-forge";
import * as certCa from "../cert-ca";
import { CertificateManager } from "./manager";
import { CHECK_CERTIFICATE_CODES, INSTALL_CERTIFICATE_CODES } from "../../shared/Api";

export class LinuxCertificateManager extends CertificateManager {
  async checkInstalledCertificate() {
    return new Promise<{ code: CHECK_CERTIFICATE_CODES; error?: any }>((resolve) => {
      const certUtilProcess = exec(
        `certutil -d sql:$HOME/.pki/nssdb -L -a -n ${certCa.CERT_NAME}`,
      );

      let output = "";
      certUtilProcess.stdout!.on("data", (data) => {
        output += data.toString();
      });

      certUtilProcess.on("close", async (code) => {
        if (code === 255) {
          resolve({ code: 'CERT_NOT_INSTALLED' });
        }
        if (code !== 0) {
          resolve({ code: 'UNHANDLED_ERROR' });
        }
        try {
          const installedCertPem = forge.pki.certificateFromPem(output);
          const certPem = await readFile(this.certPath, "utf8");
          const cert = forge.pki.certificateFromPem(certPem);
          if (installedCertPem.serialNumber === cert.serialNumber) {
            resolve({ code: 'OK' });
          } else {
            resolve({ code: 'CERT_MISMATCH' });
          }
        } catch (e) {
          resolve({ code: 'UNHANDLED_ERROR', error: e });
        }
      });

      certUtilProcess.on("error", (e) => {
        resolve({ code: 'UNHANDLED_ERROR', error: e });
      });
    });
  }

  async installCertificate() {
    return new Promise<{ code: INSTALL_CERTIFICATE_CODES; error?: any }>((resolve) => {
      const certUtilProcess = exec(
        `certutil -d sql:$HOME/.pki/nssdb -A -t C,, -n ${certCa.CERT_NAME} -i ${this.certPath}`,
      );

      certUtilProcess.on("close", (code) => {
        if (code === 0) {
          resolve({ code: 'OK' });
        } else {
          resolve({
            code: 'UNHANDLED_ERROR',
            error: '"certutil install failed with code " + code',
          });
        }
      });

      certUtilProcess.on("error", (error) => {
        resolve({ code: 'UNHANDLED_ERROR', error });
      });
    });
  }

  async uninstallCertificate(): Promise<void> {
    return new Promise((resolve, reject) => {
      const certUtilProcess = spawn("certutil", [
        "-d",
        "sql:\\$HOME/.pki/nssdb",
        "-D",
        "-n",
        certCa.CERT_NAME,
      ]);

      certUtilProcess.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(
            new Error("certutil uninstall failed with code " + code)
          );
        }
      });

      certUtilProcess.on("error", (error) => {
        reject(error);
      });
    });
  }
}
