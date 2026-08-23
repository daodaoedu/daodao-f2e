---
name: implement-from-prototype
description: 依 Claude Design / Figma 匯出的 standalone HTML prototype 實作 UI 時，從 prototype 實際渲染結果精確萃取 DOM/CSS 數值再轉 React，不要用截圖用眼睛比對
---

# Implement From Prototype

依設計稿（Claude Design、Figma 匯出的 standalone HTML 等）實作 UI 元件時，禁止只憑截圖肉眼比對顏色/尺寸/間距後憑印象寫 CSS。這樣做出來的東西看起來「差不多」但實際數值都是猜的，跟設計稿有落差，使用者要一輪一輪來回糾正才會抓到準確值。

正確做法：把 prototype 實際跑起來，用瀏覽器 JS 直接讀取渲染後的 DOM 與 computed style，拿到真正的數值，再照著轉成 React + Tailwind。

## 適用時機

- 使用者提供 Claude Design canvas 連結、Figma 匯出的 standalone HTML 檔案、或任何「照著這個畫面做」的 prototype
- 要實作/修正的是視覺細節（顏色、尺寸、間距、漸層、陰影），不是純邏輯

## 步驟 1：讓 prototype 真正渲染出來

standalone HTML 檔案通常是巨大的 bundle（可能好幾 MB），不能直接用 `file://` 開（瀏覽器自動化工具通常會擋），也不要只用 `grep`/`cat` 讀原始檔內容當作依據——內容是 build 過的 bundle，肉眼讀不出實際渲染結果。

```bash
mkdir -p /tmp/prototype-serve
cp "<使用者提供的 .html 路徑>" /tmp/prototype-serve/prototype.html
cd /tmp/prototype-serve && python3 -m http.server 8899 &
```

用瀏覽器工具（claude-in-chrome）導到 `http://localhost:8899/prototype.html`，等待完全渲染（這類 bundle 通常有 "Unpacking..." 的載入動畫，要等它跑完）。

## 步驟 2：用 JS 精確萃取數值，不要用截圖比對

先用 `computer` 工具截圖找到目標元件大概的螢幕座標，接著用 `javascript_tool` 執行 JS，透過 `document.elementFromPoint(x, y)` 抓到實際 DOM 節點，再用 `getComputedStyle()` 讀出真正的 CSS 數值：

```js
const el = document.elementFromPoint(x, y);
const cs = getComputedStyle(el);
JSON.stringify({
  bg: cs.backgroundColor,
  borderRadius: cs.borderRadius,
  borderStyle: cs.borderStyle,
  borderColor: cs.borderColor,
  borderWidth: cs.borderWidth,
  fontSize: cs.fontSize,
  color: cs.color,
  w: Math.round(el.getBoundingClientRect().width),
  h: Math.round(el.getBoundingClientRect().height),
});
```

**重點技巧**：

- 這類 bundle 常把 class name 做成無語意的 hash（如 `scp0`），不能靠 class name 找元件，要用座標、文字內容、或元素尺寸範圍去篩選（例如「找出寬高都 < 30px 且 border-radius 非 0 的元素」抓出所有小圓點）。
- 一次遍歷同一列的所有子節點（`row.children`），逐一印出尺寸/顏色，比對出漸層/分級規律（例如本專案時間軸元件實測出的三階圓點：最舊 8px 淺色、中間 9-10px 中teal、今天 14px 深teal、未來信 18px 米白虛線框）。
- 文字類樣式（月份標籤等）用「找出符合特定文字 pattern 且無子元素的節點」（例如 `/^\d+月$/`）比座標更穩定。
- 回傳值若被系統判定像 cookie/query string 格式會被擋（`[BLOCKED: Cookie/query string data]`），改成回傳結構化 JSON（純數值/顏色字串），不要直接吐一大包 outerHTML。
- 漸層/陰影等視覺效果，prototype 匯出工具有時會用非典型技巧實作（例如虛線用 `repeating-linear-gradient` 而非 `border-style: dashed`）——這是匯出工具的實作細節，轉譯到真正的網站時，用該技巧對應的正規 CSS/Tailwind 寫法（例如直接用 `border-dashed`）即可，不必照抄非典型手法。

## 步驟 3：轉譯成 React + Tailwind

拿到精確數值後才開始寫元件：

- 顏色直接用十六進位或 rgb 值寫成 Tailwind 任意值（`bg-[#0E9E99]`），不要用最接近的 Tailwind 預設色號去猜
- 尺寸優先對應 Tailwind 預設 scale（例如 8px = `size-2`），對不上時用任意值（`size-[9px]`）
- 完成後截圖跟 prototype 原圖並排比對，確認顏色/尺寸/間距一致才算完成

## 注意事項

- 不要只做到「看起來像」就停手，使用者要的是實際數值一致，不是風格相似
- prototype 用完記得關掉本地 HTTP server（`lsof -ti:8899 | xargs kill -9`）
