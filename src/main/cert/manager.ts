import { CHECK_CERTIFICATE_CODES, INSTALL_CERTIFICATE_CODES } from '../../shared/Api';

export abstract class CertificateManager {
  public certPath: string;

  constructor(certPath: string) {
    this.certPath = certPath;
  }

  abstract checkInstalledCertificate(): Promise<{ code: CHECK_CERTIFICATE_CODES; error?: any }>;
  abstract installCertificate(): Promise<{ code: INSTALL_CERTIFICATE_CODES }>;
  abstract uninstallCertificate(): Promise<void>;
}
