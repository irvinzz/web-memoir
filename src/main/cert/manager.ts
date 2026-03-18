import { CHECK_CERTIFICATE_RESULT_CODES, INSTALL_CERTIFICATE_CODES, IPCResponse } from '../../shared/Api';

export abstract class CertificateManager {
  public certPath: string;

  constructor(certPath: string) {
    this.certPath = certPath;
  }

  abstract checkInstalledCertificate(): Promise<IPCResponse<CHECK_CERTIFICATE_RESULT_CODES>>;
  abstract installCertificate(): Promise<IPCResponse<INSTALL_CERTIFICATE_CODES>>;
  abstract uninstallCertificate(): Promise<void>;
}
