export const LOGIN_TYPE = 'DAODAO-LOGIN-TYPE';

export default function getEnv() {
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const stagingHostname = process.env.STAGING_HOSTNAME ?? '';
  const hostname = process.env.HOSTNAME ?? '';
  const mode = process.env.NODE_ENV;

  const isServerSide = typeof window === 'undefined';
  const isDev = mode === 'development';
  const currentHostname = isServerSide ? '' : window.location.hostname;
  const devApiUrl = isServerSide ? publicApiUrl : '/dev-proxy-api';
  const apiUrl = isDev ? devApiUrl : publicApiUrl;

  const isPreviewHost =
    !stagingHostname.endsWith(currentHostname) &&
    !hostname.endsWith(currentHostname);

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
