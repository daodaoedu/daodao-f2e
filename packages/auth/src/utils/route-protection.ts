/**
 * Pure utility functions for client-side route protection.
 * These are extracted from auth-provider so they can be unit-tested without React.
 */

import type { AuthProviderRouteConfig } from "../lib/auth-provider";

export const matchesPath = (pathname: string, pattern: string): boolean => {
  try {
    return new RegExp(pattern).test(pathname);
  } catch {
    console.error(`Invalid regex pattern: ${pattern}`);
    return false;
  }
};

export const removeLocalePrefix = (pathname: string, locales: string[]): string => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return pathname;
  const first = segments[0];
  if (first && locales.includes(first)) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname;
};

const normalizePattern = (pattern: AuthProviderRouteConfig["publicPattern"]): string[] => {
  if (!pattern) return [];
  return typeof pattern === "string" ? [pattern] : pattern;
};

export const isProtectedPath = (
  pathname: string,
  config: Pick<AuthProviderRouteConfig, "publicPattern" | "protectedPattern" | "defaultProtected">,
  locales: string[]
): boolean => {
  const clean = removeLocalePrefix(pathname, locales);
  const publicPatterns = normalizePattern(config.publicPattern);
  const protectedPatterns = normalizePattern(config.protectedPattern);

  if (publicPatterns.some((p) => matchesPath(clean, p))) return false;
  if (protectedPatterns.length > 0) return protectedPatterns.some((p) => matchesPath(clean, p));
  return config.defaultProtected !== false;
};
