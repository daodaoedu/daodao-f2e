# i18n 未完成項目清單

> 最後更新：2026-02-02

## 概述

本文件記錄島島阿學 (daodao-f2e) 專案中應進行國際化 (i18n) 但尚未完成的項目。

### 專案 i18n 架構

- **i18n Package**: `packages/i18n/`
- **翻譯檔案**: `packages/i18n/src/locales/`
  - `zh-TW.json` (繁體中文)
  - `en.json` (英文)
- **框架**: `next-intl` (Next.js 國際化)
- **支援語言**: 繁體中文 (zh-TW)、英文 (en)

---

## 1. Constants 硬編碼選項

### 1.1 教育階段選項

**檔案**: `apps/product/src/constants/education-stage.ts`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 68 | 不設限 | `constants.educationStage.unlimited` |
| 69 | 國小 | `constants.educationStage.elementary` |
| 70 | 國中 | `constants.educationStage.junior` |
| 71 | 高中 | `constants.educationStage.senior` |
| 72 | 大學 | `constants.educationStage.university` |
| 73 | 研究所 | `constants.educationStage.graduate` |

### 1.2 用戶角色選項

**檔案**: `apps/product/src/constants/user-role.ts`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 45 | 學生 | `constants.userRole.student` |
| 46 | 社會人士 | `constants.userRole.professional` |
| 47 | 教師 | `constants.userRole.teacher` |
| 48 | 其他 | `constants.userRole.other` |

### 1.3 心情狀態選項

**檔案**: `apps/product/src/constants/mood.ts`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 35 | 想放棄 | `constants.mood.hopeless` |
| 36 | 受挫 | `constants.mood.frustrated` |
| 37 | 無聊 | `constants.mood.bored` |
| 38 | 普通 | `constants.mood.neutral` |
| 39 | 還不錯 | `constants.mood.fine` |
| 40 | 開心 | `constants.mood.happy` |

### 1.4 任務狀態選項

**檔案**: `apps/product/src/constants/task-status.tsx`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 46 | 草稿 | `constants.taskStatus.draft` |
| 50 | 未開始 | `constants.taskStatus.notStarted` |
| 54 | 進行中 | `constants.taskStatus.inProgress` |
| 58 | 已完成 | `constants.taskStatus.completed` |

### 1.5 實踐分類選項

**檔案**: `apps/product/src/constants/practice-category.ts`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 22 | 數位技能 | `constants.practiceCategory.digital_skill` |
| 23 | 生活品味 | `constants.practiceCategory.lifestyle` |
| 24 | 藝術與設計 | `constants.practiceCategory.art_design` |
| 25 | 語言 | `constants.practiceCategory.language` |
| 26 | 身心健康 | `constants.practiceCategory.wellness` |

### 1.6 專業領域選項

**檔案**: `apps/product/src/constants/professional-fields.ts`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 5 | 資訊與資訊通信科技(ICT) | `constants.professionalFields.ict` |
| 6 | 法律 | `constants.professionalFields.law` |
| 7 | 商業與管理 | `constants.professionalFields.business` |
| 8 | 資訊與電腦科學 | `constants.professionalFields.computerScience` |
| 9 | 語言 | `constants.professionalFields.language` |
| 10 | 商管與理財 | `constants.professionalFields.finance` |
| 11 | 社會創新與永續 | `constants.professionalFields.socialInnovation` |
| 12 | 教育 | `constants.professionalFields.education` |
| 13 | 藝術與設計 | `constants.professionalFields.artDesign` |
| 14 | 工程與技術 | `constants.professionalFields.engineering` |

---

## 2. 表單驗證訊息

### 2.1 帳號設定表單

**檔案**: `apps/product/src/components/settings/account/schema.ts`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 20 | 必須年滿16歲 | `validation.accountForm.ageRequired` |
| 23 | 請選擇身份 | `validation.accountForm.roleRequired` |
| 24 | 請選擇教育階段 | `validation.accountForm.educationStageRequired` |
| 25 | 最多只能選擇5個專業領域 | `validation.accountForm.professionalFieldsMax` |
| 26 | 最多只能選擇5個探索領域 | `validation.accountForm.explorationFieldsMax` |

### 2.2 偏好設定表單

**檔案**: `apps/product/src/components/settings/preferences/schema.ts`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 22 | 每個偏好類別至少需要選擇一個選項 | `validation.preferencesForm.atLeastOneOption` |

### 2.3 公開資訊表單

**檔案**: `apps/product/src/components/settings/public-info/schema.ts`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 16 | 請輸入有效的網址 | `validation.publicInfoForm.invalidUrl` |
| 22 | ID 最多 50 個字符 | `validation.publicInfoForm.idMaxLength` |
| 25 | 此為必填欄位 | `validation.publicInfoForm.required` |
| 25 | 個人標語最多 150 字 | `validation.publicInfoForm.sloganMaxLength` |
| 26 | 關於我最多 350 字 | `validation.publicInfoForm.introductionMaxLength` |

### 2.4 打卡表單

**檔案**: `apps/product/src/components/check-in/form/schema.ts`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 13 | 請選擇心情 | `validation.checkInForm.moodRequired` |
| 15 | 請至少選擇一個標籤 | `validation.checkInForm.tagsRequired` |
| 16 | 請輸入描述 | `validation.checkInForm.descriptionRequired` |
| 16 | 最多300字 | `validation.checkInForm.descriptionMaxLength` |
| 17 | 最多只能上傳3張圖片 | `validation.checkInForm.mediaMaxFiles` |

### 2.5 實踐建立表單

**檔案**: `apps/product/src/components/practice/create/manual/schema.ts`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 58 | 請輸入名稱 | `validation.practiceForm.nameRequired` |
| 59 | 請輸入實踐行動 | `validation.practiceForm.actionRequired` |
| 59 | 最多50字 | `validation.practiceForm.actionMaxLength` |
| 76 | 請選擇開始時間 | `validation.practiceForm.startDateRequired` |
| 78 | 請選擇有效的日期 | `validation.practiceForm.invalidDate` |
| 83 | 日期不能早於今天 | `validation.practiceForm.dateInPast` |
| 87 | 日期不能晚於 {date} | `validation.practiceForm.dateTooFar` |
| 93 | 請選擇想要持續多久 | `validation.practiceForm.durationRequired` |
| 96 | 請選擇每週實踐頻率 | `validation.practiceForm.frequencyRequired` |
| 101 | 請至少選擇一個執行時機 | `validation.practiceForm.timingRequired` |
| 105 | 標籤最多 {count} 個 | `validation.practiceForm.tagsMaxCount` |
| 110 | 請輸入資源名稱 | `validation.practiceForm.resourceNameRequired` |
| 113 | 請輸入有效的網址 | `validation.practiceForm.invalidUrl` |
| 115 | 網址必須使用 HTTPS | `validation.practiceForm.httpsRequired` |

---

## 3. 表單選項標籤

### 3.1 時間長度選項

**檔案**: `apps/product/src/components/practice/create/manual/schema.ts`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 13 | 15分鐘 | `form.durationMinutes.15` |
| 14 | 30分鐘 | `form.durationMinutes.30` |
| 15 | 45分鐘 | `form.durationMinutes.45` |
| 16 | 60分鐘 | `form.durationMinutes.60` |
| 20 | 7天 | `form.durationDays.7` |
| 21 | 14天 | `form.durationDays.14` |
| 22 | 21天 | `form.durationDays.21` |
| 23 | 30天 | `form.durationDays.30` |

### 3.2 頻率選項

**檔案**: `apps/product/src/components/practice/create/manual/schema.ts`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 28-44 | 輕鬆起步/紮實執行/密集小跑 | `form.frequency.*` |

### 3.3 執行時機選項

**檔案**: `apps/product/src/components/practice/create/manual/schema.ts`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 48 | 早餐前 | `form.executionTiming.morning` |
| 49 | 通勤時 | `form.executionTiming.commute` |
| 50 | 午休時 | `form.executionTiming.lunch` |
| 51 | 晚餐後 | `form.executionTiming.evening` |
| 52 | 睡前 | `form.executionTiming.beforeSleep` |

---

## 4. Placeholder 文字

### 4.1 公開資訊表單

**檔案**: `apps/product/src/components/settings/public-info/basic-info-section.tsx`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 120 | 請輸入公開顯示的名稱 | `placeholder.publicInfoForm.name` |
| 142 | 請輸入使用者 ID | `placeholder.publicInfoForm.customId` |

### 4.2 社群連結表單

**檔案**: `apps/product/src/components/settings/public-info/social-links-section.tsx`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 34 | 請輸入個人網址 | `placeholder.socialLinks.website` |
| 56 | 請輸入 Facebook 網址 | `placeholder.socialLinks.facebook` |
| 78 | 請輸入 Instagram 網址 | `placeholder.socialLinks.instagram` |
| 100 | 請輸入 LinkedIn 網址 | `placeholder.socialLinks.linkedin` |
| 122 | 請輸入 Github 網址 | `placeholder.socialLinks.github` |
| 144 | 請輸入 Discord User ID | `placeholder.socialLinks.discord` |
| 165 | 請輸入 LINE ID | `placeholder.socialLinks.line` |
| 186 | 請輸入 Threads 網址 | `placeholder.socialLinks.threads` |

### 4.3 帳號設定表單

**檔案**: `apps/product/src/components/settings/account/personal-info-section.tsx`

| 行號 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| 120 | 請選擇身份 | `placeholder.accountForm.role` |
| 163 | 請選擇教育階段 | `placeholder.accountForm.educationStage` |

---

## 5. Toast 和對話框訊息

### 5.1 成功訊息

| 檔案 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| settings/public-info/public-info-form.tsx | 公開資訊設定已更新 | `messages.toast.publicInfoUpdated` |
| settings/account/account-form.tsx | 帳號設定已更新 | `messages.toast.accountUpdated` |
| settings/preferences/preferences-form.tsx | 偏好設定已更新 | `messages.toast.preferencesUpdated` |
| settings/archived-content-list.tsx | 實踐已成功取消封存 | `messages.toast.practiceRestored` |
| settings/archived-content-list.tsx | 已復原封存 | `messages.toast.archived` |
| practices/[id]/page.tsx | 實踐已成功復原 | `messages.toast.practiceRecovered` |
| practices/[id]/edit/page.tsx | 實踐已成功更新 | `messages.toast.practiceUpdated` |
| hooks/use-delete-practice-dialog.tsx | 實踐已成功刪除 | `messages.toast.practiceDeleted` |
| hooks/use-archive-practice-dialog.tsx | 實踐已成功封存，你可以在設定中觀看已封存的內容 | `messages.toast.practiceArchived` |
| hooks/use-delete-check-in-dialog.tsx | 打卡已成功刪除 | `messages.toast.checkInDeleted` |
| components/user/user-info-card.tsx | 已複製到剪貼簿 | `messages.toast.copiedToClipboard` |
| components/check-in/form/hooks/use-check-in-submit.ts | 打卡中... | `messages.toast.checkingIn` |

### 5.2 錯誤訊息

| 檔案 | 硬編碼文字 | 建議 i18n key |
|------|-----------|---------------|
| settings/public-info/public-info-form.tsx | 更新失敗，請稍後再試 | `messages.toast.updateFailed` |
| settings/account/account-form.tsx | 更新失敗，請稍後再試 | `messages.toast.updateFailed` |
| settings/preferences/preferences-form.tsx | 更新失敗，請稍後再試 | `messages.toast.updateFailed` |
| settings/preferences/preference-selection-sheet-content.tsx | 請選擇至少一個選項 | `messages.toast.selectAtLeastOne` |
| components/user/user-info-card.tsx | 複製失敗 | `messages.toast.copyFailed` |
| practices/[id]/edit/page.tsx | 儲存失敗，請稍後再試 | `messages.toast.saveFailed` |
| settings/preferences/preferences-form.tsx | 請檢查表單欄位 | `messages.toast.checkFormFields` |

### 5.3 對話框訊息

#### 刪除實踐對話框

**檔案**: `apps/product/src/hooks/use-delete-practice-dialog.tsx`

| 硬編碼文字 | 建議 i18n key |
|-----------|---------------|
| 確定刪除這個實踐？ | `dialog.deletePractice.title` |
| 確定要跟這個主題說再見了嗎？一旦刪除，就無法復原囉。 | `dialog.deletePractice.message` |
| 確定刪除 | `dialog.deletePractice.confirmBtn` |
| 先不要 | `dialog.deletePractice.cancelBtn` |

#### 封存實踐對話框

**檔案**: `apps/product/src/hooks/use-archive-practice-dialog.tsx`

| 硬編碼文字 | 建議 i18n key |
|-----------|---------------|
| 即將封存這個實踐 | `dialog.archivePractice.title` |
| 我們會幫你把實踐收在「封存」裡面，你會暫時看不到它，除非取消封存喔！ | `dialog.archivePractice.message` |
| 先不要 | `dialog.archivePractice.cancelBtn` |
| 確定封存 | `dialog.archivePractice.confirmBtn` |
| 復原 | `dialog.archivePractice.restoreBtn` |

#### 刪除打卡對話框

**檔案**: `apps/product/src/hooks/use-delete-check-in-dialog.tsx`

| 硬編碼文字 | 建議 i18n key |
|-----------|---------------|
| 確定刪除這個打卡? | `dialog.deleteCheckIn.title` |
| 確定要跟這個打卡說再見了嗎？一旦刪除，就無法復原囉。 | `dialog.deleteCheckIn.message` |
| 確定刪除 | `dialog.deleteCheckIn.confirmBtn` |
| 先不要 | `dialog.deleteCheckIn.cancelBtn` |

---

## 6. 導覽和 UI 標籤

### 6.1 側邊欄導覽

**檔案**: `apps/product/src/components/layout/sidebar/constant.tsx`

| 硬編碼文字 | 建議 i18n key |
|-----------|---------------|
| 我的小島 | `nav.myIsland` |
| 探索社群 | `nav.exploreCommunity` |
| 成長地圖 | `nav.growthMap` |
| 最新通知 | `nav.notifications` |
| 個人資料 | `nav.profile` |

### 6.2 設定頁面選項

**檔案**: `apps/product/src/components/settings/settings-list.tsx`

| 硬編碼文字 | 建議 i18n key |
|-----------|---------------|
| 領域偏好設定 | `settings.fieldPreferences` |
| 帳號設定 | `settings.account` |
| 公開資訊設定 | `settings.publicInfo` |
| 已封存的內容 | `settings.archivedContent` |

### 6.3 首頁卡片標籤

**檔案**: `apps/product/src/app/[locale]/(with-layout)/page.tsx`

| 硬編碼文字 | 建議 i18n key |
|-----------|---------------|
| 主題實踐 | `page.home.themePractices` |
| 連續登入 | `page.home.consecutiveCheckIns` |
| 獲得迴響 | `page.home.receivedFeedback` |

---

## 7. 統計摘要

### 按類型分類

| 類型 | 數量 | 優先級 |
|------|------|--------|
| Constants 硬編碼選項 | 38 項 | 🔴 高 |
| 表單驗證訊息 | 30+ 項 | 🔴 高 |
| Toast 訊息 | 13 項 | 🔴 高 |
| 對話框訊息 | 15+ 項 | 🔴 高 |
| Placeholder 文字 | 12 項 | 🟡 中 |
| 導覽和 UI 標籤 | 12 項 | 🟡 中 |
| **總計** | **120+ 項** | - |

### 按檔案類型分類

| 檔案類型 | 數量 |
|----------|------|
| Constants 檔案 (*.ts) | 6 個 |
| Schema 檔案 (schema.ts) | 5 個 |
| 元件檔案 (*.tsx) | 15+ 個 |
| Hooks 檔案 (*.tsx) | 3 個 |

---

## 8. 建議修復方式

### 8.1 i18n key 命名規範

```
{namespace}.{category}.{key}
```

#### 命名空間建議

| 命名空間 | 用途 | 範例 |
|----------|------|------|
| `constants` | 選項常數 | `constants.userRole.student` |
| `validation` | 表單驗證訊息 | `validation.accountForm.roleRequired` |
| `messages` | Toast/通知訊息 | `messages.toast.updateFailed` |
| `dialog` | 對話框內容 | `dialog.deletePractice.title` |
| `form` | 表單選項標籤 | `form.durationMinutes.15` |
| `placeholder` | 輸入框提示文字 | `placeholder.publicInfoForm.name` |
| `nav` | 導覽標籤 | `nav.myIsland` |
| `settings` | 設定頁面 | `settings.account` |
| `page` | 頁面特定內容 | `page.home.themePractices` |

### 8.2 重構建議

#### Constants 的 i18n 化

```typescript
// ❌ 目前方式 (不支援 i18n)
export const ROLE_OPTIONS = [
  { value: UserRole.student, label: "學生" },
];

// ✅ 建議方式 (支援 i18n)
export const ROLE_OPTIONS = [
  { value: UserRole.student },
];

// 在元件中使用
const t = useTranslations('constants.userRole');
const options = ROLE_OPTIONS.map(opt => ({
  ...opt,
  label: t(opt.value)
}));
```

#### 表單驗證訊息的 i18n 化

```typescript
// ❌ 目前方式
role: z.string().min(1, '請選擇身份'),

// ✅ 建議方式
const t = useTranslations('validation');
role: z.string().min(1, t('accountForm.roleRequired')),
```

#### Toast 訊息的 i18n 化

```typescript
// ❌ 目前方式
toast.success('公開資訊設定已更新');

// ✅ 建議方式
const t = useTranslations('messages');
toast.success(t('toast.publicInfoUpdated'));
```

### 8.3 翻譯檔案結構建議

```json
{
  "constants": {
    "educationStage": { ... },
    "userRole": { ... },
    "mood": { ... },
    "taskStatus": { ... },
    "practiceCategory": { ... },
    "professionalFields": { ... }
  },
  "validation": {
    "accountForm": { ... },
    "preferencesForm": { ... },
    "publicInfoForm": { ... },
    "checkInForm": { ... },
    "practiceForm": { ... }
  },
  "messages": {
    "toast": { ... }
  },
  "dialog": {
    "deletePractice": { ... },
    "archivePractice": { ... },
    "deleteCheckIn": { ... }
  },
  "form": {
    "durationMinutes": { ... },
    "durationDays": { ... },
    "frequency": { ... },
    "executionTiming": { ... }
  },
  "placeholder": { ... },
  "nav": { ... },
  "settings": { ... },
  "page": { ... }
}
```

### 8.4 實施優先順序

1. **第一階段**: Constants 硬編碼選項 (影響面最廣)
2. **第二階段**: 表單驗證訊息 (用戶體驗關鍵)
3. **第三階段**: Toast/Dialog 訊息 (用戶互動回饋)
4. **第四階段**: 導覽和 UI 標籤 (整體一致性)

---

## 9. 已完成的 i18n 項目

以下項目已完成國際化：

- ✅ 首頁主要內容
- ✅ 關於頁面
- ✅ 服務條款
- ✅ 隱私政策
- ✅ 使用者資料相關頁面

---

## 10. 備註

- 此文件應定期更新，反映最新的 i18n 進度
- 新增功能時應同步考慮 i18n 需求
- 建議建立 CI 檢查，防止新的硬編碼文字被引入
