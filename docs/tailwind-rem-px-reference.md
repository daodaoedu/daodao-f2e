# Tailwind CSS Rem 與 Px 對應表

這份文件提供了 Tailwind CSS 中所有 rem 和 px 值的對應關係，以及 Flexbox 和 Grid 格線系統的類別，方便開發者在設計和開發時進行參考。

## 基礎概念

- **1rem = 16px** (在預設的瀏覽器設定下)
- Tailwind CSS 使用 rem 作為主要單位，確保響應式設計的一致性
- 使用 rem 單位可以讓元素大小根據根字體大小進行縮放

## 間距 (Spacing) - 適用於 margin, padding, width, height 等

| Tailwind Class | Rem | Px | 說明 |
|----------------|-----|----|------|
| `p-0` / `m-0` / `w-0` / `h-0` | 0rem | 0px | 無間距 |
| `p-0.5` / `m-0.5` / `w-0.5` / `h-0.5` | 0.125rem | 2px | 極小間距 |
| `p-1` / `m-1` / `w-1` / `h-1` | 0.25rem | 4px | 很小間距 |
| `p-1.5` / `m-1.5` / `w-1.5` / `h-1.5` | 0.375rem | 6px | 小間距 |
| `p-2` / `m-2` / `w-2` / `h-2` | 0.5rem | 8px | 小間距 |
| `p-2.5` / `m-2.5` / `w-2.5` / `h-2.5` | 0.625rem | 10px | 小間距 |
| `p-3` / `m-3` / `w-3` / `h-3` | 0.75rem | 12px | 小間距 |
| `p-3.5` / `m-3.5` / `w-3.5` / `h-3.5` | 0.875rem | 14px | 小間距 |
| `p-4` / `m-4` / `w-4` / `h-4` | 1rem | 16px | 基礎間距 |
| `p-5` / `m-5` / `w-5` / `h-5` | 1.25rem | 20px | 基礎間距 |
| `p-6` / `m-6` / `w-6` / `h-6` | 1.5rem | 24px | 基礎間距 |
| `p-7` / `m-7` / `w-7` / `h-7` | 1.75rem | 28px | 基礎間距 |
| `p-8` / `m-8` / `w-8` / `h-8` | 2rem | 32px | 基礎間距 |
| `p-9` / `m-9` / `w-9` / `h-9` | 2.25rem | 36px | 基礎間距 |
| `p-10` / `m-10` / `w-10` / `h-10` | 2.5rem | 40px | 基礎間距 |
| `p-11` / `m-11` / `w-11` / `h-11` | 2.75rem | 44px | 基礎間距 |
| `p-12` / `m-12` / `w-12` / `h-12` | 3rem | 48px | 基礎間距 |
| `p-14` / `m-14` / `w-14` / `h-14` | 3.5rem | 56px | 基礎間距 |
| `p-16` / `m-16` / `w-16` / `h-16` | 4rem | 64px | 基礎間距 |
| `p-20` / `m-20` / `w-20` / `h-20` | 5rem | 80px | 基礎間距 |
| `p-24` / `m-24` / `w-24` / `h-24` | 6rem | 96px | 基礎間距 |
| `p-28` / `m-28` / `w-28` / `h-28` | 7rem | 112px | 基礎間距 |
| `p-32` / `m-32` / `w-32` / `h-32` | 8rem | 128px | 基礎間距 |
| `p-36` / `m-36` / `w-36` / `h-36` | 9rem | 144px | 基礎間距 |
| `p-40` / `m-40` / `w-40` / `h-40` | 10rem | 160px | 基礎間距 |
| `p-44` / `m-44` / `w-44` / `h-44` | 11rem | 176px | 基礎間距 |
| `p-48` / `m-48` / `w-48` / `h-48` | 12rem | 192px | 基礎間距 |
| `p-52` / `m-52` / `w-52` / `h-52` | 13rem | 208px | 基礎間距 |
| `p-56` / `m-56` / `w-56` / `h-56` | 14rem | 224px | 基礎間距 |
| `p-60` / `m-60` / `w-60` / `h-60` | 15rem | 240px | 基礎間距 |
| `p-64` / `m-64` / `w-64` / `h-64` | 16rem | 256px | 基礎間距 |
| `p-72` / `m-72` / `w-72` / `h-72` | 18rem | 288px | 基礎間距 |
| `p-80` / `m-80` / `w-80` / `h-80` | 20rem | 320px | 基礎間距 |
| `p-96` / `m-96` / `w-96` / `h-96` | 24rem | 384px | 基礎間距 |

## 字體大小 (Text Sizes)

| Tailwind Class | Rem | Px | 說明 |
|----------------|-----|----|------|
| `text-xs` | 0.75rem | 12px | 極小字體 |
| `text-sm` | 0.875rem | 14px | 小字體 |
| `text-base` | 1rem | 16px | 基礎字體 |
| `text-lg` | 1.125rem | 18px | 大字體 |
| `text-xl` | 1.25rem | 20px | 大字體 |
| `text-2xl` | 1.5rem | 24px | 大標題 |
| `text-3xl` | 1.875rem | 30px | 大標題 |
| `text-4xl` | 2.25rem | 36px | 大標題 |
| `text-5xl` | 3rem | 48px | 大標題 |
| `text-6xl` | 3.75rem | 60px | 大標題 |
| `text-7xl` | 4.5rem | 72px | 大標題 |
| `text-8xl` | 6rem | 96px | 大標題 |
| `text-9xl` | 8rem | 128px | 大標題 |

## 文字樣式 (Text Styling)

### 字體粗細 (Font Weight)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `font-thin` | `font-weight: 100` | 極細字體 |
| `font-extralight` | `font-weight: 200` | 超細字體 |
| `font-light` | `font-weight: 300` | 細字體 |
| `font-normal` | `font-weight: 400` | 正常字體 (預設) |
| `font-medium` | `font-weight: 500` | 中等字體 |
| `font-semibold` | `font-weight: 600` | 半粗體 |
| `font-bold` | `font-weight: 700` | 粗體 |
| `font-extrabold` | `font-weight: 800` | 超粗體 |
| `font-black` | `font-weight: 900` | 極粗體 |

### 字體樣式 (Font Style)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `italic` | `font-style: italic` | 斜體 |
| `not-italic` | `font-style: normal` | 正常字體 |

### 文字裝飾 (Text Decoration)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `underline` | `text-decoration: underline` | 底線 |
| `line-through` | `text-decoration: line-through` | 刪除線 |
| `no-underline` | `text-decoration: none` | 無裝飾 |

### 文字對齊 (Text Alignment)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `text-left` | `text-align: left` | 左對齊 |
| `text-center` | `text-align: center` | 置中對齊 |
| `text-right` | `text-align: right` | 右對齊 |
| `text-justify` | `text-align: justify` | 兩端對齊 |

### 文字變形 (Text Transform)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `uppercase` | `text-transform: uppercase` | 大寫 |
| `lowercase` | `text-transform: lowercase` | 小寫 |
| `capitalize` | `text-transform: capitalize` | 首字大寫 |
| `normal-case` | `text-transform: none` | 正常大小寫 |

### 文字間距 (Letter Spacing)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `tracking-tighter` | `letter-spacing: -0.05em` | 更緊密間距 |
| `tracking-tight` | `letter-spacing: -0.025em` | 緊密間距 |
| `tracking-normal` | `letter-spacing: 0em` | 正常間距 |
| `tracking-wide` | `letter-spacing: 0.025em` | 寬鬆間距 |
| `tracking-wider` | `letter-spacing: 0.05em` | 更寬鬆間距 |
| `tracking-widest` | `letter-spacing: 0.1em` | 最寬鬆間距 |

### 文字溢出 (Text Overflow)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `truncate` | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` | 截斷並顯示省略號 |
| `text-ellipsis` | `text-overflow: ellipsis` | 文字溢出顯示省略號 |
| `text-clip` | `text-overflow: clip` | 文字溢出截斷 |

### 空白處理 (White Space)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `whitespace-normal` | `white-space: normal` | 正常空白處理 |
| `whitespace-nowrap` | `white-space: nowrap` | 不換行 |
| `whitespace-pre` | `white-space: pre` | 保留空白和換行 |
| `whitespace-pre-line` | `white-space: pre-line` | 合併空白，保留換行 |
| `whitespace-pre-wrap` | `white-space: pre-wrap` | 保留空白和換行，自動換行 |
| `whitespace-break-spaces` | `white-space: break-spaces` | 保留空白和換行，斷行處理 |

## 行高 (Line Height)

| Tailwind Class | Rem | Px | 說明 |
|----------------|-----|----|------|
| `leading-none` | 1rem | 16px | 無行高 |
| `leading-tight` | 1.25rem | 20px | 緊湊行高 |
| `leading-snug` | 1.375rem | 22px | 緊湊行高 |
| `leading-normal` | 1.5rem | 24px | 正常行高 |
| `leading-relaxed` | 1.625rem | 26px | 寬鬆行高 |
| `leading-loose` | 2rem | 32px | 寬鬆行高 |

## 邊框寬度 (Border Width)

| Tailwind Class | Rem | Px | 說明 |
|----------------|-----|----|------|
| `border` | 1px | 1px | 基礎邊框 |
| `border-0` | 0px | 0px | 無邊框 |
| `border-2` | 2px | 2px | 粗邊框 |
| `border-4` | 4px | 4px | 粗邊框 |
| `border-8` | 8px | 8px | 粗邊框 |

## 圓角 (Border Radius)

| Tailwind Class | Rem | Px | 說明 |
|----------------|-----|----|------|
| `rounded-none` | 0px | 0px | 無圓角 |
| `rounded-sm` | 0.125rem | 2px | 小圓角 |
| `rounded` | 0.25rem | 4px | 基礎圓角 |
| `rounded-md` | 0.375rem | 6px | 中等圓角 |
| `rounded-lg` | 0.5rem | 8px | 大圓角 |
| `rounded-xl` | 0.75rem | 12px | 大圓角 |
| `rounded-2xl` | 1rem | 16px | 大圓角 |
| `rounded-3xl` | 1.5rem | 24px | 大圓角 |
| `rounded-full` | 9999px | 9999px | 完全圓形 |

## 背景屬性 (Background Properties)

### 背景顏色 (Background Colors)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `bg-transparent` | `background-color: transparent` | 透明背景 |
| `bg-current` | `background-color: currentColor` | 當前文字顏色 |
| `bg-black` | `background-color: #000000` | 黑色背景 |
| `bg-white` | `background-color: #ffffff` | 白色背景 |
| `bg-gray-50` | `background-color: #f9fafb` | 淺灰色背景 |
| `bg-gray-100` | `background-color: #f3f4f6` | 淺灰色背景 |
| `bg-gray-200` | `background-color: #e5e7eb` | 淺灰色背景 |
| `bg-gray-300` | `background-color: #d1d5db` | 淺灰色背景 |
| `bg-gray-400` | `background-color: #9ca3af` | 中等灰色背景 |
| `bg-gray-500` | `background-color: #6b7280` | 中等灰色背景 |
| `bg-gray-600` | `background-color: #4b5563` | 深灰色背景 |
| `bg-gray-700` | `background-color: #374151` | 深灰色背景 |
| `bg-gray-800` | `background-color: #1f2937` | 深灰色背景 |
| `bg-gray-900` | `background-color: #111827` | 深灰色背景 |
| `bg-red-50` | `background-color: #fef2f2` | 淺紅色背景 |
| `bg-red-100` | `background-color: #fee2e2` | 淺紅色背景 |
| `bg-red-500` | `background-color: #ef4444` | 紅色背景 |
| `bg-red-600` | `background-color: #dc2626` | 深紅色背景 |
| `bg-red-900` | `background-color: #7f1d1d` | 深紅色背景 |
| `bg-green-50` | `background-color: #f0fdf4` | 淺綠色背景 |
| `bg-green-100` | `background-color: #dcfce7` | 淺綠色背景 |
| `bg-green-500` | `background-color: #22c55e` | 綠色背景 |
| `bg-green-600` | `background-color: #16a34a` | 深綠色背景 |
| `bg-green-900` | `background-color: #14532d` | 深綠色背景 |
| `bg-blue-50` | `background-color: #eff6ff` | 淺藍色背景 |
| `bg-blue-100` | `background-color: #dbeafe` | 淺藍色背景 |
| `bg-blue-500` | `background-color: #3b82f6` | 藍色背景 |
| `bg-blue-600` | `background-color: #2563eb` | 深藍色背景 |
| `bg-blue-900` | `background-color: #1e3a8a` | 深藍色背景 |
| `bg-yellow-50` | `background-color: #fefce8` | 淺黃色背景 |
| `bg-yellow-100` | `background-color: #fef3c7` | 淺黃色背景 |
| `bg-yellow-500` | `background-color: #eab308` | 黃色背景 |
| `bg-yellow-600` | `background-color: #ca8a04` | 深黃色背景 |
| `bg-yellow-900` | `background-color: #713f12` | 深黃色背景 |
| `bg-purple-50` | `background-color: #faf5ff` | 淺紫色背景 |
| `bg-purple-100` | `background-color: #f3e8ff` | 淺紫色背景 |
| `bg-purple-500` | `background-color: #a855f7` | 紫色背景 |
| `bg-purple-600` | `background-color: #9333ea` | 深紫色背景 |
| `bg-purple-900` | `background-color: #581c87` | 深紫色背景 |
| `bg-pink-50` | `background-color: #fdf2f8` | 淺粉色背景 |
| `bg-pink-100` | `background-color: #fce7f3` | 淺粉色背景 |
| `bg-pink-500` | `background-color: #ec4899` | 粉色背景 |
| `bg-pink-600` | `background-color: #db2777` | 深粉色背景 |
| `bg-pink-900` | `background-color: #831843` | 深粉色背景 |

### 背景圖片 (Background Images)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `bg-none` | `background-image: none` | 無背景圖片 |
| `bg-gradient-to-t` | `background-image: linear-gradient(to top, var(--tw-gradient-stops))` | 向上漸層 |
| `bg-gradient-to-tr` | `background-image: linear-gradient(to top right, var(--tw-gradient-stops))` | 向右上漸層 |
| `bg-gradient-to-r` | `background-image: linear-gradient(to right, var(--tw-gradient-stops))` | 向右漸層 |
| `bg-gradient-to-br` | `background-image: linear-gradient(to bottom right, var(--tw-gradient-stops))` | 向右下漸層 |
| `bg-gradient-to-b` | `background-image: linear-gradient(to bottom, var(--tw-gradient-stops))` | 向下漸層 |
| `bg-gradient-to-bl` | `background-image: linear-gradient(to bottom left, var(--tw-gradient-stops))` | 向左下漸層 |
| `bg-gradient-to-l` | `background-image: linear-gradient(to left, var(--tw-gradient-stops))` | 向左漸層 |
| `bg-gradient-to-tl` | `background-image: linear-gradient(to top left, var(--tw-gradient-stops))` | 向左上漸層 |

### 背景尺寸 (Background Size)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `bg-auto` | `background-size: auto` | 自動背景尺寸 |
| `bg-cover` | `background-size: cover` | 覆蓋整個容器 |
| `bg-contain` | `background-size: contain` | 包含在容器內 |
| `bg-[length:200px_100px]` | `background-size: 200px 100px` | 自定義背景尺寸 |

### 背景位置 (Background Position)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `bg-bottom` | `background-position: bottom` | 底部對齊 |
| `bg-center` | `background-position: center` | 置中對齊 |
| `bg-left` | `background-position: left` | 左側對齊 |
| `bg-left-bottom` | `background-position: left bottom` | 左下角對齊 |
| `bg-left-top` | `background-position: left top` | 左上角對齊 |
| `bg-right` | `background-position: right` | 右側對齊 |
| `bg-right-bottom` | `background-position: right bottom` | 右下角對齊 |
| `bg-right-top` | `background-position: right top` | 右上角對齊 |
| `bg-top` | `background-position: top` | 頂部對齊 |

### 背景重複 (Background Repeat)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `bg-repeat` | `background-repeat: repeat` | 重複背景 |
| `bg-no-repeat` | `background-repeat: no-repeat` | 不重複背景 |
| `bg-repeat-x` | `background-repeat: repeat-x` | 水平重複 |
| `bg-repeat-y` | `background-repeat: repeat-y` | 垂直重複 |
| `bg-repeat-round` | `background-repeat: round` | 圓角重複 |
| `bg-repeat-space` | `background-repeat: space` | 間距重複 |

### 背景附件 (Background Attachment)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `bg-fixed` | `background-attachment: fixed` | 固定背景 |
| `bg-local` | `background-attachment: local` | 本地背景 |
| `bg-scroll` | `background-attachment: scroll` | 滾動背景 |

### 背景裁剪 (Background Clip)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `bg-clip-border` | `background-clip: border-box` | 邊框盒裁剪 |
| `bg-clip-padding` | `background-clip: padding-box` | 內邊距盒裁剪 |
| `bg-clip-content` | `background-clip: content-box` | 內容盒裁剪 |
| `bg-clip-text` | `background-clip: text` | 文字裁剪 |

### 自定義背景顏色
```tsx
className="bg-[#FF6B6B]"           // 自定義十六進位顏色
className="bg-[rgb(255,107,107)]"  // 自定義 RGB 顏色
className="bg-[rgba(255,107,107,0.8)]" // 自定義 RGBA 顏色
className="bg-[hsl(0,100%,70%)]"  // 自定義 HSL 顏色
className="bg-[hsla(0,100%,70%,0.8)]" // 自定義 HSLA 顏色
```

## 陰影 (Box Shadow)

| Tailwind Class | Rem | Px | 說明 |
|----------------|-----|----|------|
| `shadow-sm` | 0 1px 2px 0 | 0 1px 2px 0 | 小陰影 |
| `shadow` | 0 1px 3px 0 | 0 1px 3px 0 | 基礎陰影 |
| `shadow-md` | 0 4px 6px -1px | 0 4px 6px -1px | 中等陰影 |
| `shadow-lg` | 0 10px 15px -3px | 0 10px 15px -3px | 大陰影 |
| `shadow-xl` | 0 20px 25px -5px | 0 20px 25px -5px | 大陰影 |
| `shadow-2xl` | 0 25px 50px -12px | 0 25px 50px -12px | 大陰影 |

## Flexbox 格線系統 (Flexbox Grid System)

### 容器屬性 (Container Properties)

#### Display
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `flex` | `display: flex` | 設定為 flexbox 容器 |
| `inline-flex` | `display: inline-flex` | 設定為行內 flexbox 容器 |

#### Flex Direction
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `flex-row` | `flex-direction: row` | 水平排列 (預設) |
| `flex-row-reverse` | `flex-direction: row-reverse` | 水平反向排列 |
| `flex-col` | `flex-direction: column` | 垂直排列 |
| `flex-col-reverse` | `flex-direction: column-reverse` | 垂直反向排列 |

#### Flex Wrap
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `flex-wrap` | `flex-wrap: wrap` | 允許換行 |
| `flex-wrap-reverse` | `flex-wrap: wrap-reverse` | 反向換行 |
| `flex-nowrap` | `flex-wrap: nowrap` | 不換行 (預設) |

#### Justify Content (主軸對齊)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `justify-start` | `justify-content: flex-start` | 起點對齊 (預設) |
| `justify-end` | `justify-content: flex-end` | 終點對齊 |
| `justify-center` | `justify-content: center` | 置中對齊 |
| `justify-between` | `justify-content: space-between` | 兩端對齊 |
| `justify-around` | `justify-content: space-around` | 環繞對齊 |
| `justify-evenly` | `justify-content: space-evenly` | 均勻對齊 |

#### Align Items (交叉軸對齊)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `items-start` | `align-items: flex-start` | 起點對齊 |
| `items-end` | `align-items: flex-end` | 終點對齊 |
| `items-center` | `align-items: center` | 置中對齊 |
| `items-baseline` | `align-items: baseline` | 基線對齊 |
| `items-stretch` | `align-items: stretch` | 拉伸對齊 (預設) |

#### Align Content (多行對齊)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `content-start` | `align-content: flex-start` | 起點對齊 |
| `content-end` | `align-content: flex-end` | 終點對齊 |
| `content-center` | `align-content: center` | 置中對齊 |
| `content-between` | `align-content: space-between` | 兩端對齊 |
| `content-around` | `align-content: space-around` | 環繞對齊 |
| `content-stretch` | `align-content: stretch` | 拉伸對齊 (預設) |

### 子元素屬性 (Item Properties)

#### Flex Grow
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `grow` | `flex-grow: 1` | 允許增長 |
| `grow-0` | `flex-grow: 0` | 不允許增長 (預設) |

#### Flex Shrink
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `shrink` | `flex-shrink: 1` | 允許縮小 (預設) |
| `shrink-0` | `flex-shrink: 0` | 不允許縮小 |

#### Flex Basis
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `basis-0` | `flex-basis: 0` | 基礎尺寸 0 |
| `basis-auto` | `flex-basis: auto` | 自動基礎尺寸 (預設) |
| `basis-full` | `flex-basis: 100%` | 基礎尺寸 100% |

#### Flex (簡寫)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `flex-1` | `flex: 1 1 0%` | 等分增長 |
| `flex-auto` | `flex: 1 1 auto` | 自動增長 |
| `flex-initial` | `flex: 0 1 auto` | 初始設定 |
| `flex-none` | `flex: 0 0 auto` | 不增長不縮小 |

#### Align Self
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `self-auto` | `align-self: auto` | 自動對齊 (預設) |
| `self-start` | `align-self: flex-start` | 起點對齊 |
| `self-end` | `align-self: flex-end` | 終點對齊 |
| `self-center` | `align-self: center` | 置中對齊 |
| `self-stretch` | `align-self: stretch` | 拉伸對齊 |
| `self-baseline` | `align-self: baseline` | 基線對齊 |

#### Order
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `order-1` | `order: 1` | 排序 1 |
| `order-2` | `order: 2` | 排序 2 |
| `order-3` | `order: 3` | 排序 3 |
| `order-4` | `order: 4` | 排序 4 |
| `order-5` | `order: 5` | 排序 5 |
| `order-6` | `order: 6` | 排序 6 |
| `order-7` | `order: 7` | 排序 7 |
| `order-8` | `order: 8` | 排序 8 |
| `order-9` | `order: 9` | 排序 9 |
| `order-10` | `order: 10` | 排序 10 |
| `order-11` | `order: 11` | 排序 11 |
| `order-12` | `order: 12` | 排序 12 |
| `order-first` | `order: -9999` | 最前面 |
| `order-last` | `order: 9999` | 最後面 |
| `order-none` | `order: 0` | 無排序 (預設) |

## CSS Grid 格線系統 (CSS Grid System)

### 容器屬性 (Container Properties)

#### Display
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `grid` | `display: grid` | 設定為 grid 容器 |
| `inline-grid` | `display: inline-grid` | 設定為行內 grid 容器 |

#### Grid Template Columns
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `grid-cols-1` | `grid-template-columns: repeat(1, minmax(0, 1fr))` | 1 欄 |
| `grid-cols-2` | `grid-template-columns: repeat(2, minmax(0, 1fr))` | 2 欄 |
| `grid-cols-3` | `grid-template-columns: repeat(3, minmax(0, 1fr))` | 3 欄 |
| `grid-cols-4` | `grid-template-columns: repeat(4, minmax(0, 1fr))` | 4 欄 |
| `grid-cols-5` | `grid-template-columns: repeat(5, minmax(0, 1fr))` | 5 欄 |
| `grid-cols-6` | `grid-template-columns: repeat(6, minmax(0, 1fr))` | 6 欄 |
| `grid-cols-7` | `grid-template-columns: repeat(7, minmax(0, 1fr))` | 7 欄 |
| `grid-cols-8` | `grid-template-columns: repeat(8, minmax(0, 1fr))` | 8 欄 |
| `grid-cols-9` | `grid-template-columns: repeat(9, minmax(0, 1fr))` | 9 欄 |
| `grid-cols-10` | `grid-template-columns: repeat(10, minmax(0, 1fr))` | 10 欄 |
| `grid-cols-11` | `grid-template-columns: repeat(11, minmax(0, 1fr))` | 11 欄 |
| `grid-cols-12` | `grid-template-columns: repeat(12, minmax(0, 1fr))` | 12 欄 |
| `grid-cols-none` | `grid-template-columns: none` | 無欄位 |

#### Grid Template Rows
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `grid-rows-1` | `grid-template-rows: repeat(1, minmax(0, 1fr))` | 1 列 |
| `grid-rows-2` | `grid-template-rows: repeat(2, minmax(0, 1fr))` | 2 列 |
| `grid-rows-3` | `grid-template-rows: repeat(3, minmax(0, 1fr))` | 3 列 |
| `grid-rows-4` | `grid-template-rows: repeat(4, minmax(0, 1fr))` | 4 列 |
| `grid-rows-5` | `grid-template-rows: repeat(5, minmax(0, 1fr))` | 5 列 |
| `grid-rows-6` | `grid-template-rows: repeat(6, minmax(0, 1fr))` | 6 列 |
| `grid-rows-none` | `grid-template-rows: none` | 無列位 |

#### Gap (間距)
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `gap-0` | `gap: 0` | 無間距 |
| `gap-1` | `gap: 0.25rem` | 間距 4px |
| `gap-2` | `gap: 0.5rem` | 間距 8px |
| `gap-3` | `gap: 0.75rem` | 間距 12px |
| `gap-4` | `gap: 1rem` | 間距 16px |
| `gap-5` | `gap: 1.25rem` | 間距 20px |
| `gap-6` | `gap: 1.5rem` | 間距 24px |
| `gap-8` | `gap: 2rem` | 間距 32px |
| `gap-10` | `gap: 2.5rem` | 間距 40px |
| `gap-12` | `gap: 3rem` | 間距 48px |
| `gap-16` | `gap: 4rem` | 間距 64px |
| `gap-20` | `gap: 5rem` | 間距 80px |
| `gap-24` | `gap: 6rem` | 間距 96px |
| `gap-32` | `gap: 8rem` | 間距 128px |
| `gap-40` | `gap: 10rem` | 間距 160px |
| `gap-48` | `gap: 12rem` | 間距 192px |
| `gap-56` | `gap: 14rem` | 間距 224px |
| `gap-60` | `gap: 15rem` | 間距 240px |
| `gap-64` | `gap: 16rem` | 間距 256px |
| `gap-72` | `gap: 18rem` | 間距 288px |
| `gap-80` | `gap: 20rem` | 間距 320px |
| `gap-96` | `gap: 24rem` | 間距 384px |

#### Column Gap / Row Gap
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `gap-x-0` | `column-gap: 0` | 欄間距 0 |
| `gap-y-0` | `row-gap: 0` | 列間距 0 |
| `gap-x-1` | `column-gap: 0.25rem` | 欄間距 4px |
| `gap-y-1` | `row-gap: 0.25rem` | 列間距 4px |
| `gap-x-2` | `column-gap: 0.5rem` | 欄間距 8px |
| `gap-y-2` | `row-gap: 0.5rem` | 列間距 8px |
| `gap-x-4` | `column-gap: 1rem` | 欄間距 16px |
| `gap-y-4` | `row-gap: 1rem` | 列間距 16px |
| `gap-x-8` | `column-gap: 2rem` | 欄間距 32px |
| `gap-y-8` | `row-gap: 2rem` | 列間距 32px |

### 子元素屬性 (Item Properties)

#### Grid Column Start/End
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `col-start-1` | `grid-column-start: 1` | 從第 1 欄開始 |
| `col-end-1` | `grid-column-end: 1` | 到第 1 欄結束 |
| `col-start-2` | `grid-column-start: 2` | 從第 2 欄開始 |
| `col-end-2` | `grid-column-end: 2` | 到第 2 欄結束 |
| `col-start-3` | `grid-column-start: 3` | 從第 3 欄開始 |
| `col-end-3` | `grid-column-end: 3` | 到第 3 欄結束 |
| `col-start-4` | `grid-column-start: 4` | 從第 4 欄開始 |
| `col-end-4` | `grid-column-end: 4` | 到第 4 欄結束 |
| `col-start-5` | `grid-column-start: 5` | 從第 5 欄開始 |
| `col-end-5` | `grid-column-end: 5` | 到第 5 欄結束 |
| `col-start-6` | `grid-column-start: 6` | 從第 6 欄開始 |
| `col-end-6` | `grid-column-end: 6` | 到第 6 欄結束 |
| `col-start-7` | `grid-column-start: 7` | 從第 7 欄開始 |
| `col-end-7` | `grid-column-end: 7` | 到第 7 欄結束 |
| `col-start-8` | `grid-column-start: 8` | 從第 8 欄開始 |
| `col-end-8` | `grid-column-end: 8` | 到第 8 欄結束 |
| `col-start-9` | `grid-column-start: 9` | 從第 9 欄開始 |
| `col-end-9` | `grid-column-end: 9` | 到第 9 欄結束 |
| `col-start-10` | `grid-column-start: 10` | 從第 10 欄開始 |
| `col-end-10` | `grid-column-end: 10` | 到第 10 欄結束 |
| `col-start-11` | `grid-column-start: 11` | 從第 11 欄開始 |
| `col-end-11` | `grid-column-end: 11` | 到第 11 欄結束 |
| `col-start-12` | `grid-column-start: 12` | 從第 12 欄開始 |
| `col-end-12` | `grid-column-end: 12` | 到第 12 欄結束 |
| `col-start-13` | `grid-column-start: 13` | 從第 13 欄開始 |
| `col-end-13` | `grid-column-end: 13` | 到第 13 欄結束 |
| `col-start-auto` | `grid-column-start: auto` | 自動開始 |
| `col-end-auto` | `grid-column-end: auto` | 自動結束 |

#### Grid Row Start/End
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `row-start-1` | `grid-row-start: 1` | 從第 1 列開始 |
| `row-end-1` | `grid-row-end: 1` | 到第 1 列結束 |
| `row-start-2` | `grid-row-start: 2` | 從第 2 列開始 |
| `row-end-2` | `grid-row-end: 2` | 到第 2 列結束 |
| `row-start-3` | `grid-row-start: 3` | 從第 3 列開始 |
| `row-end-3` | `grid-row-end: 3` | 到第 3 列結束 |
| `row-start-4` | `grid-row-start: 4` | 從第 4 列開始 |
| `row-end-4` | `grid-row-end: 4` | 到第 4 列結束 |
| `row-start-5` | `grid-row-start: 5` | 從第 5 列開始 |
| `row-end-5` | `grid-row-end: 5` | 到第 5 列結束 |
| `row-start-6` | `grid-row-start: 6` | 從第 6 列開始 |
| `row-end-6` | `grid-row-end: 6` | 到第 6 列結束 |
| `row-start-7` | `grid-row-start: 7` | 從第 7 列開始 |
| `row-end-7` | `grid-row-end: 7` | 到第 7 列結束 |
| `row-start-auto` | `grid-row-start: auto` | 自動開始 |
| `row-end-auto` | `grid-row-end: auto` | 自動結束 |

#### Grid Column Span
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `col-span-1` | `grid-column: span 1 / span 1` | 跨越 1 欄 |
| `col-span-2` | `grid-column: span 2 / span 2` | 跨越 2 欄 |
| `col-span-3` | `grid-column: span 3 / span 3` | 跨越 3 欄 |
| `col-span-4` | `grid-column: span 4 / span 4` | 跨越 4 欄 |
| `col-span-5` | `grid-column: span 5 / span 5` | 跨越 5 欄 |
| `col-span-6` | `grid-column: span 6 / span 6` | 跨越 6 欄 |
| `col-span-7` | `grid-column: span 7 / span 7` | 跨越 7 欄 |
| `col-span-8` | `grid-column: span 8 / span 8` | 跨越 8 欄 |
| `col-span-9` | `grid-column: span 9 / span 9` | 跨越 9 欄 |
| `col-span-10` | `grid-column: span 10 / span 10` | 跨越 10 欄 |
| `col-span-11` | `grid-column: span 11 / span 11` | 跨越 11 欄 |
| `col-span-12` | `grid-column: span 12 / span 12` | 跨越 12 欄 |
| `col-span-full` | `grid-column: 1 / -1` | 跨越所有欄位 |

#### Grid Row Span
| Tailwind Class | CSS 屬性 | 說明 |
|----------------|----------|------|
| `row-span-1` | `grid-row: span 1 / span 1` | 跨越 1 列 |
| `row-span-2` | `grid-row: span 2 / span 2` | 跨越 2 列 |
| `row-span-3` | `grid-row: span 3 / span 3` | 跨越 3 列 |
| `row-span-4` | `grid-row: span 4 / span 4` | 跨越 4 列 |
| `row-span-5` | `grid-row: span 5 / span 5` | 跨越 5 列 |
| `row-span-6` | `grid-row: span 6 / span 6` | 跨越 6 列 |
| `row-span-full` | `grid-row: 1 / -1` | 跨越所有列位 |

## 自定義值 (Arbitrary Values)

Tailwind CSS 支援使用方括號語法來設定自定義的 rem 或 px 值：

### 自定義 Rem 值
```tsx
className="w-[2.5rem]"    // 2.5rem
className="h-[3.75rem]"   // 3.75rem
className="p-[1.25rem]"   // 1.25rem
```

### 自定義 Px 值
```tsx
className="w-[100px]"     // 100px
className="h-[200px]"     // 200px
className="p-[32px]"      // 32px
```

### 混合使用
```tsx
className="w-[2.5rem] h-[100px] p-[1rem]"
```

## 常用組合範例

### 響應式間距設定
```tsx
<div className="p-4 md:p-8 lg:p-12">
  {/* 
    p-4: 手機版內邊距 1rem (16px)
    md:p-8: 平板版內邊距 2rem (32px)  
    lg:p-12: 桌面版內邊距 3rem (48px)
  */}
</div>
```

### 高度設定
```tsx
<div className="min-h-[400px] md:min-h-[600px] lg:min-h-[800px]">
  {/* 
    min-h-[400px]: 手機版最小高度 400px
    md:min-h-[600px]: 平板版最小高度 600px
    lg:min-h-[800px]: 桌面版最小高度 800px
  */}
</div>
```

### 字體大小設定
```tsx
<h1 className="text-2xl md:text-4xl lg:text-6xl">
  {/* 
    text-2xl: 手機版字體大小 1.5rem (24px)
    md:text-4xl: 平板版字體大小 2.25rem (36px)
    lg:text-6xl: 桌面版字體大小 3.75rem (60px)
  */}
</h1>
```

### Flexbox 佈局範例
```tsx
<div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
  {/* 
    flex: 設定為 flexbox 容器
    flex-col: 手機版垂直排列
    md:flex-row: 平板版以上水平排列
    justify-center: 主軸置中對齊
    items-center: 交叉軸置中對齊
    gap-4: 手機版間距 1rem (16px)
    md:gap-8: 平板版以上間距 2rem (32px)
  */}
</div>
```

### Grid 佈局範例
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* 
    grid: 設定為 grid 容器
    grid-cols-1: 手機版 1 欄
    md:grid-cols-2: 平板版 2 欄
    lg:grid-cols-3: 桌面版 3 欄
    gap-4: 手機版間距 1rem (16px)
    md:gap-6: 平板版以上間距 1.5rem (24px)
  */}
</div>
```

### 複雜的 Flexbox 佈局
```tsx
<div className="flex flex-col lg:flex-row min-h-screen">
  <aside className="flex-shrink-0 w-full lg:w-64 bg-gray-100">
    {/* 側邊欄 */}
  </aside>
  <main className="flex-1 flex flex-col">
    <header className="flex-shrink-0 h-16 bg-white border-b">
      {/* 頁首 */}
    </header>
    <div className="flex-1 flex flex-col lg:flex-row">
      <section className="flex-1 p-6">
        {/* 主要內容 */}
      </section>
      <aside className="w-full lg:w-80 bg-gray-50 p-6">
        {/* 右側邊欄 */}
      </aside>
    </div>
  </main>
</div>
```

## 注意事項

1. **瀏覽器相容性**: 所有現代瀏覽器都支援 rem 單位、Flexbox 和 Grid
2. **根字體大小**: 預設情況下 1rem = 16px，但可能因使用者設定而改變
3. **響應式設計**: 使用 rem 單位可以讓元素大小根據根字體大小進行縮放
4. **效能**: rem 單位的計算效能優於 em 單位
5. **Flexbox vs Grid**: Flexbox 適合一維佈局，Grid 適合二維佈局
6. **響應式斷點**: 使用 `sm:`, `md:`, `lg:`, `xl:` 前綴來設定不同螢幕尺寸的樣式

## 參考資源

- [Tailwind CSS 官方文檔](https://tailwindcss.com/docs)
- [CSS Units 參考](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units)
- [Rem vs Em 單位比較](https://css-tricks.com/rem-vs-em/)
- [Flexbox 完整指南](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS Grid 完整指南](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

*最後更新: 2024年*
*維護者: 開發團隊*
