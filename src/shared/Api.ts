export interface IPCResponse<CODES extends string> {
  code: CODES;
  message: string;
  error?: any;
}

export interface Space {
  name: string;
  private: boolean;
  startPage?: string;
}

export interface SpacesSettings {
  activeSpaceName: string;
  spaces: Space[];
}

export type CHECK_CERTIFICATE_CODES =
  | 'OK'
  | 'CERT_NOT_INSTALLED'
  | 'CERT_MISMATCH'
  | 'UNHANDLED_ERROR';
export type INSTALL_CERTIFICATE_CODES = 'OK' | 'UNHANDLED_ERROR';
export type START_BROWSER_CODES = 'OK' | 'PROXY_PROCESS_MISSING' | CHECK_CERTIFICATE_CODES;

export interface Api {
  loadOptions: (space: string) => Promise<ProxySettings>;
  applyOptions: (space: string, options: ProxySettings) => Promise<void>;
  startProxyInstance: (space: string) => Promise<void>;
  stopProxyInstance: (space: string) => Promise<void>;
  describeProxyInstance: (space: string) => Promise<{ port: number } | null>;
  startBrowser: (
    space: string,
    ignoreSSLError: boolean
  ) => Promise<IPCResponse<START_BROWSER_CODES>>;
  installCertificate: () => Promise<void>;
  openCertiticateFolder: () => Promise<void>;
  runCrawler: (space: string, startUrl: string, options: {}) => Promise<void>;
  putToClipboard: (text: string) => Promise<void>;
  inspect: () => Promise<any>;

  getSpaces: () => Promise<SpacesSettings>;
  addSpace: (newSpace: Space) => Promise<void>;
  removeSpace: (space: Space) => Promise<void>;
  setActiveSpace: (space: Space) => Promise<void>;
  exportSpace: (spaceName: string) => Promise<void>;
  importSpace: () => Promise<void>;
}

export type ProxySettings = {
  useUpstreamProxy?: boolean;
  upstreamProxyAddress?: string;
  cacheShare?: boolean;
  allowLarge?: boolean;
  allowMedia?: boolean;
  offline?: boolean;
};
