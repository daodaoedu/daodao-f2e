/**
 * 圓角系統（mobile 專屬 scale，px 值對齊 web globals.css 的 --radius 檔位）
 *
 * web --radius = 10px 為基準；sm/md/lg 對齊其 tailwind 推導值，讓 mobile 元件
 * 引用到與 web 相同的實際圓角：
 *   sm=6 (--radius-sm)、base=8 (--radius-md)、md=10 (--radius 基準)、lg=14 (--radius-xl)。
 * tamagui.config 的 radius.true = radius.md = 10，即預設圓角對齊 web 基準。
 */
export const radius = {
  none: 0,
  sm: 6,
  base: 8,
  md: 10,
  lg: 14,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
} as const;

export type Radius = typeof radius;
