export interface IPCResponse<CODES extends string> {
  code: CODES;
  message?: string;
  error?: any;
}

export interface Space {
  settings?: SpaceSettings;
}

export interface SpacesConfiguration {
  activeSpaceName: string;
  spaces: Record<string, Space>;
}

export interface ProxyInstanceDescription {
  ip: string;
  port: number;
}

export type CHECK_CERTIFICATE_RESULT_CODES =
  | 'OK'
  | 'CERT_NOT_INSTALLED'
  | 'CERT_MISMATCH'
  | 'UNHANDLED_ERROR';
export type INSTALL_CERTIFICATE_CODES = 'OK' | 'UNHANDLED_ERROR';
export type START_BROWSER_CODES = 'OK' | 'PROXY_PROCESS_MISSING' | CHECK_CERTIFICATE_RESULT_CODES;

export interface Api {
  startProxyInstance: (spaceName: string) => Promise<ProxyInstanceDescription>;
  stopProxyInstance: (spaceName: string) => Promise<void>;
  describeProxyInstance: (spaceName: string) => Promise<ProxyInstanceDescription | null>;
  startBrowser: (
    spaceName: string,
    ignoreSSLError: boolean
  ) => Promise<IPCResponse<START_BROWSER_CODES>>;
  installCertificate: () => Promise<void>;
  openCertiticateFolder: () => Promise<void>;
  runCrawler: (
    spaceName: string,
    startUrl: string,
    options: { runInForeground: boolean }
  ) => Promise<void>;
  putToClipboard: (text: string) => Promise<void>;
  inspect: () => Promise<any>;

  getSpaces: () => Promise<SpacesConfiguration>;
  addSpace: (spaceName: string, newSpace: Space) => Promise<void>;
  removeSpace: (spaceName: string) => Promise<void>;
  setActiveSpace: (spaceName: string) => Promise<void>;
  exportSpace: (spaceName: string) => Promise<void>;
  importSpace: () => Promise<void>;

  applySpaceSettings: (space: string, options: SpaceSettings) => Promise<void>;

  getLocale: () => Promise<string>;
}

export type SpaceSettings = {
  useUpstreamProxy?: boolean;
  upstreamProxyAddress?: string;
  cacheShare?: boolean;
  allowLarge?: boolean;
  allowMedia?: boolean;
  offline?: boolean;
  private?: boolean;
  customBrowser?: boolean;
  allowNetwork?: boolean;
  startPage?: string;
};
