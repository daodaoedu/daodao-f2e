export const LOGIN_TYPE = 'DAODAO-LOGIN-TYPE';

export default function getEnv() {
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const stagingHostname = process.env.STAGING_HOSTNAME ?? '';
  const hostname = process.env.HOSTNAME ?? '';
  const mode = process.env.NODE_ENV;

  const isServerSide = typeof window === 'undefined';
  const currentHostname = isServerSide ? '' : window.location.hostname;
  const workersDomain = stagingHostname.replace(
    /https:\/\/staging-daodao-f2e\./g,
    ''
  );
  const isDev = mode === 'development';
  const devApiUrl = isServerSide ? publicApiUrl : '/dev-proxy-api';
  const apiUrl = isDev ? devApiUrl : publicApiUrl;

  const isPreviewHost =
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
