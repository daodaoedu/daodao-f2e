# SectionHeader 組件

一個可重用的區塊標題元件，支持不同的變體、樣式和佈局，適用於各種頁面區塊的標題展示。

## 基本用法

```tsx
import { SectionHeader } from '@/app/[language]/(BaseLayout)/SectionHeader';

// 基本用法
<SectionHeader
  title="標題文字"
  subtitle="副標題文字"
/>

// 只顯示標題
<SectionHeader
  title="只有標題"
  showSubtitle={false}
/>
```

## Props

| Prop | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `title` | `string` | - | 主要標題文字（必填） |
| `subtitle` | `string` | - | 副標題文字（可選） |
| `variant` | `'default' \| 'light' \| 'dark' \| 'primary'` | `'default'` | 顏色變體 |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'lg'` | 標題大小 |
| `alignment` | `'left' \| 'center' \| 'right'` | `'center'` | 文字對齊方式 |
| `showSubtitle` | `boolean` | `true` | 是否顯示副標題 |
| `className` | `string` | - | 容器額外樣式 |
| `titleClassName` | `string` | - | 標題額外樣式 |
| `subtitleClassName` | `string` | - | 副標題額外樣式 |

## 變體 (Variants)

### default
- 標題：`text-primary-darker` (#295E5C)
- 副標題：`text-primary-darker` (#295E5C)

### light
- 標題：`text-white`
- 副標題：`text-white`

### dark
- 標題：`text-primary-darker` (#295E5C)
- 副標題：`text-primary-darker` (#295E5C)

### primary
- 標題：`text-primary-darker` (#295E5C)
- 副標題：`text-primary-darker` (#295E5C)

## 尺寸 (Sizes)

### sm
- 標題：`text-2xl md:text-3xl`
- 副標題：`text-base md:text-lg`
- 間距：`mb-8`

### md
- 標題：`text-2xl md:text-3xl`
- 副標題：`text-lg md:text-xl`
- 間距：`mb-12`

### lg
- 標題：`text-3xl md:text-4xl`
- 副標題：`text-lg md:text-xl`
- 間距：`mb-16`

### xl
- 標題：`text-4xl md:text-5xl`
- 副標題：`text-xl md:text-2xl`
- 間距：`mb-20`

## 使用範例

### 1. 基本區塊標題
```tsx
<SectionHeader
  title="告別三大學習困境"
  subtitle="從學習痛點到美好體驗，讓每一步成長都看得見"
  variant="default"
  size="lg"
  alignment="center"
/>
```

### 2. 淺色背景上的標題
```tsx
<SectionHeader
  title="每個人都有自己的學習小島"
  subtitle="透過交流與分享，連結成群島"
  variant="light"
  size="md"
  alignment="center"
/>
```

### 3. 只有標題的區塊
```tsx
<SectionHeader
  title="學習群島上的功能生態"
  variant="dark"
  size="md"
  alignment="center"
  showSubtitle={false}
/>
```

### 4. 左對齊的標題
```tsx
<SectionHeader
  title="左對齊標題"
  subtitle="左對齊副標題"
  variant="default"
  size="lg"
  alignment="left"
/>
```

### 5. 自定義樣式
```tsx
<SectionHeader
  title="自定義樣式標題"
  subtitle="自定義樣式副標題"
  variant="primary"
  size="xl"
  alignment="center"
  titleClassName="text-blue-600"
  subtitleClassName="text-blue-400 italic"
  className="bg-gray-50 p-8 rounded-lg"
/>
```

## 響應式設計

- 所有尺寸都支持響應式斷點（`md:` 前綴）
- 標題和副標題在不同螢幕尺寸下會自動調整大小
- 間距會根據尺寸自動調整

## 樣式覆蓋

組件使用 `cn()` 工具函數來合併樣式，支持：
- 通過 `className` 覆蓋容器樣式
- 通過 `titleClassName` 覆蓋標題樣式
- 通過 `subtitleClassName` 覆蓋副標題樣式

## 顏色系統

組件使用專案定義的顏色系統：
- **primary-darker**: `#295E5C` - 標題和副標題的主要顏色（深綠色）
- **white**: `#FFFFFF` - 淺色變體的標題和副標題顏色

### 顏色一致性設計
- 所有變體中，標題和副標題都使用相同的顏色
- 確保視覺層次的一致性
- 支持通過 `titleClassName` 和 `subtitleClassName` 進行個別樣式覆蓋

## 最佳實踐

1. **一致性**：在整個應用中使用相同的變體和尺寸來保持視覺一致性
2. **語義化**：使用適當的標題層級（h2, h3）來維護頁面結構
3. **可讀性**：確保標題和副標題的對比度符合無障礙標準
4. **響應式**：測試在不同螢幕尺寸下的顯示效果
5. **顏色統一**：標題和副標題使用相同顏色，保持視覺和諧
