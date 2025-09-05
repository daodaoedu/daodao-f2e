# Home Page 重構計劃

## 現狀分析

### 當前 Home Page 結構
目前的 home page (`app/[language]/(BaseLayout)/page.tsx`) 是一個簡單的頁面，包含：
- Navbar 組件
- KeyVision 組件  
- Footer 組件
- 基本的 CSS 樣式引入

### 參考架構：Learning Marathons 頁面
學習馬拉松頁面 (`app/[language]/(BaseLayout)/learning-marathons/[season]/`) 提供了良好的架構參考：

```
learning-marathons/
├── [season]/
│   ├── layout.tsx          # 季節特定的 layout
│   ├── page.tsx            # 動態路由頁面
│   ├── _2025S1/            # 2025春季賽特定組件
│   │   ├── Banner2025S1.tsx
│   │   ├── Marathon2025S1.tsx
│   │   ├── Pricing.tsx
│   │   ├── FAQ.tsx
│   │   └── ... (其他組件)
│   └── _shared/            # 共用組件
│       └── Nav.tsx
```

## 重構目標架構

### 1. 目錄結構重組
```
app/[language]/(BaseLayout)/
├── page.tsx                    # Home page 主頁面
├── _home/                      # Home page 專用組件
│   ├── Navigation/             # 導航組件
│   │   ├── Navbar.tsx         # 桌面版導航
│   │   ├── MobileMenu.tsx     # 移動端選單
│   │   └── index.ts
│   ├── Hero/                  # 主要視覺區域
│   │   ├── HeroBanner.tsx
│   │   ├── HeroContent.tsx
│   │   └── index.ts
│   ├── Features/              # 功能特色區塊
│   │   ├── FeatureCard.tsx
│   │   ├── FeatureGrid.tsx
│   │   └── index.ts
│   ├── HowItWorks/            # 使用方式說明
│   │   ├── StepCard.tsx
│   │   ├── StepFlow.tsx
│   │   └── index.ts
│   ├── Testimonials/          # 用戶見證
│   │   ├── TestimonialCard.tsx
│   │   ├── TestimonialSlider.tsx
│   │   └── index.ts
│   ├── CallToAction/          # 行動召喚
│   │   ├── CTASection.tsx
│   │   └── index.ts
│   └── index.ts               # 組件統一導出
├── _home/hooks/               # Home page 專用 hooks
│   ├── useHeroAnimation.ts
│   ├── useFeatureVisibility.ts
│   └── index.ts
└── _home/constants/           # Home page 專用常數
    ├── features.ts
    ├── testimonials.ts
    └── index.ts
```

### 2. 組件職責分離
- **Navigation 區域**: 響應式導航，包含桌面版導航和移動端漢堡選單
- **Hero 區域**: 主要視覺衝擊，包含標題、副標題、主要 CTA 按鈕
- **Features 區域**: 展示平台核心功能特色
- **How It Works**: 說明用戶如何使用平台
- **Testimonials**: 展示用戶成功案例
- **Call to Action**: 引導用戶註冊或開始使用

### 3. 響應式設計
- 支援桌面、平板、手機三種螢幕尺寸
- 使用 Tailwind CSS 的響應式類別
- 圖片資源針對不同螢幕尺寸優化

## 重構實施步驟

### 第一階段：基礎架構建立
1. **創建目錄結構**
   - 建立 `_home/` 目錄（遵循現有命名慣例）
   - 建立 `_home/Navigation/` 目錄
   - 建立 `_home/Hero/` 目錄
   - 建立 `_home/hooks/` 目錄  
   - 建立 `_home/constants/` 目錄

2. **遷移現有組件**
   - 將 `KeyVision` 組件遷移到 `_home/Hero/`
   - 重構為 `HeroBanner` 和 `HeroContent`
   - 將 `Navbar` 組件遷移到 `_home/Navigation/`
   - 重構為響應式導航組件

3. **建立組件索引**
   - 每個目錄建立 `index.ts` 統一導出

### 第二階段：組件開發
1. **Navigation 組件重構**（以 Navbar.tsx 為範例）
   - **現狀分析**：
     ```tsx
     // 當前 Navbar.tsx 問題：
     // 1. 使用舊版 CSS 類別 (navbar, d-flex, align-items-center)
     // 2. 使用自定義按鈕樣式 (btn btn-orange btn-small)
     // 3. 缺少響應式設計
     // 4. 使用 href="#top" 而非 Next.js Link
     ```
   
   - **重構目標**：
     ```tsx
     // 目標：使用 shadcn/ui + Tailwind CSS
     // 1. 替換為 shadcn/ui Button 組件
     // 2. 使用 Tailwind CSS 響應式類別
     // 3. 實現移動端漢堡選單
     // 4. 使用 Next.js Link 組件
     ```
   
   - **實施步驟**：
     ```tsx
     // Step 1: 更新 import 和組件結構
     import { Button } from '@/components/ui/button';
     import Link from 'next/link';
     import { Menu, X } from 'lucide-react';
     
     // Step 2: 重構樣式系統
     // 從: className="navbar d-flex align-items-center"
     // 到: className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b"
     
     // Step 3: 實現響應式導航
     // 桌面版：水平排列
     // 移動版：漢堡選單 + 抽屜式導航
     ```

2. **Hero 組件**
   - 實現響應式 banner
   - 添加動畫效果
   - 整合 CTA 按鈕

3. **Features 組件**
   - 設計功能特色卡片
   - 實現網格佈局
   - 添加圖標和描述

4. **How It Works 組件**
   - 設計步驟流程
   - 實現步驟卡片
   - 添加進度指示器

5. **Testimonials 組件**
   - 設計見證卡片
   - 實現輪播功能
   - 添加用戶頭像和評分

6. **Call to Action 組件**
   - 設計行動召喚區域
   - 整合註冊/登入按鈕
   - 添加激勵文案

### 第三階段：優化與整合
1. **性能優化**
   - 圖片懶加載
   - 組件懶加載
   - 動畫性能優化

2. **SEO 優化**
   - 添加語義化標籤
   - 優化圖片 alt 文字
   - 添加結構化資料

3. **無障礙性**
   - 鍵盤導航支援
   - 螢幕閱讀器支援
   - 色彩對比度檢查

## 技術實現細節

### 1. 組件設計原則
- 使用 shadcn/ui 元件庫
- 遵循 React 最佳實踐
- 實現組件可重用性

### 2. Navigation 組件重構範例
以 `Navbar.tsx` 為例，展示從舊架構到新架構的轉換：

**重構前（現狀）**：
```tsx
// 問題：使用舊版 CSS 類別和自定義樣式
<nav className="navbar d-flex align-items-center revealable is-visible">
  <div className="logo">
    <a href="#top"><img src={Logo} alt="回到首頁" /></a>
  </div>
  <div className="button-group">
    <div className="navbar-item">
      <a href="#feature" className="scroll-link">解決困境</a>
    </div>
    <button type="button" className="btn btn-orange btn-small">立即加入</button>
  </div>
</nav>
```

**重構後（目標）**：
```tsx
// 使用 shadcn/ui + Tailwind CSS + Next.js Link
<nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <div className="flex-shrink-0">
        <Link href="/" className="flex items-center">
          <Image src={Logo} alt="回到首頁" width={120} height={32} />
        </Link>
      </div>
      
      {/* 桌面版導航 */}
      <div className="hidden md:block">
        <div className="ml-10 flex items-baseline space-x-4">
          <Link href="#feature" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
            解決困境
          </Link>
          <Link href="#functions" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
            功能生態
          </Link>
          <Link href="#plans" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
            方案
          </Link>
          <Button variant="default" size="sm" className="ml-4">
            立即加入
          </Button>
        </div>
      </div>
      
      {/* 移動端漢堡選單 */}
      <div className="md:hidden">
        <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </div>
  </div>
</nav>
```

**重構要點**：
1. **樣式系統**：從自定義 CSS 類別轉換為 Tailwind CSS
2. **組件庫**：從自定義按鈕轉換為 shadcn/ui Button 組件
3. **路由系統**：從 `href="#top"` 轉換為 Next.js Link 組件
4. **響應式設計**：添加移動端漢堡選單和抽屜式導航
5. **無障礙性**：改善鍵盤導航和螢幕閱讀器支援

### 3. 狀態管理
- 使用 React hooks 管理本地狀態
- 避免過度複雜的狀態管理
- 保持組件間低耦合

### 4. 樣式管理
- 使用 Tailwind CSS 進行樣式設計
- 建立設計系統和組件變體
- 實現主題切換支援

### 5. 動畫效果
- 使用 CSS transitions 和 transforms
- 實現滾動觸發動畫
- 添加微互動效果

## 檔案遷移計劃

### 需要遷移的檔案
- `components/Home/Keyvision/index.jsx` → `app/[language]/(BaseLayout)/_home/Hero/`
- `components/Home/Banner/` → 整合到 Hero 組件
- `components/Home/About/` → 整合到 Features 組件
- `app/[language]/(BaseLayout)/_home/Navbar.tsx` → `app/[language]/(BaseLayout)/_home/Navigation/`

### 需要創建的新檔案
- `app/[language]/(BaseLayout)/_home/Navigation/Navbar.tsx` (重構後的導航組件)
- `app/[language]/(BaseLayout)/_home/Navigation/MobileMenu.tsx` (移動端選單)
- `app/[language]/(BaseLayout)/_home/Hero/HeroBanner.tsx`
- `app/[language]/(BaseLayout)/_home/Hero/HeroContent.tsx`
- `app/[language]/(BaseLayout)/_home/Features/FeatureCard.tsx`
- `app/[language]/(BaseLayout)/_home/Features/FeatureGrid.tsx`
- `app/[language]/(BaseLayout)/_home/HowItWorks/StepCard.tsx`
- `app/[language]/(BaseLayout)/_home/HowItWorks/StepFlow.tsx`
- `app/[language]/(BaseLayout)/_home/Testimonials/TestimonialCard.tsx`
- `app/[language]/(BaseLayout)/_home/Testimonials/TestimonialSlider.tsx`
- `app/[language]/(BaseLayout)/_home/CallToAction/CTASection.tsx`

### 需要更新的檔案
- `app/[language]/(BaseLayout)/page.tsx` - 重構主頁面
- `constants/` - 添加 home page 相關常數
- `tailwind.config.ts` - 添加新的設計 token

## 品質保證

### 1. 程式碼品質
- 遵循 ESLint 規則
- 使用 TypeScript 進行類型檢查
- 實現組件單元測試

### 2. 設計品質
- 遵循設計系統規範
- 確保視覺一致性
- 實現響應式設計

### 3. 性能品質
- 實現組件懶加載
- 優化圖片資源
- 監控 Core Web Vitals

## 時間規劃

### 第一週：基礎架構
- 建立目錄結構
- 遷移現有組件
- 建立組件索引
- **重點任務**：重構 Navigation 組件（以 Navbar.tsx 為範例）

### 第二週：核心組件開發
- 開發 Hero 組件
- 開發 Features 組件
- 開發 How It Works 組件
- **重點任務**：完成響應式導航和主要視覺區域

### 第三週：輔助組件開發
- 開發 Testimonials 組件
- 開發 Call to Action 組件
- 整合所有組件
- **重點任務**：實現完整的功能特色展示

### 第四週：優化與測試
- 性能優化
- SEO 優化
- 無障礙性測試
- 跨瀏覽器測試
- **重點任務**：確保所有組件在不同設備上的表現

## 風險評估

### 1. 技術風險
- 組件間依賴關係複雜化
- 性能下降風險
- 瀏覽器相容性問題

### 2. 緩解措施
- 保持組件低耦合
- 實現組件懶加載
- 進行跨瀏覽器測試

### 3. 回滾計劃
- 保留原始組件備份
- 實現功能開關
- 準備快速回滾腳本

## 成功指標

### 1. 技術指標
- 頁面載入時間 < 3 秒
- Core Web Vitals 達標
- 組件重用率 > 80%

### 2. 用戶體驗指標
- 頁面跳出率降低
- 用戶停留時間增加
- 轉換率提升

### 3. 維護性指標
- 組件耦合度降低
- 程式碼重複率降低
- 開發效率提升

## 具體實施範例：Navigation 組件重構

### 步驟 1：創建目錄結構
```bash
mkdir -p app/[language]/\(BaseLayout\)/_home/Navigation
mkdir -p app/[language]/\(BaseLayout\)/_home/hooks
mkdir -p app/[language]/\(BaseLayout\)/_home/constants
```

### 步驟 2：重構 Navbar 組件
**檔案路徑**：`app/[language]/(BaseLayout)/_home/Navigation/Navbar.tsx`

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import Logo from '@/public/assets/landing-page/logo.svg';
import { cn } from '@/utils/cn';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image src={Logo} alt="回到首頁" width={120} height={32} />
              </Link>
            </div>
            
            {/* 桌面版導航 */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link 
                  href="#feature" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  解決困境
                </Link>
                <Link 
                  href="#functions" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  功能生態
                </Link>
                <Link 
                  href="#plans" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  方案
                </Link>
                <Button variant="default" size="sm" className="ml-4">
                  立即加入
                </Button>
              </div>
            </div>
            
            {/* 移動端漢堡選單 */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setMobileMenuOpen(true)}
                className="p-2"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 移動端選單 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">選單</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <Link 
                href="#feature" 
                className="block text-gray-700 hover:text-primary-600 py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                解決困境
              </Link>
              <Link 
                href="#functions" 
                className="block text-gray-700 hover:text-primary-600 py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                功能生態
              </Link>
              <Link 
                href="#plans" 
                className="block text-gray-700 hover:text-primary-600 py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                方案
              </Link>
              <Button variant="default" className="w-full mt-6">
                立即加入
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

### 步驟 3：創建組件索引
**檔案路徑**：`app/[language]/(BaseLayout)/_home/Navigation/index.ts`

```tsx
export { default as Navbar } from './Navbar';
```

### 步驟 4：更新主頁面
**檔案路徑**：`app/[language]/(BaseLayout)/page.tsx`

```tsx
import { Navbar } from './_home/Navigation';
import { Hero } from './_home/Hero';
import { Features } from './_home/Features';
import { HowItWorks } from './_home/HowItWorks';
import { Testimonials } from './_home/Testimonials';
import { CallToAction } from './_home/CallToAction';
import Footer from './_home/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16"> {/* 為固定導航留出空間 */}
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
```

### 步驟 5：創建相關 hooks
**檔案路徑**：`app/[language]/(BaseLayout)/_home/hooks/useScrollVisibility.ts`

```tsx
import { useState, useEffect } from 'react';

export function useScrollVisibility() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return isVisible;
}
```

## 重構效果對比

### 重構前
- ❌ 使用舊版 CSS 類別
- ❌ 缺少響應式設計
- ❌ 使用自定義按鈕樣式
- ❌ 缺少移動端支援
- ❌ 使用 href="#top" 而非 Next.js Link

### 重構後
- ✅ 使用 Tailwind CSS 響應式類別
- ✅ 完整的響應式設計
- ✅ 使用 shadcn/ui Button 組件
- ✅ 移動端漢堡選單
- ✅ 使用 Next.js Link 組件
- ✅ 改善的無障礙性
- ✅ 平滑的動畫效果

## 結論

本重構計劃將 home page 從簡單的靜態頁面轉變為功能豐富、結構清晰的現代化頁面。通過組件化設計、響應式佈局和性能優化，提升用戶體驗和開發效率。重構過程將分階段進行，確保系統穩定性和用戶體驗的連續性。

**關鍵成功因素**：
1. **漸進式重構**：從 Navigation 組件開始，逐步重構其他組件
2. **技術標準化**：統一使用 shadcn/ui + Tailwind CSS + Next.js
3. **響應式優先**：確保在所有設備上的最佳體驗
4. **組件可重用性**：建立可維護和可擴展的組件架構
