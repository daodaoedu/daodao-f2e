const PRACTICE_SUBPAGE_PATH = /^(?:\/(?:en|zh-TW))?\/practices\/([^/]+)\/?$/;
// Static routes under /practices that share the dynamic [id] URL shape.
const NON_DETAIL_SEGMENTS = new Set(["create", "copy-success"]);

/** 實踐詳情頁（不含建立、編輯、打卡等其他頁）的 pathname，可帶語系前綴。 */
export const isPracticeDetailPath = (pathname: string): boolean => {
  const segment = PRACTICE_SUBPAGE_PATH.exec(pathname)?.[1];
  return segment != null && !NON_DETAIL_SEGMENTS.has(segment);
};
