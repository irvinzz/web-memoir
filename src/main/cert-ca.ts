import * as forge from 'node-forge';

import * as crypto from 'node:crypto';

import * as os from 'node:os';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { app } from 'electron';

export const caPath = join(app.getPath('userData'), 'cert');

export const caKeyPath = join(caPath, 'rootCA.key');

export const caCrtPath = join(caPath, 'rootCA.crt');

export const CERT_NAME = 'SD';

export async function createRootCA(): Promise<void> {
  if (!(existsSync(caKeyPath) && existsSync(caCrtPath))) {
    await new Promise<void>((resolve) => {
      const caKeys = forge.pki.rsa.generateKeyPair(4096);
      const caCert = forge.pki.createCertificate();
      caCert.publicKey = caKeys.publicKey;
      caCert.serialNumber = '01' + crypto.randomBytes(19).toString('hex');
      caCert.validity.notBefore = new Date();
      const YEAR = 1000 * 60 * 60 * 24 * 365;
      caCert.validity.notAfter = new Date(new Date().getTime() + YEAR * 50);
      const attrs = [
        {
          name: 'commonName',
          value: `Offline Internet at ${os.hostname}`,
        },
      ];
      caCert.setSubject(attrs);
      caCert.setIssuer(attrs);
      caCert.setExtensions([
        {
          name: 'basicConstraints',
          cA: true,
        },
        {
          name: 'keyUsage',
          keyCertSign: true,
          crlSign: true,
        },
        {
          name: 'subjectKeyIdentifier',
          hash: true,
        },
        {
          name: 'nsCertType',
          objCA: true,
        },
      ]);
      caCert.sign(caKeys.privateKey, forge.md.sha256.create());

      const caKey = forge.pki.privateKeyToPem(caKeys.privateKey);
      const caCrt = forge.pki.certificateToPem(caCert);

      try {
        mkdirSync(caPath, { recursive: true });
      } catch {
        //
      }

      writeFileSync(caCrtPath, caCrt);
      writeFileSync(caKeyPath, caKey);

      resolve();
    });
  }
}
