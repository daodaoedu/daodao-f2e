/**
 * 建立實踐精靈的 POC 對齊樣式（POC：Drive「Group space - Practice Create Flow.dc.html」）。
 * 只覆寫 @daodao/ui 元件在本流程內的圓角／高度／字級，不動共用元件本身。
 */

/** POC 連結類操作用的深青綠（oklch(0.585 0.098 190.6)），theme 沒有對應 token */
export const WIZARD_LINK_COLOR = "text-[oklch(0.585_0.098_190.6)]";

/** 名稱框、完成彈窗膠囊的極淡青底（oklch(0.981 0.012 205.6)） */
export const WIZARD_TINT_BG = "bg-[oklch(0.981_0.012_205.6)]";

/** 分隔點顏色（oklch(0.845 0.018 200)） */
export const WIZARD_SEPARATOR_COLOR = "text-[oklch(0.845_0.018_200)]";

/** 預覽時機徽章（琥珀色 pill） */
export const WIZARD_TIMING_BADGE =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[oklch(0.912_0.062_82)] bg-[oklch(0.975_0.035_88)] py-[3px] pr-2.5 pl-2 text-sm leading-[1.4] text-[oklch(0.6_0.12_62)]";

/** 底線文字連結（POC 13px、深青綠、底線；保留 40px 可點高度） */
export const WIZARD_TEXT_LINK = `inline-flex min-h-10 items-center border-0 bg-transparent p-0 text-[13px] leading-normal underline underline-offset-2 hover:opacity-80 ${WIZARD_LINK_COLOR}`;

/** 一般輸入框：radius 8、1px focus 框；高度由呼叫端決定 */
export const WIZARD_INPUT =
  "rounded-[8px] text-text-dark focus-visible:border focus-visible:border-logo-cyan";

/** Step 2 自訂輸入框：44px、padding 8/16 */
export const WIZARD_INPUT_LG = `${WIZARD_INPUT} h-11 px-4 py-2 focus-visible:px-4 focus-visible:py-2`;

/** Step 3 連結／名稱輸入框：40px */
export const WIZARD_INPUT_MD = `${WIZARD_INPUT} h-10 px-4 py-2 focus-visible:px-4 focus-visible:py-2`;

/** 逐段卡片內的小輸入框：36px、padding 6/10 */
export const WIZARD_INPUT_SM = `${WIZARD_INPUT} h-9 px-2.5 py-1.5 text-sm focus-visible:px-2.5 focus-visible:py-1.5`;

/** 逐段卡片內的下拉（SelectTrigger） */
export const WIZARD_SELECT_SM =
  "h-9 w-full rounded-[8px] px-2 py-1.5 text-left text-sm text-text-dark focus-visible:border focus-visible:px-2 focus-visible:py-1.5";

/** 選項按鈕（天數／頻率／時間／時機） */
export const WIZARD_OPTION_BASE =
  "flex min-h-11 cursor-pointer items-center justify-center gap-0 whitespace-nowrap rounded-[8px] border bg-white px-1.5 py-2.5 text-center font-medium text-text-dark transition-colors";
export const wizardOptionState = (selected: boolean) =>
  selected ? "border-logo-cyan text-logo-cyan" : "border-transparent hover:border-bg-gray";

/** 資源卡片（Step 3 與預覽共用） */
export const WIZARD_RESOURCE_CARD =
  "flex items-center gap-3 rounded-[8px] border border-bg-gray bg-white px-3.5 py-3";
export const WIZARD_RESOURCE_LINK = `min-w-0 flex-1 truncate text-sm leading-normal hover:underline ${WIZARD_LINK_COLOR}`;
export const WIZARD_RESOURCE_PLAIN =
  "min-w-0 flex-1 truncate text-sm leading-normal text-text-dark";
