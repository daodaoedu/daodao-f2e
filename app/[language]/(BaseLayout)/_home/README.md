# @_home 元件 CSS 檔案結構

本目錄包含了首頁各個元件的獨立 CSS 檔案，每個元件都有自己專屬的樣式檔案，並且已經從 `@styles/` 目錄中提取了相關的樣式。

## 元件與 CSS 檔案對應

### 1. Navigation 元件
- **檔案**: `Navigation/Navbar.css`
- **樣式來源**: 
  - 自定義導航欄樣式
  - 共用按鈕樣式 (`@import '../shared/Buttons.css'`)
- **主要樣式**: 導航欄佈局、動畫效果、RWD

### 2. Hero 元件
- **檔案**: `Hero/Hero.css`
- **樣式來源**: 自定義樣式
- **主要樣式**: 主標題、裝飾元素、統計數據、RWD

### 3. Footer 元件
- **檔案**: `Footer/Footer.css`
- **樣式來源**: 自定義樣式
- **主要樣式**: 頁腳佈局、連結樣式、社交媒體圖示、RWD

### 4. PersonalityTest 元件
- **檔案**: `PersonalityTest/PersonalityTest.css`
- **樣式來源**: 自定義樣式
- **主要樣式**: 測試容器、選項樣式、按鈕效果、RWD

### 5. CallToAction 元件
- **檔案**: `CallToAction/CTASection.css`
- **樣式來源**: 自定義樣式
- **主要樣式**: CTA 區塊、按鈕樣式、漸層背景、RWD

### 6. Testimonials 元件
- **檔案**: `Testimonials/Testimonials.css`
- **樣式來源**: 
  - 從 `@styles/Marquee.css` 提取的 marquee 樣式
  - 自定義樣式
- **主要樣式**: 跑馬燈效果、卡片佈局、動畫、RWD

### 7. Plans 元件
- **檔案**: `Plans/Plans.css`
- **樣式來源**: 自定義樣式
- **主要樣式**: 方案卡片、特色標記、按鈕樣式、RWD

### 8. Functions 元件
- **檔案**: `Functions/Functions.css`
- **樣式來源**: 
  - 從 `@styles/Carousel.css` 提取的 carousel 樣式
  - 自定義樣式
- **主要樣式**: 功能卡片、輪播效果、懸停動畫、RWD

### 9. Videos 元件
- **檔案**: `Videos/Videos.css`
- **樣式來源**: 自定義樣式
- **主要樣式**: 影片縮圖、播放按鈕、卡片佈局、RWD

### 10. BubbleDialog 元件
- **檔案**: `BubbleDialog/BubbleDialog.css`
- **樣式來源**: 自定義樣式
- **主要樣式**: 氣泡對話框、觸發按鈕、動畫效果、RWD

### 11. Presentation 元件
- **檔案**: `Presentation/Presentation.css`
- **樣式來源**: 自定義樣式
- **主要樣式**: 展示卡片、圖示樣式、特色列表、RWD

### 12. Features 元件
- **檔案**: `Features/Features.css`
- **樣式來源**: 自定義樣式
- **主要樣式**: 功能網格、卡片動畫、圖示效果、RWD

### 13. Slogan 元件
- **檔案**: `Slogan/Slogan.css`
- **樣式來源**: 自定義樣式
- **主要樣式**: 標語區塊、漸層文字、按鈕樣式、RWD

### 14. Loader 元件
- **檔案**: `Loader/Loader.css`
- **樣式來源**: 
  - 從 `@styles/Loader.css` 提取的樣式
  - 自定義樣式
- **主要樣式**: 載入動畫、進度條、淡出效果、RWD

## 共用樣式

### Buttons.css
- **位置**: `shared/Buttons.css`
- **樣式來源**: 從 `@styles/All.css` 提取
- **包含樣式**: 
  - 基礎按鈕樣式 (`.btn`)
  - 橙色按鈕 (`.btn-orange`)
  - 綠色按鈕 (`.btn-green`)
  - 尺寸變體 (`.btn-small`, `.btn-large`)
  - 動畫效果 (`.jelly`, `.rotate`)

## 樣式遷移說明

### 從 @styles/ 提取的樣式
1. **All.css** → **Buttons.css** (共用按鈕樣式)
2. **Marquee.css** → **Testimonials.css** (跑馬燈效果)
3. **Carousel.css** → **Functions.css** (輪播效果)
4. **Loader.css** → **Loader.css** (載入動畫)

### 自定義樣式
- 每個元件都有專屬的樣式定義
- 包含佈局、顏色、動畫、RWD 等
- 遵循設計系統的顏色和間距規範

## 使用方式

每個元件都會自動導入對應的 CSS 檔案：

```tsx
import './ComponentName.css';
```

共用樣式通過 `@import` 導入：

```css
@import '../shared/Buttons.css';
```

## 維護注意事項

1. **新增樣式**: 在對應元件的 CSS 檔案中添加
2. **修改共用樣式**: 在 `shared/Buttons.css` 中修改
3. **樣式衝突**: 使用更具體的選擇器避免衝突
4. **RWD**: 每個元件都包含響應式設計
5. **動畫**: 使用 CSS 動畫提升使用者體驗

## 設計系統

- **主色**: `#16B9B3` (綠色)
- **輔色**: `#FFA10B` (橙色)
- **文字色**: `#1f2937` (深灰)
- **背景色**: `#f8fafc` (淺灰)
- **圓角**: `16px` (卡片), `20px` (按鈕)
- **陰影**: 使用 Tailwind CSS 的陰影系統
