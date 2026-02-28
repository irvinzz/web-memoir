import { openApp, apps } from "open";
import { getCertificateManager } from "./cert";
import { caCrtPath } from "./cert-ca";
import { Api } from "../shared/Api";
import { getProxyInstance } from "./service";

const certManager = getCertificateManager(caCrtPath);

async function startChromium(options: {
  proxyPort: number;
  profileName: string;
}) {
  const { profileName, proxyPort } = options;
  await openApp(apps.chrome, {
    arguments: [
      `--proxy-server=https=localhost:${proxyPort}`,
      `--profile-directory=oi-${profileName}`,
    ],
    wait: false,
  });
}

async function launchBrowser(options: { space: string }) {
  const proxyInstance = getProxyInstance(options.space);
  await startChromium({
    profileName: options.space,
    proxyPort: proxyInstance!.port,
  });
}

export const startBrowser: Api['startBrowser'] = async function startBrowser(
  space,
  ignoreSSLError,
) {
  if (ignoreSSLError) {
    await launchBrowser({ space });
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

  await launchBrowser({ space });

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
