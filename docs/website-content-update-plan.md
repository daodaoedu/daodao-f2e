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

**Confirmed Persona Data:**

1. **Mia**
   - Avatar: 咖啡拉花照片（圓形裁切）
   - 專業領域: 前端開發
   - 想探索: 心理學
   - Quote: "最近開始對設計心理學有興趣，覺得研究人在想什麼很好玩"

2. **Sophie**
   - Avatar: 真人照片（女性，彩色頭飾，微笑）
   - 專業領域: 產品設計
   - 想探索: 用戶體驗研究
   - Quote: "設計不只是美，更是解決問題的藝術"

3. **Emma** (from desktop mockup, details TBD)
   - Avatar: TBD
   - 專業領域: TBD
   - 想探索: TBD
   - Quote: TBD

**Display Mode: Carousel (輪播)**
- 手機版：一次顯示一張卡片，可滑動切換
- 桌面版：三張卡片分散排列在 slogan 周圍（參考 desktop mockup）

**Required Assets:**
- [ ] **Mia avatar photo** — 咖啡拉花圓形照片 (JPG/PNG, ~160x160px)
- [ ] **Sophie avatar photo** — 真人圓形照片 (JPG/PNG, ~160x160px)
- [ ] **Emma avatar photo** — TBD (JPG/PNG, ~160x160px)
- [ ] 底部半圓裝飾（teal + 淺藍色），可能用 CSS/SVG 實現

**Required Content:**
- [ ] **Emma 的完整資料** — 專業領域、想探索、Quote
- [ ] 所有 persona 的英文翻譯
- [ ] 確認是否還有更多 persona（目前確認 3 位）
- [ ] Avatar 照片來源確認（是否需要授權 / 是否為示意圖）

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

### 4. Quick Start Section (New / Replaces Video Section)

**Current:** Video Section with two video placeholders
**Mockup:** "快速啟動你的學習旅程" with stats grid and feature icons

| Item | Status | Action |
|------|--------|--------|
| Section title | **Changed** | "快速啟動你的學習旅程" |
| Subtitle | **New** | "最快只上線後不到 3 個月的佈局" |
| Stats grid | **New** | 3 stat cards: 週共用時 14月 / 每週服務 3-5次 / 每次執行 30分鐘 |
| Feature icons | **New** | 執行時間 + other feature highlights |
| Bottom text | **New** | "瀏覽時改怎你有想？，更貴奮作決定" |

**Required Assets:**
- [ ] **Feature icons** - SVG icons for each stat/feature item (clock, calendar, activity icons)
- [ ] Background illustration (character with plants/growth theme)

**Required Content:**
- [ ] Accurate stat numbers (are 14月, 3-5次, 30分鐘 final numbers?)
- [ ] Feature highlight descriptions (zh-TW and en)
- [ ] Bottom CTA text

**Related Files:**
- `apps/website/src/components/landing-page/video-section.tsx` (replace or refactor)
- New component: `apps/website/src/components/landing-page/quick-start-section.tsx`

---

### 5. Learning Footprint Section (New)

**Current:** Does not exist
**Mockup:** "打卡留下每一步足跡" with app screenshot showing check-in interface

| Item | Status | Action |
|------|--------|--------|
| Section title | **New** | "打卡留下每一步足跡" |
| Subtitle | **New** | "手指的距離就能記錄" + description |
| App UI preview | **New** | Screenshot of the check-in / learning log feature |
| Background | **New** | Light teal/green gradient with wave pattern |

**Required Assets:**
- [ ] **Check-in UI screenshot (desktop)** - PNG showing the learning log / check-in interface (the mobile-style app card shown in mockup)
- [ ] **Check-in UI screenshot (mobile)** - Mobile-optimized version
- [ ] Wave/curve background decoration (teal/green)

**Required Content:**
- [ ] Section title and subtitle text (zh-TW and en)
- [ ] Check-in feature descriptions
- [ ] Sample check-in entries data

**Related Files:**
- New component: `apps/website/src/components/landing-page/footprint-section.tsx`

---

### 6. Community Section (New)

**Current:** Community features are mentioned in the Feature Grid but don't have a dedicated section
**Mockup:** "加入社群一起對話" with community stats and join CTA

| Item | Status | Action |
|------|--------|--------|
| Section title | **New** | "加入社群一起對話" |
| Description | **New** | Community feature description text |
| Member count | **New** | "56人已經加入" (or dynamic number) |
| CTA button | **New** | "加入學習社群" |
| Illustration | **New** | Characters having a discussion |

**Required Assets:**
- [ ] **Community illustration** - PNG/SVG showing people in discussion (characters with speech bubbles)
- [ ] Community-related icons

**Required Content:**
- [ ] Section description text (zh-TW and en)
- [ ] Is the member count (56人) static or fetched from API?
- [ ] CTA link destination (where does "加入學習社群" lead?)

**Related Files:**
- New component: `apps/website/src/components/landing-page/community-section.tsx`

---

### 7. Feature Cards Grid (Refactored)

**Current:** "告別三大學習困境" with 3 large feature cards (個人學習管理, 社群支持, 成長視覺化)
**Mockup:** 6 smaller feature cards in a 2x3 grid layout

| Item | Status | Action |
|------|--------|--------|
| Section layout | **Changed** | 3 cards → 6 cards (2x3 grid) |
| Card style | **Changed** | Smaller, icon-focused cards with brief descriptions |

**Mockup Feature Cards (6 items):**

1. **目標設定** (Goal Setting)
   - Icon: Target/flag icon
   - Brief description of goal setting feature

2. **輕鬆成長** (Easy Growth)
   - Icon: Growth/plant icon
   - Brief description of growth tracking

3. **片段式學習** (Fragment Learning)
   - Icon: Puzzle/time icon
   - Brief description of micro-learning approach

4. **資源推薦** (Resource Recommendations)
   - Icon: Star/bookmark icon
   - Brief description of resource discovery

5. **社群互動** (Community Interaction)
   - Icon: People/chat icon
   - Brief description of social features

6. **同儕陪伴** (Peer Support)
   - Icon: Handshake/heart icon
   - Brief description of peer learning

**Required Assets:**
- [ ] **6 feature icons** - SVG icons for each feature card (consistent style)
- [ ] Card background illustrations or patterns (if any)

**Required Content:**
- [ ] 6 feature card titles (zh-TW and en)
- [ ] 6 feature card descriptions (zh-TW and en)
- [ ] Confirm the exact 6 features to highlight

**Related Files:**
- `apps/website/src/components/landing-page/feature-grid.tsx` (major refactor)
- `packages/i18n/src/locales/zh-TW.json`
- `packages/i18n/src/locales/en.json`

---

### 8. Join / Plan Section (Updated)

**Current:** "加入島島阿學" with single pricing card and 5 feature bullets
**Mockup:** "加入島島同學" with updated layout, service intro, and CTA

| Item | Status | Action |
|------|--------|--------|
| Section title | Similar | "加入島島同學" (slightly different wording) |
| Description | **Changed** | Updated pitch text |
| CTA button | **Changed** | "立即免費試用" |
| Layout | **Changed** | Different card layout with product details |

**Required Assets:**
- [ ] Updated decorative elements (if design changes)

**Required Content:**
- [ ] Updated section description (zh-TW and en)
- [ ] Updated feature list items
- [ ] Service details (pricing, trial info)
- [ ] CTA destination URL

**Related Files:**
- `apps/website/src/components/landing-page/plan-section.tsx`
- `packages/i18n/src/locales/zh-TW.json`

---

### 9. Transition Banner (New / Replaces some existing sections)

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

### 10. Learning DNA / Quiz Section (Updated)

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

### 11. Footer (Minor Updates)

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

### 12. Sections to Remove or Repurpose

The following current sections are **not present** in the mockup and should be removed or reworked:

| Section | Current Component | Action |
|---------|-------------------|--------|
| Typewriter Bubble | `typewriter-bubble.tsx` | **Remove** - Replaced by transition banner |
| Presentation Section | `presentation-section.tsx` | **Remove** - Content merged elsewhere |
| Video Section | `video-section.tsx` | **Remove** - Replaced by Quick Start section |
| Function Carousel | `function-carousel.tsx` | **Remove** - Replaced by Feature Cards Grid |
| Testimonial Marquee | `testimonial-marquee.tsx` | **Remove** - User personas now in slogan section |
| Call to Action Section | `call-to-action-section.tsx` | **Remove** - CTA merged into Plan section |

---

## Summary: Required Assets Checklist

### Illustrations (High Priority)
- [ ] Community discussion illustration (PNG/SVG)
- [ ] Banner character illustration (peeking mascot)
- [ ] Learning DNA card graphic

### User Persona Assets (Real Photos)
- [ ] Mia avatar photo — 咖啡拉花照片 (JPG/PNG, ~160x160px)
- [ ] Sophie avatar photo — 真人照片 (JPG/PNG, ~160x160px)
- [ ] Emma avatar photo — TBD (JPG/PNG, ~160x160px)

### UI Screenshots / Mockups
- [ ] Check-in / learning log UI screenshot (for Footprint section)

### Icons (SVG)
- [ ] 6 feature card icons (目標設定, 輕鬆成長, 片段式學習, 資源推薦, 社群互動, 同儕陪伴)
- [ ] Stats/metric icons (clock, calendar, activity)
- [ ] LinkedIn social icon (if adding)
- [ ] YouTube social icon (if adding)

### Backgrounds & Decorations
- [ ] Teal/green wave background (for Footprint section)
- [ ] Updated decorative elements (speech bubbles, stars)
- [ ] Section separator curves/waves

---

## Summary: Required Content / Copy

### Text Content (needs zh-TW + en translations)
- [ ] Emma persona 完整資料（專業領域、想探索、Quote）
- [ ] 3 位 persona 英文翻譯
- [ ] Learning Foundation section title + subtitle (en translation)
- [ ] 3 張主題實踐卡片資料（標籤、標題、描述、頻率、時長）
- [ ] Quick Start section stats and descriptions
- [ ] Footprint section title + subtitle + descriptions
- [ ] Community section title + description + member count
- [ ] 6 feature card titles and descriptions
- [ ] Updated Plan/Join section copy
- [ ] Transition banner text
- [ ] Updated Quiz/DNA section CTA text

### Data / Configuration
- [ ] Community member count - static or dynamic? (mockup shows "56人")
- [ ] Quick Start stats - confirm numbers (14月, 3-5次, 30分鐘)
- [ ] User persona tags/interests
- [ ] CTA link destinations for new sections
- [ ] Whether to keep or update existing testimonial content
- [ ] 主題實踐卡片資料來源 — 靜態寫死 or 從 API 取得？
- [ ] 卡片點擊後目標 URL（實踐預覽頁路徑）

---

## Proposed New Section Order

```
1.  Hero (Key Vision) .............. [No change - keep Lottie animation]
2.  User Personas + Slogan ......... [Refactored - add persona cards]
3.  Learning Foundation ............ [New section]
4.  Quick Start .................... [New - replaces Video Section]
5.  Footprint ...................... [New section]
6.  Community ...................... [New section]
7.  Feature Cards Grid ............. [Refactored - 6 cards]
8.  Join / Plan .................... [Updated]
9.  Transition Banner .............. [New - replaces Typewriter + Presentation]
10. Learning DNA / Quiz ............ [Updated layout]
11. Footer ......................... [Minor updates]
```

---

## Implementation Priority

### Phase 1: Structure & Layout
1. Restructure landing page component order
2. Remove deprecated sections (Typewriter, Presentation, Video, Carousel, Testimonial Marquee, CTA)
3. Create skeleton components for new sections

### Phase 2: New Sections (with placeholder content)
4. Build Learning Foundation section
5. Build Quick Start section
6. Build Footprint section
7. Build Community section
8. Build Transition Banner

### Phase 3: Refactor Existing Sections
9. Refactor Slogan section with user personas
10. Refactor Feature Grid to 6-card layout
11. Update Plan section layout
12. Update Personality/Quiz section layout

### Phase 4: Content & Assets Integration
13. Integrate final illustrations and icons
14. Add i18n translations for all new content
15. Integrate UI screenshots / mockup images

### Phase 5: Polish
16. Responsive design testing (desktop + mobile)
17. Animation and interaction refinements
18. Accessibility review
19. Performance optimization (image sizes, lazy loading)
