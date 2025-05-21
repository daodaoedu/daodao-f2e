export const LOGIN_TYPE = 'DAODAO-LOGIN-TYPE';

export const getEnv = () => {
  const mode = process.env.NODE_ENV;
  const devDomain = process.env.NEXT_PUBLIC_DEV_URL ?? '';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const isServerSide = typeof window === 'undefined';
  const hostname = isServerSide
    ? process.env.HOSTNAME ?? ''
    : window.location.hostname;

  return {
    apiUrl,
    devDomain,
    frontendUrl: isServerSide ? devDomain : window.location.origin,
    isClientSide: !isServerSide,
    isDev: mode === 'development',
    isDevHost:
      hostname.endsWith('localhost') ||
      hostname?.endsWith(devDomain.replace(/https?:\/\/dev\./g, '')),
    isServerSide,
    mode,
  };
};

export default getEnv();
