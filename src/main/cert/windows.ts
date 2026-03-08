import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import * as forge from 'node-forge';

import * as certCa from '../cert-ca';
import { CertificateManager } from './manager';
import { CHECK_CERTIFICATE_CODES, INSTALL_CERTIFICATE_CODES } from '../../shared/Api';

export class WindowsCertificateManager extends CertificateManager {
  async checkInstalledCertificate() {
    return new Promise<{ code: CHECK_CERTIFICATE_CODES; error?: any }>((resolve) => {
      const certUtilProcess = spawn('certutil', [
        '-user',
        '-store',
        '-v',
        'Root',
        certCa.CERT_NAME,
      ]);

      let output = '';
      certUtilProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      certUtilProcess.on('close', async (code) => {
        if (code !== 0) {
          resolve({ code: 'UNHANDLED_ERROR' });
          return;
        }
        try {
          const cert = forge.pki.certificateFromPem(output);
          const certPem = await readFile(this.certPath, 'utf8');
          const certFromPath = forge.pki.certificateFromPem(certPem);
          const isValid = this.compareCertificates(cert, certFromPath);
          if (isValid) {
            resolve({ code: 'OK' });
          } else {
            resolve({ code: 'CERT_MISMATCH' });
          }
        } catch (e) {
          resolve({ code: 'UNHANDLED_ERROR', error: e });
        }
      });

      certUtilProcess.on('error', (error) => {
        resolve({ code: 'UNHANDLED_ERROR', error });
      });
    });
  }

  async installCertificate() {
    return await new Promise<{ code: INSTALL_CERTIFICATE_CODES; error?: any }>((resolve) => {
      const securityProcess = spawn('security', [
        'add-certificate',
        '-t',
        'C,',
        '-k',
        'login',
        this.certPath,
      ]);
      securityProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ code: 'OK' });
        } else {
          resolve({ code: 'UNHANDLED_ERROR', error: 'Failed to add certificate to Keychain' });
        }
      });
    });
  }

  async uninstallCertificate(): Promise<void> {
    const securityProcess = spawn('security', ['delete-certificate', '-c', certCa.CERT_NAME]);

    await new Promise<void>((resolve, reject) => {
      securityProcess.on('close', (code) => {
        if (code === 0 || code === -128) {
          resolve();
        } else {
          reject(new Error('Failed to delete certificate from Keychain'));
        }
      });
    });
  }

  private compareCertificates(cert1: any, cert2: any): boolean {
    const subject1 = cert1.subject.attributes
      .map((a: any) => `${a.shortName}=${a.value}`)
      .join(',');
    const subject2 = cert2.subject.attributes
      .map((a: any) => `${a.shortName}=${a.value}`)
      .join(',');

    const issuer1 = cert1.issuer.attributes.map((a: any) => `${a.shortName}=${a.value}`).join(',');
    const issuer2 = cert2.issuer.attributes.map((a: any) => `${a.shortName}=${a.value}`).join(',');

    const serial1 = cert1.serialNumber;
    const serial2 = cert2.serialNumber;

    const valid1 = cert1.validity.notBefore.getTime() === cert2.validity.notBefore.getTime();
    const valid2 = cert1.validity.notAfter.getTime() === cert2.validity.notAfter.getTime();

    return subject1 === subject2 && issuer1 === issuer2 && serial1 === serial2 && valid1 && valid2;
  }
}
