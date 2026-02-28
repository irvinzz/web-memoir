export interface IPCResponse<CODES extends string> {
  code: CODES;
  message: string;
  error?: any;
}

export type CHECK_CERTIFICATE_CODES = 'OK' | 'CERT_NOT_INSTALLED' | 'CERT_MISMATCH' | 'UNHANDLED_ERROR';
export type INSTALL_CERTIFICATE_CODES = 'OK' | 'UNHANDLED_ERROR';
export type START_BROWSER_CODES = 'OK' | CHECK_CERTIFICATE_CODES;

export interface Api {
  loadOptions: (space: string) => Promise<ProxyOptions>;
  applyOptions: (space: string, options: ProxyOptions) => Promise<void>;
  startProxyInstance: (space: string) => Promise<void>;
  stopProxyInstance: (space: string) => Promise<void>,
  startBrowser: (space: string, ignoreSSLError: boolean) => Promise<IPCResponse<START_BROWSER_CODES>>;
  installCertificate: () => Promise<void>;
  runCrawler: (space: string, startUrl: string, options: {
  }) => Promise<void>;
}

export type ProxyOptions = {
  useUpstreamProxy?: boolean;
  upstreamProxyAddress?: string;
  cacheShare?: boolean;
  allowLarge?: boolean;
  allowMedia?: boolean;
  offline?: boolean;
};
