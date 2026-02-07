# Website Landing Page Content Update Plan

> Based on UI mockups in `docs/ui/image.png` (desktop) and `docs/ui/mobile.png` (mobile)

---

## Overview

This document describes the required changes to update the website landing page (`apps/website`) to match the new UI mockups. The mockup introduces a restructured content flow, new sections, and updated visual design compared to the current implementation.

---

## Section-by-Section Comparison & Tasks

### 1. Hero Section (Key Vision) — No Change

**Current:** Lottie animation (right side) + text + "立即加入" CTA
**Action:** Keep as-is. No changes needed.

| Item | Status | Action |
|------|--------|--------|
| Headline text | Unchanged | Keep "讓學習成為充滿自我掌握、互助支持和看得見進步的美好日常" |
| CTA button | Unchanged | Keep "立即加入" |
| Hero Lottie animation | Unchanged | Keep existing `key-vision-desktop.json` / `key-vision-mobile.json` |
| Decorative elements | Unchanged | Keep existing decorations |

**Required Assets:** None — all existing assets retained.

**Related Files:**
- `apps/website/src/components/landing-page/key-vision/key-vision.tsx` (no changes)

---

### 2. User Personas / Slogan Section — 輪播卡片

**Current:** Simple centered text slogan with island decoration background
**Mockup:** Slogan text + persona cards displayed as a **carousel (輪播)**

| Item | Status | Action |
|------|--------|--------|
| Slogan text | Unchanged | Keep "每個人都有自己的學習小島，透過交流與分享，連結成群島" |
| English subtitle | Unchanged | Keep "Where personal growth meets collective wisdom!" |
| User persona cards | **New** | Carousel of persona cards in speech bubble style |
| Bottom decoration | **New** | 兩個重疊半圓（teal + 淺藍色）作為區塊轉場 |

**Card Design (Speech Bubble Style):**

每張卡片為對話泡泡造型（teal 色圓角邊框 + 底部尖角指向），內容結構：
- **Avatar** — 圓形真實照片（非插畫），突出於卡片左上方
- **Name** — 人名（粗體，teal 色）
- **專業領域** — 標籤 + 值（虛線分隔）
- **想探索** — 標籤 + 值（虛線分隔）
- **Quote** — 淺藍色底的引言文字區塊

**Confirmed Persona Data (from desktop mockup, 以 Figma 為主):**

1. **Mia** (左側位置)
   - Avatar: 咖啡拉花照片（圓形裁切）
   - 專業領域: 內容創作
   - 想探索: 影片剪輯與後製
   - Quote: "每個故事都值得被好好說出來，讓世界看見不同的聲音"

2. **Emma** (上方中間位置)
   - Avatar: 真人照片（深色頭髮女性）
   - 專業領域: 潛水教練
   - 想探索: 閱讀、商管與理財
   - Quote: "深深著迷於海底的世界，希望能認識更多上山下海愛好者 ❤️"

3. **Sophia** (右側位置)
   - Avatar: 真人照片（亞洲女性）
   - 專業領域: 數據分析
   - 想探索: 攝影、視覺設計
   - Quote: "用數據說故事，用鏡頭記錄生活的美好瞬間"

**Additional Persona Data (from mobile mockup, 可能為同位置輪播的其他卡片):**

4. **Mia (variant)**
   - 專業領域: 前端開發
   - 想探索: 心理學
   - Quote: "最近開始對設計心理學有興趣，覺得研究人在想什麼很好玩"

5. **Sophie**
   - 專業領域: 產品設計
   - 想探索: 用戶體驗研究
   - Quote: "設計不只是美，更是解決問題的藝術"

**Display Mode: Desktop 三位置輪播**
- **桌面版：** 三個固定位置（左、上中、右）圍繞 slogan 文字
  - 每個位置有 **2-3 張卡片輪播**，穿插出現
  - 位置和樣式以 Figma 為主
  - 有動畫示意可參考
- **手機版：** 一次顯示一張卡片，可滑動切換
- **總計需要 6-9 張 persona 卡片**（3 個位置 × 每位置 2-3 張）

**Required Assets:**
- [ ] **Mia avatar photo** — 咖啡拉花圓形照片 (JPG/PNG, ~160x160px)
- [ ] **Emma avatar photo** — 真人圓形照片 (JPG/PNG, ~160x160px)
- [ ] **Sophia avatar photo** — 真人圓形照片 (JPG/PNG, ~160x160px)
- [ ] **額外 3-6 張 persona avatar photos** — 用於補足每個位置的 2-3 張輪播
- [ ] 底部半圓裝飾（teal + 淺藍色），可能用 CSS/SVG 實現

**Required Content:**
- [ ] **額外 3-6 位 persona 完整資料**（Name、Avatar、專業領域、想探索、Quote）— 以補足 6-9 張卡片需求
- [ ] 所有 persona 的英文翻譯
- [ ] Avatar 照片來源確認（是否需要授權 / 是否為示意圖）
- [ ] Figma 動畫示意連結（供開發參考輪播動畫效果）

**Related Files:**
- `apps/website/src/components/landing-page/slogan-section.tsx` (major refactor)
- `packages/i18n/src/locales/zh-TW.json`
- `packages/i18n/src/locales/en.json`

---

### 3. Learning Foundation Section — 主題實踐卡片 (New)

**Current:** Does not exist (Feature Grid section is in this position)
**Mockup:** "從好奇開始 小步實踐生活裡的學習靈感" with interactive swipeable card stack

| Item | Status | Action |
|------|--------|--------|
| Section title | **New** | "從好奇開始 小步實踐生活裡的學習靈感" |
| Subtitle line 1 | **New** | "7-30 天輕量學習計畫" |
| Subtitle line 2 | **New** | "不需要完美，只要開始探索就有收穫" |
| Card stack | **New** | 3 張可翻動的主題實踐卡片（黃色、粉色、藍色） |
| Card content | **New** | 每張卡片含：標籤、標題、描述、頻率、時長 |
| Decorative elements | **New** | 右側橘色菱形、藍綠色水平線條 |

**Card Stack Design (3 cards):**

前方卡片範例：
- Tag badge: "主題實踐"
- Title: "自己準備便當"
- Description: "開始為自己做上班的健康午餐便當"
- Metrics: "3-5 天/週" | "30 分/次"
- CTA tooltip: "喜歡嗎？馬上開始！"
- Arrow button (>) at bottom right

卡片堆疊視覺：黃色（前）→ 粉色（中）→ 藍色（後），略微旋轉偏移

**Interaction Spec:**
- **翻卡片效果與 dashboard 一樣** — 重用 `packages/ui/src/components/stack.tsx` (Framer Motion Stack component)
- **Scroll trigger:** 當使用者捲動到此位置，過了一秒之後，箭頭按鈕浮現 tooltip 顯示提示訊息
- **點擊範圍：整張卡片**
  - **點擊一下：** 進入實踐預覽頁
  - **拖曳：** 切換卡片（翻到下一張）
- **點擊後流程：** 直接開啟實踐預覽頁，當使用者選擇之後再讓他登入

**Reusable Component:**
- `packages/ui/src/components/stack.tsx` — Framer Motion 3D 翻卡片元件
  - 支援 `sensitivity`, `sendToBackOnClick`, `autoplay`, `autoplayDelay`, `pauseOnHover`
  - 使用 `perspective: 600` + `rotateX/rotateY` transforms
  - 支援 drag + click 兩種互動方式

**Required Assets:**
- [ ] **卡片背景色** — 3 種顏色已確定：黃色 (front), 粉色 (middle), 藍色 (back)，不需額外圖片
- [ ] **右側裝飾元素** — 橘色菱形 SVG、藍綠色水平線條 SVG（或可用 CSS 實現）

**Required Content:**
- [ ] **3 張主題實踐卡片資料** — 每張卡片需要：
  - 標籤 (e.g., "主題實踐")
  - 標題 (e.g., "自己準備便當")
  - 描述 (e.g., "開始為自己做上班的健康午餐便當")
  - 頻率 (e.g., "3-5 天/週")
  - 時長 (e.g., "30 分/次")
- [ ] Section title and subtitle text (en translation)
- [ ] Tooltip 提示文字 (e.g., "喜歡嗎？馬上開始！")
- [ ] 點擊卡片後的目標 URL（實踐預覽頁路徑）
- [ ] 卡片資料來源：靜態寫死 or 從 API 取得？

**Related Files:**
- New component: `apps/website/src/components/landing-page/learning-foundation-section.tsx`
- Reuse: `packages/ui/src/components/stack.tsx` (card flip/stack interaction)
- `packages/i18n/src/locales/zh-TW.json`
- `packages/i18n/src/locales/en.json`

---

### 4. Quick Start Section — 實踐計畫概覽 (New / Replaces Video Section)

**Current:** Video Section with two video placeholders
**Mockup:** 展示主題實踐計畫的結構概覽，搭配依序出現的動畫

| Item | Status | Action |
|------|--------|--------|
| Section title | **New** | "快速啟動你的學習旅程" |
| Stats cards (3 張) | **New** | 總共持續 14 天 / 每週頻率 3-5 天 / 每次執行 30 分鐘 |
| 執行時機 | **New** | 燈泡 icon + 三個時段選項 |
| Bottom message | **New** | "隨時修改沒有壓力，節奏由你決定" |
| Illustration | **New** | 黃色星星角色騎紙飛機 + 書本裝飾 |

**Content Layout:**

```
┌─────────────┬─────────────┬─────────────┐
│  總共持續     │  每週頻率     │  每次執行     │
│   14 天      │   3-5 天     │  30 分鐘     │
└──────┬──────┴──────┬──────┴──────┬──────┘
       │ 出現順序 1    │ 出現順序 2    │ 出現順序 3
       └──────────────┴──────────────┘
                      │
              ┌───────▼────────┐
              │  💡 執行時機     │  ← 出現順序 4
              │  🕐 早餐前      │
              │  🕐 通勤時      │
              │  🕐 睡前        │
              └───────┬────────┘
                      │
    ┌─────────────────▼──────────────────┐
    │ 隨時修改沒有壓力，節奏由你決定        │  ← 出現順序 5
    └────────────────────────────────────┘
```

**Animation Spec (Scroll-triggered sequential entrance):**
- **出現順序 1:** 「總共持續 14 天」卡片淡入
- **出現順序 2:** 「每週頻率 3-5 天」卡片淡入
- **出現順序 3:** 「每次執行 30 分鐘」卡片淡入
- **出現順序 4:** 「執行時機」區塊（含燈泡 icon + 3 個時段）淡入
- **出現順序 5:** 底部訊息「隨時修改沒有壓力，節奏由你決定」淡入

每個元素依序出現，可用 Framer Motion 的 stagger animation 實現。

**Required Assets:**
- [ ] **黃色星星角色騎紙飛機插圖** — PNG/SVG（左側裝飾，虛線框標示區域）
- [ ] **書本插圖** — PNG/SVG（右下角裝飾）
- [ ] **燈泡 icon** — SVG（執行時機標題旁）
- [ ] **時鐘 icon** — SVG（3 個時段項目前，可複用現有 `icon-clock.svg`）

**Required Content:**
- [ ] 確認 stats 數據是固定值或需要動態：14 天 / 3-5 天 / 30 分鐘
- [ ] 執行時機的時段選項是否為固定（早餐前、通勤時、睡前）
- [ ] 所有文案的英文翻譯

**Related Files:**
- `apps/website/src/components/landing-page/video-section.tsx` (replace or refactor)
- New component: `apps/website/src/components/landing-page/quick-start-section.tsx`
- `packages/i18n/src/locales/zh-TW.json`
- `packages/i18n/src/locales/en.json`

---

### 5. Learning Footprint Section — 打卡足跡 (New)

**Current:** Does not exist
**Mockup:** "打卡留下每一步足跡" 含打卡面板 + 手帳 paper 雙畫面動畫切換

| Item | Status | Action |
|------|--------|--------|
| Section title | **New** | "打卡留下每一步足跡" |
| Subtitle | **New** | "不再只是憑感覺 / 在每一次實踐中看見自己的成長" |
| Check-in panel | **New** | 互動式打卡面板（心情、想法、描述） |
| Journal paper | **New** | 手帳風格的打卡紀錄展示 |
| Background | **New** | Teal/green gradient with semicircle decorations |

**畫面 A — 打卡面板 (Check-in Panel):**
- Title: "自己準備便當"（對應主題實踐）
- **心情如何？** — 6 個情緒選項：
  - 想放棄 (`hopeless.svg`)
  - 受挫 (`frustrated.svg`)
  - 無聊 (`bored.svg`)
  - 普通 (`neutral.svg`)
  - 還不錯 (`fine.svg`)
  - 開心 (`happy.svg`) ← 選中狀態
- **想法分享** — 可選標籤：實作、新概念、有趣 ✕、困難、下一步 ✕、改進、疑問
- **詳細描述** (0/300)：
  - 示範文字："挑戰完成了超美麗的日式便當，天啊太有成就感了吧！！下次要再開發一些新菜色～"

**畫面 B — 手帳 Paper (Journal View):**
- 筆記本造型（頂部圓孔裝訂、橫線紙）
- 心情普通 icon + 標示
- 打卡紀錄文字內容
- 圓形郵戳印章："Practice Checked In 2026 01/01"
- 標籤：#有趣 #下一步
- 照片附件（便當照片）

**Animation Spec (desktop/mobile 動畫效果一樣，重複循環):**

```
Step 1 (2秒)    Step 2 (1秒)    Step 3 (0.5秒)   Step 4 (3秒)
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│          │   │    ↓     │   │   ╱      │   │  ╱╱      │
│  ┌────┐  │   │  ┌────┐  │   │  ╱ 色塊   │   │ ╱ 卡片   │
│  │卡片│↑ │   │  │卡片│  │   │ ╱  ↑     │   │╱  ↑ 色塊  │
│  └────┘  │   │  └────┘  │   │╱         │   │          │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
 卡片往上進場    卡片往下退場    背後色塊往       前面卡片往
                              斜上角度進場     斜上角度進場
              ←── 重複循環 ──→
```

**Reusable Assets (已有，可直接複用):**
- ✅ `packages/assets/images/emotion/*.svg` — 6 個情緒 icon（完全吻合）
- ✅ `packages/assets/images/dashboard/notebook-hole.svg` — 筆記本圓孔裝訂
- ✅ `packages/assets/images/dashboard/stamp.svg` — 圓形印章（需修改文字內容）

**Required Assets (需要新製作):**
- [ ] **便當照片** — 示範用的食物照片（JPG, 用於手帳 paper 附件）
- [ ] **Journal paper 背景** — 筆記本橫線紙背景（可用 CSS 實現）
- [ ] **Practice Checked In 印章** — 自訂內容印章（可從 `stamp.svg` 修改，或用 CSS 實現）
- [ ] **背景裝飾** — teal gradient + 半圓裝飾 + 星芒（可能用 CSS 實現）

**Required Content:**
- [ ] Section title and subtitle 英文翻譯
- [ ] 打卡面板的範例資料（標題、心情、標籤、描述文字）
- [ ] 想法分享標籤列表確認（實作、新概念、有趣、困難、下一步、改進、疑問）
- [ ] 手帳照片附件來源
- [ ] 動畫 timing 確認（2秒、1秒、0.5秒、3秒）

**Related Files:**
- New component: `apps/website/src/components/landing-page/footprint-section.tsx`
- Reuse: `packages/assets/images/emotion/*.svg` (6 emotions)
- Reuse: `packages/assets/images/dashboard/notebook-hole.svg`
- `packages/i18n/src/locales/zh-TW.json`
- `packages/i18n/src/locales/en.json`

---

### 6. Join Section — 加入島島阿學 (Replaces old Community + Feature Grid + Plan sections)

**Current:** Separate sections for Feature Grid (3 cards) + Plan/Pricing
**Mockup:** 統一的加入區塊，含 4 個功能卡片 + CTA，teal 背景

| Item | Status | Action |
|------|--------|--------|
| Section title | **Updated** | "加入島島阿學" |
| Subtitle | **New** | "成為 Beta 使用者 / 與我們一起打造更好的學習體驗" |
| Compass icon | **New** | 橘/黃色指南針 icon（左上角） |
| Feature cards (4 張) | **Changed** | 2x2 grid，取代原本 3 or 6 張 |
| CTA button | **Updated** | "立即免費註冊"（橘色按鈕） |
| Supporting text | Unchanged | "Beta 期間完全免費 · 無需信用卡" |
| Background | **Changed** | 整區 teal/primary 色背景 |

**4 Feature Cards (2x2 Grid):**

1. **目標探索** — 淺藍色背景
   - Description: "在實踐中 釐清動機與目標"

2. **資源推薦** — 淺綠色背景
   - Description: "龐大資源庫 支援你的學習"

3. **紀錄成長** — 黃色背景
   - Description: "所有足跡 一目瞭然"

4. **同儕推進** — 白色背景 + **「即將推出」** badge
   - Description: "找到志趣相同的夥伴 共同成長"

**Animation Spec (Scroll-triggered stagger):**

```
┌──────────┬──────────┬────────────────┐
│ 出現順序1  │ 出現順序3  │                │
│ 目標探索   │ 紀錄成長   │                │
├──────────┼──────────┤   teal 背景     │
│ 出現順序2  │ 出現順序4  │                │
│ 資源推薦   │ 同儕推進   │                │
└──────────┴──────────┴────────────────┘
```
- 4 張卡片依序淡入：1 → 2 → 3 → 4
- 卡片位置略有偏移（上下錯開）

**Reusable Assets (已有):**
- ✅ `packages/assets/images/dashboard/compass.svg` — 橘/黃色指南針 icon

**Required Assets:**
- [ ] **卡片背景色** — 4 種顏色已確定（淺藍、淺綠、黃、白），不需額外圖片
- [ ] **「即將推出」badge** — 可用 CSS 實現（斜角 ribbon 效果）

**Required Content:**
- [ ] 4 張功能卡片的英文翻譯
- [ ] CTA "立即免費註冊" 的目標 URL
- [ ] 確認「同儕推進」是否保留「即將推出」標示

**Related Files:**
- `apps/website/src/components/landing-page/feature-grid.tsx` (major refactor or replace)
- `apps/website/src/components/landing-page/plan-section.tsx` (merge into this section)
- `packages/i18n/src/locales/zh-TW.json`
- `packages/i18n/src/locales/en.json`

---

### 7. Transition Banner (New / Replaces some existing sections)

**Current:** Typewriter Bubble section + Presentation section
**Mockup:** Decorative banner with character illustration and text "更多功能持續開發中，為你找到更美好的學習生活"

| Item | Status | Action |
|------|--------|--------|
| Typewriter section | **Remove** | Replace with new banner |
| Presentation section | **Remove** | Replace with new banner |
| Banner text | **New** | "更多功能持續開發中，為你找到更美好的學習生活" |
| Illustration | **New** | Character peeking over a surface with decorative elements |

**Required Assets:**
- [ ] **Banner character illustration** - PNG/SVG of the mascot/character peeking over edge
- [ ] Decorative stars and elements
- [ ] Wave/curve separator

**Required Content:**
- [ ] Banner text (zh-TW and en)

**Related Files:**
- `apps/website/src/components/landing-page/typewriter-bubble.tsx` (remove or repurpose)
- `apps/website/src/components/landing-page/presentation-section.tsx` (remove or repurpose)
- New component: `apps/website/src/components/landing-page/transition-banner.tsx`

---

### 8. Learning DNA / Quiz Section (Updated)

**Current:** Full-height section with background images, clock icon, mascot decorations
**Mockup:** More compact layout with "發現你的學習DNA" card and "查看個人化結果" link

| Item | Status | Action |
|------|--------|--------|
| Title | Unchanged | "了解你的學習偏好，獲得個人化的學習建議和推薦路徑" |
| Time estimate | Unchanged | "2-3分鐘" |
| Layout | **Changed** | More compact, card-based design |
| DNA card | **New** | "發現你的學習DNA" visual card |
| Results link | **New** | "查看個人化結果" link |

**Required Assets:**
- [ ] **Learning DNA card graphic** - PNG/SVG of the "發現你的學習DNA" card (teal/green card shown in mockup)
- [ ] Updated background or remove existing background images

**Required Content:**
- [ ] "查看個人化結果" link destination
- [ ] Updated CTA text (zh-TW and en)

**Related Files:**
- `apps/website/src/components/landing-page/personality-section.tsx`

---

### 9. Footer (Minor Updates)

**Current:** Dark footer with logo, about links, resource links, newsletter, social links
**Mockup:** Similar structure with minor layout updates

| Item | Status | Action |
|------|--------|--------|
| Overall structure | Mostly unchanged | Minor adjustments |
| Social links | **Updated** | May include LinkedIn icon in addition to existing |
| Layout | Minor change | Slight rearrangement of columns |

**Required Assets:**
- [ ] **LinkedIn icon** - SVG (if adding LinkedIn)
- [ ] **YouTube icon** - SVG (if adding YouTube, visible in mockup)

**Required Content:**
- [ ] LinkedIn URL
- [ ] YouTube URL (if applicable)

**Related Files:**
- `apps/website/src/components/layout/footer.tsx`

---

### 10. Sections to Remove or Repurpose

The following current sections are **not present** in the mockup and should be removed or reworked:

| Section | Current Component | Action |
|---------|-------------------|--------|
| Typewriter Bubble | `typewriter-bubble.tsx` | **Remove** — Replaced by Transition Banner (Section 7) |
| Presentation Section | `presentation-section.tsx` | **Remove** — Content merged elsewhere |
| Video Section | `video-section.tsx` | **Remove** — Replaced by Quick Start (Section 4) |
| Function Carousel | `function-carousel.tsx` | **Remove** — Replaced by Join Section (Section 6) |
| Testimonial Marquee | `testimonial-marquee.tsx` | **Remove** — User personas now in Slogan Section (Section 2) |
| Call to Action Section | `call-to-action-section.tsx` | **Remove** — CTA merged into Join Section (Section 6) |
| Feature Grid | `feature-grid.tsx` | **Major refactor** — Merged into Join Section (Section 6) |
| Plan Section | `plan-section.tsx` | **Major refactor** — Merged into Join Section (Section 6) |

---

## Summary: Required Assets Checklist

### Illustrations (High Priority)
- [ ] **黃色星星角色騎紙飛機** — Quick Start 區左側插圖 (PNG/SVG)
- [ ] **書本裝飾** — Quick Start 區右下角 (PNG/SVG)（可能可複用 `dashboard/book.svg`）
- [ ] Banner character illustration (peeking mascot)
- [ ] Learning DNA card graphic

### User Persona Assets (Real Photos, 6-9 張)
- [ ] Mia avatar photo — 咖啡拉花照片 (JPG/PNG, ~160x160px)
- [ ] Emma avatar photo — 真人照片 (JPG/PNG, ~160x160px)
- [ ] Sophia avatar photo — 真人照片 (JPG/PNG, ~160x160px)
- [ ] 額外 3-6 張 persona avatar photos（補足每位置 2-3 張輪播需求）

### UI Screenshots / Mockups
- [ ] 便當照片（Footprint 手帳附件用）

### Icons (SVG)
- [x] **指南針 icon** — Join Section 左上角（已有 `dashboard/compass.svg`）
- [x] **燈泡 icon** — Quick Start 執行時機（已有 `dashboard/bulb.svg`）
- [x] **時鐘 icon** — Quick Start 時段項目（已有 `landing-page/icon-clock.svg`）
- [ ] Stats/metric icons (calendar, activity — 如需額外 icons)
- [ ] LinkedIn social icon (if adding)
- [ ] YouTube social icon (if adding)

### Backgrounds & Decorations
- [ ] Teal/green wave background (for Footprint section)
- [ ] Updated decorative elements (speech bubbles, stars)
- [ ] Section separator curves/waves

---

## Summary: Required Content / Copy

### Text Content (needs zh-TW + en translations)
- [ ] 額外 3-6 位 persona 完整資料（補足 6-9 張輪播卡片）
- [ ] 所有 persona 英文翻譯
- [ ] Learning Foundation section title + subtitle (en translation)
- [ ] 3 張主題實踐卡片資料（標籤、標題、描述、頻率、時長）
- [ ] Quick Start section 英文翻譯（stats + 執行時機 + 底部訊息）
- [ ] Footprint section title + subtitle 英文翻譯
- [ ] 打卡面板範例資料（標題、心情、標籤、描述）
- [ ] Join Section — 4 張功能卡片英文翻譯（目標探索、資源推薦、紀錄成長、同儕推進）
- [ ] Transition banner text (zh-TW + en)
- [ ] Updated Quiz/DNA section CTA text (zh-TW + en)

### Data / Configuration
- [ ] Quick Start stats — 確認是否固定值 (14 天, 3-5 天, 30 分鐘)
- [ ] User persona tags/interests
- [ ] Avatar 照片來源確認（是否需要授權 / 是否為示意圖）
- [ ] CTA link destinations for new sections（Join "立即免費註冊" + 卡片點擊）
- [ ] 主題實踐卡片資料來源 — 靜態寫死 or 從 API 取得？
- [ ] 卡片點擊後目標 URL（實踐預覽頁路徑）
- [ ] 確認「同儕推進」是否保留「即將推出」標示
- [ ] Footprint 動畫 timing 確認（2秒、1秒、0.5秒、3秒）
- [ ] Figma 動畫示意連結（供開發參考 Persona 輪播動畫效果）

---

## Proposed New Section Order

```
1.  Hero (Key Vision) .............. [No change - keep Lottie animation]
2.  User Personas + Slogan ......... [Refactored - persona 輪播卡片]
3.  Learning Foundation ............ [New - 主題實踐卡片堆疊]
4.  Quick Start .................... [New - replaces Video Section]
5.  Footprint ...................... [New - 打卡足跡動畫]
6.  Join (加入島島阿學) ............ [Merged - 原 Community + Feature Grid + Plan]
7.  Transition Banner .............. [New - replaces Typewriter + Presentation]
8.  Learning DNA / Quiz ............ [Updated layout]
9.  Footer ......................... [Minor updates]
```

---

## Implementation Priority

### Phase 1: Structure & Layout
1. Restructure landing page component order (9 sections)
2. Remove deprecated sections (Typewriter, Presentation, Video, Carousel, Testimonial Marquee, CTA)
3. Create skeleton components for new sections

### Phase 2: New Sections (with placeholder content)
4. Build Learning Foundation section (card stack, reuse `stack.tsx`)
5. Build Quick Start section (stagger animation)
6. Build Footprint section (check-in + journal 動畫循環)
7. Build Join section (merge Community + Feature Grid + Plan into 4-card layout)
8. Build Transition Banner

### Phase 3: Refactor Existing Sections
9. Refactor Slogan section with persona 輪播卡片 (3 positions × 2-3 cards)
10. Update Personality/Quiz section layout
11. Minor footer updates

### Phase 4: Content & Assets Integration
12. Integrate final illustrations and icons
13. Add i18n translations for all new content (zh-TW + en)
14. Integrate persona photos and mockup images

### Phase 5: Polish
15. Responsive design testing (desktop + mobile)
16. Animation and interaction refinements (Framer Motion stagger, card flip, footprint loop)
17. Accessibility review
18. Performance optimization (image sizes, lazy loading)
