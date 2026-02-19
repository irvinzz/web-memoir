import { CertificateManager } from "./manager";
import { WindowsCertificateManager } from "./windows";
import { LinuxCertificateManager } from "./linux";
import { MacCertificateManager } from "./macos";

export function getCertificateManager(certPath: string): CertificateManager {
  const isWindows = process.platform === "win32";
  const isLinux = process.platform === "linux";
  const isMac = process.platform === "darwin";

  if (isWindows) {
    return new WindowsCertificateManager(certPath);
  } else if (isLinux) {
    return new LinuxCertificateManager(certPath);
  } else if (isMac) {
    return new MacCertificateManager(certPath);
  } else {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }
}
