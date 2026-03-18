import { readFile, unlink } from 'node:fs/promises';
import * as forge from 'node-forge';

import * as certCa from '../cert-ca';
import { CertificateManager } from './manager';
import { CHECK_CERTIFICATE_RESULT_CODES, INSTALL_CERTIFICATE_CODES, IPCResponse } from '../../shared/Api';
import { execAsync, spawnAsync } from '../process';

const decode = (() => {
  try {
    const iconv = require('iconv-lite');
    return function(input) {
      return iconv.decode(input, 'cp1251');
    }
  } catch {
    return function(input) {
      return input.toString();
    }
  }
})();

export class WindowsCertificateManager extends CertificateManager {
  async checkInstalledCertificate(): Promise<IPCResponse<CHECK_CERTIFICATE_RESULT_CODES>> {
    const referenceCertificateFileContent = await readFile(this.certPath, 'utf8');
    const referenceCertificate = forge.pki.certificateFromPem(referenceCertificateFileContent);
    const referenceSerialNumber = referenceCertificate.serialNumber;
    const exportedCertFileName = referenceSerialNumber + '.crt';
    const { err, stdout, stderr } = await execAsync(`certutil -user -store -f "${certCa.CERT_NAME}" ${referenceSerialNumber} ${exportedCertFileName}`);
    try { await unlink(exportedCertFileName) } catch {}
    const output = decode(stdout);
    const errout = decode(stderr);

    if (err) {
      const { code } = err;
      if (code === 2148073489) {
        return { code: 'CERT_NOT_INSTALLED' };
      } else if (code === 2147942480) {
        // file already exported to cwd
        return { code: 'OK' };
      }
      console.error('exitcode', code);
      return { code: 'UNHANDLED_ERROR', message: output };
    }

    return { code: 'OK' };
  }

  async installCertificate(): Promise<IPCResponse<INSTALL_CERTIFICATE_CODES>> {
    const { err, stdout, stderr } = await execAsync(`certutil -v -user -addstore -f "${certCa.CERT_NAME}" ${this.certPath}`);

    if (err) {
      return { code: 'UNHANDLED_ERROR', message: decode(stdout), error: decode(stderr) };
    }

    return { code: 'OK', message: decode(stdout) };
  }

  async uninstallCertificate(): Promise<void> {
    const referenceCertificateFileContent = await readFile(this.certPath, 'utf8');
    const referenceCertificate = forge.pki.certificateFromPem(referenceCertificateFileContent);
    const referenceSerialNumber = referenceCertificate.serialNumber;
    const { err, stdout, stderr } = await execAsync(`certutil -v -user -delstore "${certCa.CERT_NAME}" "${referenceSerialNumber}"`);
    if (err) {
      const { code } = err;
      throw err;
    }
  }
}
