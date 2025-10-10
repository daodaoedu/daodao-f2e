export const LOGIN_TYPE = 'DAODAO-LOGIN-TYPE';

function getWorkersDomain(stagingHostname: string) {
  if (!stagingHostname) return null;
  try {
    const parts = stagingHostname.split('.');
    return parts.length > 2 ? parts.slice(1).join('.') : stagingHostname;
  } catch {
    console.error(`Invalid STAGING_HOSTNAME in .env: ${stagingHostname}`);
    return null;
  }
}

export default function getEnv() {
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const stagingHostname = process.env.STAGING_HOSTNAME ?? '';
  const hostname = process.env.HOSTNAME ?? '';
  const mode = process.env.NODE_ENV;

  const isServerSide = typeof window === 'undefined';
  const currentHostname = isServerSide ? '' : window.location.hostname;
  const workersDomain = getWorkersDomain(stagingHostname);
  const isDev = mode === 'development';
  const devApiUrl = isServerSide ? publicApiUrl : '/dev-proxy-api';
  const apiUrl = isDev ? devApiUrl : publicApiUrl;

  const isPreviewHost =
    workersDomain &&
    currentHostname.endsWith(workersDomain) &&
    currentHostname !== stagingHostname;

  const isLocalOrPreviewHost =
    currentHostname.endsWith('localhost') || isPreviewHost;

  return {
    apiUrl,
    stagingHostname,
    hostname,
    isClientSide: !isServerSide,
    isDev,
    isLocalOrPreviewHost,
    isServerSide,
    mode,
  };
}
