export function stripLocaleFromPathname(pathname: string | null): string {
  return pathname?.replace(/^\/[a-z]{2}(-[a-zA-Z]{2})?(?=\/|$)/, "") || "/";
}

export function isTaskGuideAllowedPath(pathname: string | null): boolean {
  const strippedPath = stripLocaleFromPathname(pathname);
  return strippedPath === "/" || /^\/(notifications|mine|settings)(\/|$)/.test(strippedPath);
}
