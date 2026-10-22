export const HOME_TAB_PATHS = {
  inspire: "/",
  persona: "/persona",
  mine: "/mine",
} as const;

// 實踐詳情頁右上角 Close 的落點：新主頁「你的今天」，不再回舊的 /mine（daodao#211）
export const PRACTICE_DETAIL_CLOSE_PATH = HOME_TAB_PATHS.inspire;
