declare namespace NodeJS {
  interface ProcessEnv {
    readonly OFFLINE_MODE?: string;
    readonly DB_NAME?: string;
    readonly SELF_ADDRESS?: string;
    readonly RCPWD?: string;
    readonly FETCH_TIMEOUT?: string;
    readonly UPSTREAM_PROXY?: string;
    readonly APP_VERSION?: string;
    readonly ALLOW_LARGE?: string;
    readonly ALLOW_MEDIA?: string;
  }
}
