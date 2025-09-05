# SectionHeader 組件重構總結

## 重構目標

將首頁各區塊中重複出現的標題組合抽象成一個可重用的元件，提高代碼的一致性和可維護性。

## 重構前的情況

在重構前，各個組件都有類似的標題結構：

```tsx
// FeatureGrid.tsx
<div className="text-center mb-16">
  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
    告別三大學習困境
  </h2>
  <h3 className="text-lg text-gray-600 max-w-2xl mx-auto">
    從學習痛點到美好體驗，讓每一步成長都看得見
  </h3>
</div>

// SloganSection.tsx
<div className="mx-auto max-w-[750px] lg:ml-56 lg:mr-12 xl:mx-auto text-center">
  <h2 className="slogan-title text-2xl md:text-3xl font-bold text-basic-500 mb-6 text-primary-darker">
    每個人都有自己的學習小島，透過交流與分享，連結成群島
  </h2>
  <h3 className="slogan-subtitle text-lg md:text-xl text-basic-400 mb-8 italic">
    Where personal growth meets collective wisdom!
  </h3>
</div>

// FunctionCarousel.tsx
<div className="text-teal-800 py-15 px-6 pb-10 text-center">
  <h2 className="text-2xl md:text-3xl font-semibold mb-2">
    學習群島上的功能生態
  </h2>
</div>
```

## 重構後的成果

### 1. 創建了 SectionHeader 組件

位置：`app/[language]/(BaseLayout)/SectionHeader.tsx`

**特性：**
- 支持多種顏色變體（default, light, dark, primary）
- 支持多種尺寸（sm, md, lg, xl）
- 支持多種對齊方式（left, center, right）
- 可選的副標題顯示
- 完全可自定義的樣式覆蓋
- **統一的標題顏色系統**：標題和副標題都使用 `primary-darker` (#295E5C)

**Props 接口：**
```typescript
interface SectionHeaderProps {
  title: string;                    // 主要標題
  subtitle?: string;                // 副標題（可選）
  variant?: 'default' | 'light' | 'dark' | 'primary';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alignment?: 'left' | 'center' | 'right';
  showSubtitle?: boolean;           // 是否顯示副標題
  className?: string;               // 容器樣式
  titleClassName?: string;          // 標題樣式
  subtitleClassName?: string;       // 副標題樣式
}
```

### 2. 更新了多個組件

#### FeatureGrid.tsx
```tsx
<SectionHeader
  title="告別三大學習困境"
  subtitle="從學習痛點到美好體驗，讓每一步成長都看得見"
  variant="default"
  size="lg"
  alignment="center"
/>
```

#### SloganSection.tsx
```tsx
<SectionHeader
  title="每個人都有自己的學習小島，透過交流與分享，連結成群島"
  subtitle="Where personal growth meets collective wisdom!"
  variant="primary"
  size="md"
  alignment="center"
  titleClassName="text-primary-darker"
  subtitleClassName="text-basic-400 italic"
/>
```

#### FunctionCarousel.tsx
```tsx
<SectionHeader
  title="學習群島上的功能生態"
  variant="dark"
  size="md"
  alignment="center"
  showSubtitle={false}
  className="text-teal-800"
/>
```

#### PlanSection.tsx
```tsx
<SectionHeader
  title="加入島島阿學"
  subtitle="搶先體驗完整學習平台，與我們一起打造更好的學習體驗"
  variant="default"
  size="lg"
  alignment="center"
/>
```

#### CTASection.tsx
```tsx
<SectionHeader
  title="準備好重新打造你喜歡的學習生活了嗎？"
  variant="light"
  size="lg"
  alignment="center"
  showSubtitle={false}
  className="text-white"
/>
```

#### PersonalitySection.tsx
```tsx
<SectionHeader
  title="了解你的學習偏好，獲得個人化的學習建議和推薦路徑"
  variant="dark"
  size="lg"
  alignment="center"
  showSubtitle={false}
  titleClassName="text-gray-800 leading-tight"
/>
```

## 重構的好處

### 1. 代碼一致性
- 所有標題都使用相同的組件結構
- 統一的樣式系統和間距
- 一致的響應式行為
- **統一的顏色系統**：標題和副標題都使用 `primary-darker` (#295E5C)

### 2. 可維護性
- 樣式修改只需要在一個地方進行
- 新增標題變體或樣式更容易
- 減少了重複代碼
- **顏色管理集中化**：標題和副標題顏色統一管理，便於品牌一致性維護

### 3. 靈活性
- 支持多種變體和尺寸
- 可以輕鬆調整對齊方式
- 支持自定義樣式覆蓋
- **智能顏色選擇**：不同變體自動選擇合適的顏色組合

### 4. 開發效率
- 新組件可以快速使用標準標題
- 不需要重複寫標題的 HTML 結構
- 支持 TypeScript 類型檢查
- **設計系統化**：標題樣式成為可重用的設計組件

## 顏色系統設計

### 主要顏色
- **primary-darker**: `#295E5C` - 標題和副標題的主要顏色（深綠色）
- **white**: `#FFFFFF` - 淺色變體的標題和副標題顏色

### 變體顏色邏輯
- **default**: 標題和副標題都使用 `primary-darker` (#295E5C)
- **light**: 標題和副標題都使用 `white`（適用於深色背景）
- **dark**: 標題和副標題都使用 `primary-darker` (#295E5C)（適用於淺色背景）
- **primary**: 標題和副標題都使用 `primary-darker` (#295E5C)（強調品牌色）

### 顏色一致性原則
- **視覺和諧**：標題和副標題使用相同顏色，創造統一的視覺體驗
- **層次清晰**：通過字體大小和粗細來區分標題層級，而非顏色差異
- **品牌統一**：所有文字都使用品牌色彩，強化品牌識別度

## 使用指南

### 基本用法
```tsx
import { SectionHeader } from '@/app/[language]/(BaseLayout)/SectionHeader';

<SectionHeader
  title="標題文字"
  subtitle="副標題文字"
/>
```

### 只顯示標題
```tsx
<SectionHeader
  title="只有標題"
  showSubtitle={false}
/>
```

### 自定義樣式
```tsx
<SectionHeader
  title="自定義樣式"
  subtitle="自定義副標題"
  variant="primary"
  size="xl"
  alignment="left"
  titleClassName="text-blue-600"
  subtitleClassName="text-blue-400 italic"
  className="bg-gray-50 p-8 rounded-lg"
/>
```

## 響應式設計

所有尺寸都支持響應式斷點：
- `sm`: `text-2xl md:text-3xl`
- `md`: `text-2xl md:text-3xl`
- `lg`: `text-3xl md:text-4xl`
- `xl`: `text-4xl md:text-5xl`

## 未來擴展

可以考慮添加的功能：
1. 動畫效果（如 fade-in, slide-in 等）
2. 更多的顏色變體
3. 圖標支持
4. 更豐富的佈局選項
5. **主題切換支持**：支持亮色/暗色主題的自動切換
6. **顏色漸變**：支持標題和副標題的顏色漸變效果

## 總結

通過這次重構，我們成功地：
1. 消除了重複的標題代碼
2. 創建了一個靈活且可重用的標題組件
3. 提高了代碼的一致性和可維護性
4. 為未來的開發提供了標準化的標題解決方案
5. **建立了統一的顏色系統**：標題和副標題都使用一致的品牌顏色 `primary-darker` (#295E5C)
6. **實現了視覺和諧**：標題和副標題顏色統一，創造更好的視覺體驗

這個組件現在可以在整個應用中使用，確保所有頁面的標題都有一致的外觀和行為，同時維護了品牌色彩的一致性和視覺層次的和諧性。
