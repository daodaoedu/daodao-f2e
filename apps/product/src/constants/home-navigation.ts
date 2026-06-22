export const HOME_TAB_PATHS = {
  inspire: "/",
  persona: "/persona",
  mine: "/mine",
} as const;

/** Canonical left-to-right tab order: 靈感 → 我的 → 人物誌 */
export const HOME_TAB_ORDER = ["inspire", "mine", "persona"] as const satisfies ReadonlyArray<
  keyof typeof HOME_TAB_PATHS
>;
