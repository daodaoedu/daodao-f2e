# 學習馬拉松頁面重構計劃

## 概述

本文件說明如何將 `app/[language]/(BaseLayout)/learning-marathons/[season]/_2025S1/Equipment.tsx` 頁面及相關檔案重構成符合專案架構需求的格式。

## 現況分析

### 當前檔案結構
```
app/[language]/(BaseLayout)/learning-marathons/
├── [season]/
│   ├── layout.tsx                    # 季節別 layout
│   ├── page.tsx                      # 季節別頁面路由
│   ├── _2025S1/                      # 2025春季特定內容
│   │   ├── Equipment.tsx             # 裝備展示組件
│   │   ├── Marathon2025S1.tsx        # 主要頁面組件
│   │   ├── Banner2025S1.tsx          # 橫幅組件
│   │   ├── Sidebar.tsx               # 側邊欄組件
│   │   ├── Participant.tsx           # 參與者組件
│   │   ├── Spotlight.tsx             # 亮點組件
│   │   ├── ApplicationInfo.tsx       # 申請資訊組件
│   │   ├── Mentors.tsx               # 導師組件
│   │   ├── Pricing.tsx               # 價格組件
│   │   ├── FAQ.tsx                   # FAQ組件
│   │   ├── ApplyButton.tsx           # 申請按鈕組件
│   │   └── Styled.tsx                # 樣式組件
│   └── _shared/                      # 共用組件
│       └── Nav.tsx                   # 導航組件
```

### 問題分析

1. **違反依賴原則**: 頁面組件直接放在 `app/` 目錄下，違反了專案重構規則
2. **商業邏輯混雜**: 頁面組件包含了過多的商業邏輯，應該委託給 features
3. **組件職責不清**: 每個組件都包含了特定的商業邏輯，應該分離到 features 層級
4. **缺乏類型定義**: 沒有統一的類型定義和 schema 驗證

## 重構目標架構

### 1. Features 層級重構

```
features/
├── marathon/                          # 學習馬拉松功能模組
│   ├── components/                    # 功能相關組件
│   │   ├── Equipment/                 # 裝備相關組件
│   │   │   ├── EquipmentCard.tsx      # 裝備卡片組件
│   │   │   ├── EquipmentGrid.tsx      # 裝備網格組件
│   │   │   └── index.ts               # 組件導出
│   │   ├── MarathonInfo/              # 馬拉松資訊組件
│   │   │   ├── MarathonIntro.tsx      # 活動介紹組件
│   │   │   ├── MarathonWho.tsx        # 適合對象組件
│   │   │   ├── MarathonHow.tsx        # 進行方式組件
│   │   │   ├── MarathonBenefit.tsx    # 預期收穫組件
│   │   │   ├── MarathonApply.tsx      # 申請方式組件
│   │   │   ├── MarathonPrice.tsx      # 價格資訊組件
│   │   │   ├── MarathonFAQ.tsx        # FAQ組件
│   │   │   ├── MarathonOrganizer.tsx  # 主辦單位組件
│   │   │   └── index.ts               # 組件導出
│   │   ├── Banner/                    # 橫幅組件
│   │   │   ├── MarathonBanner.tsx     # 馬拉松橫幅組件
│   │   │   └── index.ts               # 組件導出
│   │   ├── Sidebar/                   # 側邊欄組件
│   │   │   ├── MarathonSidebar.tsx    # 馬拉松側邊欄組件
│   │   │   └── index.ts               # 組件導出
│   │   ├── Mentors/                   # 導師組件
│   │   │   ├── MentorCard.tsx         # 導師卡片組件
│   │   │   ├── MentorList.tsx         # 導師列表組件
│   │   │   └── index.ts               # 組件導出
│   │   ├── Participants/              # 參與者組件
│   │   │   ├── ParticipantCard.tsx    # 參與者卡片組件
│   │   │   └── index.ts               # 組件導出
│   │   ├── Pricing/                   # 價格組件
│   │   │   ├── PricingCard.tsx        # 價格卡片組件
│   │   │   └── index.ts               # 組件導出
│   │   ├── FAQ/                       # FAQ組件
│   │   │   ├── FAQItem.tsx            # FAQ項目組件
│   │   │   ├── FAQList.tsx            # FAQ列表組件
│   │   │   └── index.ts               # 組件導出
│   │   ├── Application/               # 申請相關組件
│   │   │   ├── ApplyButton.tsx        # 申請按鈕組件
│   │   │   ├── ApplicationInfo.tsx    # 申請資訊組件
│   │   │   └── index.ts               # 組件導出
│   │   └── index.ts                   # 功能模組導出
│   ├── hooks/                         # 功能相關 hooks
│   │   ├── useMarathonData.ts         # 馬拉松資料 hook
│   │   ├── useMarathonSeason.ts       # 馬拉松季節 hook
│   │   └── index.ts                   # hooks 導出
│   ├── types/                         # 功能相關類型定義
│   │   ├── equipment.ts                # 裝備相關類型
│   │   ├── marathon.ts                 # 馬拉松相關類型
│   │   ├── mentor.ts                   # 導師相關類型
│   │   └── index.ts                    # 類型導出
│   ├── constants/                     # 功能相關常數
│   │   ├── equipment.ts                # 裝備相關常數
│   │   ├── marathon.ts                 # 馬拉松相關常數
│   │   └── index.ts                    # 常數導出
│   ├── utils/                         # 功能相關工具函數
│   │   ├── marathonHelpers.ts          # 馬拉松輔助函數
│   │   └── index.ts                    # 工具函數導出
│   └── index.ts                       # 功能模組導出
```

### 2. Services 層級重構

```
services/
├── marathon/                          # 學習馬拉松服務模組
│   ├── core/                          # 核心 API 和 schema
│   │   ├── api.ts                     # API 介面定義
│   │   ├── schema.ts                  # 資料結構定義
│   │   └── index.ts                   # 導出檔案
│   ├── seasons/                       # 季節相關子模組
│   │   ├── api.ts                     # 季節 API
│   │   ├── schema.ts                  # 季節 schema
│   │   └── index.ts                   # 季節導出
│   ├── equipment/                     # 裝備相關子模組
│   │   ├── api.ts                     # 裝備 API
│   │   ├── schema.ts                  # 裝備 schema
│   │   └── index.ts                   # 裝備導出
│   ├── mentors/                       # 導師相關子模組
│   │   ├── api.ts                     # 導師 API
│   │   ├── schema.ts                  # 導師 schema
│   │   └── index.ts                   # 導師導出
│   └── index.ts                       # 服務模組導出
```

### 3. Pages 層級重構

```
pages/
├── [language]/
│   └── learning-marathons/
│       └── [season]/
│           ├── layout.tsx              # 季節別 layout (僅負責組裝)
│           └── page.tsx                # 季節別頁面 (僅負責組裝)
```

### 4. Components 層級重構

```
components/
├── ui/                                # 共用 UI 元件 (保持現狀)
└── layout/                            # 版面配置元件
    └── MarathonLayout/                 # 馬拉松版面配置
        ├── MarathonLayout.tsx          # 馬拉松版面配置組件
        └── index.ts                    # 版面配置導出
```

## 重構實施步驟

### 第一階段：建立 Features 層級結構

1. **建立 marathon feature 目錄結構**
2. **移動並重構 Equipment 相關組件**
3. **建立類型定義和常數**

### 第二階段：建立 Services 層級結構

1. **建立 marathon service 目錄結構**
2. **定義 API 介面和 schema**
3. **實作資料驗證邏輯**

### 第三階段：重構 Pages 層級

1. **簡化頁面組件，僅負責組裝**
2. **委託商業邏輯給 features**
3. **更新 import 路徑**

### 第四階段：測試和驗證

1. **確保所有組件正常運作**
2. **驗證依賴關係正確性**
3. **檢查 TypeScript 類型定義**

## 具體重構內容

### Equipment 組件重構

#### 當前問題
- 組件直接放在 app 目錄下
- 包含硬編碼的資料
- 缺乏類型定義和驗證

#### 重構後結構
```
features/marathon/components/Equipment/
├── EquipmentCard.tsx                  # 裝備卡片組件
├── EquipmentGrid.tsx                  # 裝備網格組件
├── types.ts                           # 裝備相關類型
├── constants.ts                       # 裝備相關常數
└── index.ts                          # 組件導出
```

#### 重構重點
1. **分離關注點**: 將資料、邏輯、UI 分離
2. **類型安全**: 使用 Zod 進行資料驗證
3. **可重用性**: 組件應該可以在不同季節重複使用
4. **資料來源**: 透過 services 層級獲取資料

### Marathon 主要組件重構

#### 當前問題
- 單一組件包含過多職責
- 硬編碼的內容和邏輯
- 缺乏模組化結構

#### 重構後結構
```
features/marathon/components/MarathonInfo/
├── MarathonIntro.tsx                  # 活動介紹
├── MarathonWho.tsx                    # 適合對象
├── MarathonHow.tsx                    # 進行方式
├── MarathonBenefit.tsx                # 預期收穫
├── MarathonApply.tsx                  # 申請方式
├── MarathonPrice.tsx                  # 價格資訊
├── MarathonFAQ.tsx                    # FAQ
├── MarathonOrganizer.tsx              # 主辦單位
└── index.ts                          # 組件導出
```

## 依賴關係重構

### 重構前依賴關係
```
app/[language]/(BaseLayout)/learning-marathons/[season]/_2025S1/
├── Equipment.tsx                      # 直接使用 UI 組件
├── Marathon2025S1.tsx                 # 直接組裝所有組件
└── Styled.tsx                         # 直接定義樣式
```

### 重構後依賴關係
```
pages/[language]/learning-marathons/[season]/
├── layout.tsx                         # 組裝 MarathonLayout
└── page.tsx                          # 組裝 MarathonSeason

features/marathon/
├── components/                        # 使用 UI 組件
├── hooks/                            # 使用 services
└── types/                            # 使用 services schema

services/marathon/
├── core/                             # 提供 API 和 schema
└── [submodules]/                     # 提供特定功能
```

## 遷移檢查清單

### 檔案移動
- [ ] 將 Equipment.tsx 移動到 `features/marathon/components/Equipment/`
- [ ] 將 Marathon2025S1.tsx 拆分到 `features/marathon/components/MarathonInfo/`
- [ ] 將其他組件移動到對應的 features 目錄
- [ ] 將 Styled.tsx 移動到 `components/layout/MarathonLayout/`

### 依賴更新
- [ ] 更新所有 import 路徑
- [ ] 確保 features 之間不互相依賴
- [ ] 確保 services 之間不互相依賴
- [ ] 驗證 pages 僅負責組裝

### 類型定義
- [ ] 建立 Zod schema 進行資料驗證
- [ ] 定義完整的 TypeScript 類型
- [ ] 確保所有組件都有正確的類型定義

### 測試驗證
- [ ] 確保所有組件正常渲染
- [ ] 驗證資料流正確性
- [ ] 檢查 TypeScript 編譯錯誤
- [ ] 驗證依賴關係正確性

## 注意事項

1. **保持向後相容**: 重構過程中確保現有功能正常運作
2. **漸進式重構**: 分階段進行，避免一次性大幅改動
3. **測試驅動**: 每個階段都要進行充分測試
4. **文檔更新**: 同步更新相關文檔和註解
5. **團隊溝通**: 重構過程中與團隊成員保持溝通

## 預期效益

1. **架構清晰**: 建立清晰的依賴關係和職責分離
2. **可維護性**: 組件職責單一，易於維護和擴展
3. **可重用性**: 組件可以在不同季節和頁面重複使用
4. **類型安全**: 完整的 TypeScript 類型定義和 Zod 驗證
5. **開發效率**: 清晰的架構提升開發效率
