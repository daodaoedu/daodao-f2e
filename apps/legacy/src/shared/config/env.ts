import { getEnv as getEnvVar } from "@daodao/config";

export type Environment = "production" | "staging" | "preview" | "development";

export default function getEnv() {
  const publicApiUrl = getEnvVar("NEXT_PUBLIC_API_URL") ?? "";
  const stagingURL = getEnvVar("STAGING_URL") ?? "";
  const prodURL = getEnvVar("PROD_URL") ?? "";
  const environment = (getEnvVar("NEXT_PUBLIC_ENVIRONMENT") ?? "development") as Environment;

  const isServerSide = typeof window === "undefined";
  const apiUrl = publicApiUrl;
  const isProduction = environment === "production";
  const isStaging = environment === "staging";
  const isPreview = environment === "preview";
  const isDevelopment = environment === "development";

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
