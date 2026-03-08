export const socks5Re =
  /^(?<scheme>socks5):\/\/(?:(?<user>[^:@]+)(?::(?<pass>[^@]*))?@)?(?<host>(?:\d{1,3}\.){3}\d{1,3}|[A-Za-z0-9.-]+):(?<port>\d{1,5})$/;
