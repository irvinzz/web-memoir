const MAXMongoDBNameLength = 63 as const;
export const DBNamePrefix = 'io-' as const;

export function transformSpaceNameToDBName(input: string): string {
  return DBNamePrefix + input.replace(/\./g, '_dot_');
}

export function isValidSpaceName(spaceName: string): boolean {
  if (!spaceName) return false;
  const dbName = transformSpaceNameToDBName(spaceName);
  if (dbName.length > MAXMongoDBNameLength - DBNamePrefix.length) {
    return false;
  }

  const pattern = /^[a-zA-Z0-9_$-]+$/;
  return pattern.test(dbName);
}
