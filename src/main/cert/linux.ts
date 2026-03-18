import { readFile } from 'node:fs/promises';

import * as forge from 'node-forge';

import * as certCa from '../cert-ca';
import { CertificateManager } from './manager';
import { CHECK_CERTIFICATE_RESULT_CODES, INSTALL_CERTIFICATE_CODES, IPCResponse } from '../../shared/Api';
import { execAsync, spawnAsync } from '../process';

export class LinuxCertificateManager extends CertificateManager {
  async checkInstalledCertificate(): Promise<IPCResponse<CHECK_CERTIFICATE_RESULT_CODES>> {
    const { err, stdout, stderr} = await execAsync(`certutil -d sql:$HOME/.pki/nssdb -L -a -n ${certCa.CERT_NAME}`);
    if (err) {
      const { code } = err;
      if (code === 255) {
        return { code: 'CERT_NOT_INSTALLED' };
      }
      if (code !== 0) {
        return { code: 'UNHANDLED_ERROR' };
      }
      
    }
    try {
      const installedCertPem = forge.pki.certificateFromPem(stdout.toString());
      const certPem = await readFile(this.certPath, 'utf8');
      const cert = forge.pki.certificateFromPem(certPem);
      if (installedCertPem.serialNumber === cert.serialNumber) {
        return { code: 'OK' };
      } else {
        return { code: 'CERT_MISMATCH' };
      }
    } catch (e) {
      return { code: 'UNHANDLED_ERROR', error: e };
    }
  }

  async installCertificate(): Promise<IPCResponse<INSTALL_CERTIFICATE_CODES>> {
    const { err,  stdout, stderr } = await execAsync(
      `certutil -d sql:$HOME/.pki/nssdb -A -t C,, -n ${certCa.CERT_NAME} -i ${this.certPath}`
    );
    if (err) {
      const { code } = err;
      return {
        code: 'UNHANDLED_ERROR',
        error: '"certutil install failed with code " + code',
      };

    }
    return { code: 'OK' };
  }

  async uninstallCertificate(): Promise<void> {
    const { err, stdout, stderr } = await execAsync(`certutil -d sql:\\$HOME/.pki/nssdb -D -n ${certCa.CERT_NAME}`);

    if (err) {
      const { code } = err;
      throw new Error('certutil uninstall failed with code ' + code)
    }
  }
}
