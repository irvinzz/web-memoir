import { openApp, apps } from "open";
import { getCertificateManager } from "./cert";
import { caCrtPath } from "./cert-ca";
import { Api } from "../shared/Api";

const certManager = getCertificateManager(caCrtPath);

async function startChromium() {
  await openApp(apps.chrome, {
    arguments: [
      "--proxy-server=https=localhost:3128",
      "--profile-directory=offline-internet",
    ],
    wait: false,
  });
}

export const startBrowser: Api['startBrowser'] = async function startBrowser(
  ignoreSSLError: boolean
) {
  if (ignoreSSLError) {
    await startChromium();
    return { code: 'OK', message: '' };
  }

  const certificateCheckResult = await certManager.checkInstalledCertificate();
  console.debug('certificateCheckResult', certificateCheckResult);
  if (certificateCheckResult.code !== 'OK') {
    return {
      ...certificateCheckResult,
      message: "Certificate is not installed or does not match",
    };
  }

  await startChromium();

  return {
    code: 'OK',
    message: '',
  };
}

export async function installCertificate(): Promise<void> {
  await certManager.installCertificate();
}

export async function uninstallCertificate(): Promise<void> {
  await certManager.uninstallCertificate();
}
