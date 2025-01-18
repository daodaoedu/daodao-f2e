const isPathnameSafe = (str: string) => /^[a-zA-Z0-9\-_]+$/.test(str);

const BASE64_PATHNAME_PREFIX = "b_";

export const encodePathname = (pathname: string) => {
  if (
    isPathnameSafe(pathname) &&
    !pathname.startsWith(BASE64_PATHNAME_PREFIX)
  ) {
    return pathname;
  }
  const base64 = Buffer.from(pathname)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return `${BASE64_PATHNAME_PREFIX}${base64}`;
};

export const decodePathname = (pathname: string) => {
  if (pathname.startsWith(BASE64_PATHNAME_PREFIX)) {
    const formattedBase64 = pathname
      .replace(BASE64_PATHNAME_PREFIX, "")
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    return Buffer.from(formattedBase64, "base64").toString();
  }
  return pathname;
};
