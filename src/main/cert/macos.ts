import { execSync, spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

import * as forge from 'node-forge';

import * as certCa from '../cert-ca';
import { CertificateManager } from './manager';
import {
  CHECK_CERTIFICATE_RESULT_CODES,
  INSTALL_CERTIFICATE_CODES,
  IPCResponse,
} from '../../shared/Api';

function getSecurityOutput(args: string[]): string {
  return execSync('security ' + args.join(' '), { encoding: 'utf-8' }).trim().replace(/"/g, '');
}

export class MacCertificateManager extends CertificateManager {
  private getKeychainPath(): string {
    return getSecurityOutput(['default-keychain']);
  }

  async checkInstalledCertificate(): Promise<IPCResponse<CHECK_CERTIFICATE_RESULT_CODES>> {
    let certFromPath: any;
    try {
      const certPem = await readFile(this.certPath, 'utf8');
      certFromPath = forge.pki.certificateFromPem(certPem);
    } catch {
      return { code: 'UNHANDLED_ERROR' };
    }

    const cn = certFromPath.subject.attributes.find((a: any) => a.shortName === 'CN');
    const searchName = cn ? cn.value : certCa.CERT_NAME;
    const keychainPath = this.getKeychainPath();

    return new Promise<{ code: CHECK_CERTIFICATE_RESULT_CODES; error?: any }>((resolve) => {
      const securityProcess = spawn('security', [
        'find-certificate',
        '-c',
        searchName,
        '-p',
        keychainPath,
      ]);
      let output = '';
      let stderr = '';
      securityProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      securityProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      securityProcess.on('close', async (code) => {
        console.log('[MacCertificateManager] find-certificate close:', {
          code,
          stdout: output,
          stderr,
          searchName,
          keychainPath,
        });
        // security find-certificate may return non-zero even with results;
        // rely on output presence rather than exit code alone
        if (!output.trim()) {
          resolve({ code: 'CERT_NOT_INSTALLED', error: stderr || 'No certificate found' });
          return;
        }
        try {
          const cert = forge.pki.certificateFromPem(output);
          const isValid = this.compareCertificates(cert, certFromPath);
          if (isValid) {
            resolve({ code: 'OK' });
          } else {
            resolve({ code: 'CERT_MISMATCH' });
          }
        } catch {
          resolve({ code: 'UNHANDLED_ERROR' });
        }
      });
      securityProcess.on('error', (error) => {
        resolve({
          code: 'UNHANDLED_ERROR',
          error,
        });
      });
    });
  }

  async installCertificate(): Promise<IPCResponse<INSTALL_CERTIFICATE_CODES>> {
    const keychainPath = this.getKeychainPath();
    return await new Promise<{ code: INSTALL_CERTIFICATE_CODES; error?: any }>(
      (resolve) => {
        const securityProcess = spawn('security', [
          'add-trusted-cert',
          '-d',
          '-r',
          'trustRoot',
          '-p',
          'ssl',
          '-p',
          'eap',
          '-k',
          keychainPath,
          this.certPath,
        ]);
        let stderr = '';
        securityProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        securityProcess.on('close', (code) => {
          console.log('[MacCertificateManager] add-trusted-cert close:', {
            code,
            stderr,
            keychainPath,
          });
          if (code === 0) {
            resolve({ code: 'OK' });
          } else {
            resolve({ code: 'UNHANDLED_ERROR', error: `Failed to add certificate to Keychain: ${stderr}` });
          }
        });
        securityProcess.on('error', (error) => {
          resolve({ code: 'UNHANDLED_ERROR', error });
        });
      }
    );
  }

  async uninstallCertificate(): Promise<void> {
    let certFromPath: any;
    try {
      const certPem = await readFile(this.certPath, 'utf8');
      certFromPath = forge.pki.certificateFromPem(certPem);
    } catch {
      return;
    }
    const cn = certFromPath.subject.attributes.find((a: any) => a.shortName === 'CN');
    const searchName = cn ? cn.value : certCa.CERT_NAME;
    const keychainPath = this.getKeychainPath();
    const securityProcess = spawn('security', ['delete-certificate', '-c', searchName, keychainPath]);

    await new Promise<void>((resolve, reject) => {
      securityProcess.on('close', (code) => {
        // -128 means certificate not found (already deleted)
        if (code === 0 || code === -128) {
          resolve();
        } else {
          reject(new Error('Failed to delete certificate from Keychain'));
        }
      });
      securityProcess.on('error', (error) => {
        reject(error);
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
