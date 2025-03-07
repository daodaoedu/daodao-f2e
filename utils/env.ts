export const LOGIN_TYPE = 'DAODAO-LOGIN-TYPE';

export const checkIsDev = () => process.env.NODE_ENV === 'development';

export const getBackendUrl = () =>
  checkIsDev() ? '/dev-proxy-api' : process.env.NEXT_PUBLIC_API_URL;

export const checkIsDevHost = () =>
  window.location.hostname.endsWith('localhost') ||
  window.location.hostname.endsWith(
    process.env.NEXT_PUBLIC_DEV_HOST ?? 'daodao-notion-test.pages.dev'
  );

export const getFrontendUrl = () =>
  checkIsDevHost()
    ? process.env.NEXT_PUBLIC_DEV_DOMAIN ??
      'https://dev.daodao-notion-test.pages.dev'
    : window.location.origin;
