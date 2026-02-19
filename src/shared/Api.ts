export interface IPCResponse<CODES extends string> {
  code: CODES;
  message: string;
  error?: any;
}

export type CHECK_CERTIFICATE_CODES = 'OK' | 'CERT_NOT_INSTALLED' | 'CERT_MISMATCH' | 'UNHANDLED_ERROR';
export type INSTALL_CERTIFICATE_CODES = 'OK' | 'UNHANDLED_ERROR';
export type START_BROWSER_CODES = 'OK' | CHECK_CERTIFICATE_CODES;

export interface Api {
  loadOptions: () => Promise<Options>;
  applyOptions: (options: Options) => Promise<void>;
  startService: (options?: Options) => Promise<{ msg: 'started' }>;
  stopService: () => Promise<{ msg: 'stopped' }>,
  startBrowser: (ignoreSSLError: boolean) => Promise<IPCResponse<START_BROWSER_CODES>>;
  installCertificate: () => Promise<void>;
}

export type Options = {
  useUpstreamProxy?: boolean;
  upstreamProxyAddress?: string;
  cacheShare?: boolean;
  allowLarge?: boolean;
  allowMedia?: boolean;
  offline?: boolean;
};
