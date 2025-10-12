export const LOGIN_TYPE = 'DAODAO-LOGIN-TYPE';

export type Environment = 'production' | 'staging' | 'preview' | 'development';

export default function getEnv() {
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const stagingURL = process.env.STAGING_URL ?? '';
  const prodURL = process.env.PROD_URL ?? '';
  const environment = (process.env.NEXT_PUBLIC_ENVIRONMENT ?? 'development') as Environment;

  const isServerSide = typeof window === 'undefined';
  const apiUrl = publicApiUrl;
  const isProduction = environment === 'production';
  const isStaging = environment === 'staging';
  const isPreview = environment === 'preview';
  const isDevelopment = environment === 'development';

  return {
    apiUrl,
    stagingURL,
    prodURL,
    environment,
    isClientSide: !isServerSide,
    isServerSide,
    isProduction,
    isStaging,
    isPreview,
    isDevelopment,
  };
}
