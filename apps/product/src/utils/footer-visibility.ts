/** 不渲染全站 Footer 的路由（已去掉 locale 前綴）。聊天頁對齊 POC：整頁不捲動（daodao#154） */
const FOOTERLESS_ROUTE = /^\/messages(\/|$)/;

export function isFooterHidden(pathname: string): boolean {
  return FOOTERLESS_ROUTE.test(pathname);
}
