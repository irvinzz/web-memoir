const MAXMongoDBNameLength = 63 as const;
export const DBNamePrefix = 'io-' as const;

export function isValidSpaceName(dbName: string): boolean {
  if (!dbName || dbName.length > MAXMongoDBNameLength - DBNamePrefix.length) {
    return false;
  }

  if (dbName.startsWith('.') || dbName.endsWith('.')) {
    return false;
  }

  if (dbName.includes('..')) {
    return false;
  }

  const reservedNames = new Set(['admin', 'local', 'config']);
  if (reservedNames.has(dbName.toLowerCase())) {
    return false;
  }

  const pattern = /^[a-zA-Z0-9._$-]+$/;
  return pattern.test(dbName);
}