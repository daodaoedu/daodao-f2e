export const LOGIN_TYPE = 'DAODAO-LOGIN-TYPE';

export default function getEnv() {
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const devDomain = process.env.NEXT_PUBLIC_DEV_URL ?? '';
  const hostname = process.env.HOSTNAME ?? '';
  const mode = process.env.NODE_ENV;

  const isServerSide = typeof window === 'undefined';
  const isDev = mode === 'development';
  const devApiUrl = isServerSide ? publicApiUrl : '/dev-proxy-api';
  const apiUrl = isDev ? devApiUrl : publicApiUrl;

  const isDevHost = isServerSide
    ? isDev
    : window.location.hostname.endsWith('localhost') ||
      window.location.hostname.endsWith(
        devDomain.replace(/https?:\/\/dev\./g, '')
      );

  return {
    apiUrl,
    devDomain,
    frontendUrl: isDevHost ? devDomain : hostname,
    isClientSide: !isServerSide,
    isDev,
    isDevHost,
    isServerSide,
    mode,
  };
}
