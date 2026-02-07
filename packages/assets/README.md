# @daodao/assets

Shared assets (images, icons, etc.) for DaoDao monorepo

## SVG 元件匯出

此套件現在支援將 SVG 檔案自動轉換為 React 元件。

### 建置

執行以下指令將 SVG 檔案轉換為 React 元件：

```bash
pnpm build:svg
# 或
pnpm build
```

建置腳本會：
1. 掃描 `images/` 目錄下的所有 SVG 檔案
2. 將每個 SVG 轉換為 React 元件，儲存到 `src/images/` 目錄
3. 產生 `src/index.ts` 檔案，匯出所有元件

### 使用方式

#### 方式 1: 從原始路徑匯入（推薦）

```tsx
import HorizontalFullLight from "@daodao/assets/images/brand/horizontal-full-light.svg";

function MyComponent() {
  return <HorizontalFullLight className="w-40" />;
}
```

#### 方式 2: 從主入口匯入

```tsx
import { HorizontalPrimaryLogo } from "@daodao/assets";

function MyComponent() {
  return <HorizontalPrimaryLogo className="w-40" />;
}
```

### 元件命名規則

SVG 檔案名稱會自動轉換為 PascalCase 元件名稱：
- `horizontal-full-light.svg` → `HorizontalFullLight`
- `active-shaper.svg` → `ActiveShaper`
- `share_windows.svg` → `ShareWindows`

### 注意事項

- `src/` 目錄是自動產生的，不應手動編輯
- 修改 SVG 檔案後需要重新執行 `pnpm build:svg`
- 產生的元件支援所有標準的 SVG 屬性（如 `className`, `style` 等）
