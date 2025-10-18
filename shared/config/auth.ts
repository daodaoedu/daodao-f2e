import getEnv from './env';

export function isValidOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    const { isStaging, stagingURL, prodURL } = getEnv();
    const baseDomain = stagingURL.split('.').slice(1).join('.');

    return (
      [stagingURL, prodURL].some((allowed) => allowed.endsWith(hostname)) ||
      hostname.endsWith(baseDomain) ||
      (isStaging && hostname === 'localhost')
    );
  } catch {
    return false;
  }
}
