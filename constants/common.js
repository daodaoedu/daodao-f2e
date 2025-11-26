const isDev = process.env.NODE_ENV === 'development';

/** @deprecated */
export const BASE_URL = isDev
  ? '/dev-proxy-api'
  : process.env.NEXT_PUBLIC_API_URL;
