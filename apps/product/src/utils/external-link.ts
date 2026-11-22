// 島島自有網域：這些連結不需要「外部連結」提醒
const DAODAO_ROOT_DOMAIN = "daodao.so";

/**
 * 判斷網址是否指向島島以外的網站。
 * 同網域（含 app-dev.daodao.so 這類子網域）視為內部；無法解析的網址保守視為外部。
 */
export function isExternalUrl(url: string, currentHostname: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return true;
  }

  if (hostname === currentHostname.toLowerCase()) return false;
  return !(hostname === DAODAO_ROOT_DOMAIN || hostname.endsWith(`.${DAODAO_ROOT_DOMAIN}`));
}
