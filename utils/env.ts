export const LOGIN_TYPE = 'DAODAO-LOGIN-TYPE';

export const getEnv = () => ({
  mode: process.env.NODE_ENV,
  devDomain: process.env.NEXT_PUBLIC_DEV_URL ?? '',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  hostname: process.env.HOSTNAME ?? '',
});

export const env = getEnv();

export const isDev = env.mode === 'development';

export const isServerSide = typeof window === 'undefined';

export const isClientSide = typeof window !== 'undefined';

export const baseDomainName = env.devDomain.replace(/https?:\/\/dev\./g, '');

export const getBackendUrl = () => (isDev ? '/dev-proxy-api' : env.apiUrl);

export const checkIsDevHost = () =>
  isServerSide
    ? false
    : window.location.hostname.endsWith('localhost') ||
      window.location.hostname.endsWith(baseDomainName);

export const getFrontendUrl = () =>
  checkIsDevHost() ? env.devDomain : window.location.origin;
