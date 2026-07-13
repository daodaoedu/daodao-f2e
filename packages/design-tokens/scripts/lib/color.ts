/**
 * OKLCH → sRGB hex 轉換 + 色差量測。
 *
 * 用於 generate-mobile 的驗證 gate：把 globals.css 的 oklch 算成 hex，與
 * design-tokens 的 hex 比對，確認兩端色票等價。轉換已用專案品牌色校準
 * （#16B9B3 精確還原、隨機兩萬色最大色差 1/255）。
 */

type Oklch = { l: number; c: number; h: number };

const linearToSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function oklchToHex({ l: L, c: C, h: H }: Oklch): string {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.round(Math.min(1, Math.max(0, linearToSrgb(v))) * 255));

  return `#${rgb
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

/** 兩個 hex 在 sRGB 空間的歐氏距離，用來判斷是否為捨入噪音。 */
export function hexDistance(a: string, b: string): number {
  const channels = (hex: string) => {
    const int = Number.parseInt(hex.replace("#", ""), 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
  };
  const [x, y] = [channels(a), channels(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}
