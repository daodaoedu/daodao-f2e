# Analytics 追蹤事件指南

本文件定義島島阿學專案應追蹤的事件，以及各追蹤工具的使用方式。

## 目錄

- [追蹤工具概覽](#追蹤工具概覽)
- [優先級 1：核心轉化漏斗](#優先級-1核心轉化漏斗)
- [優先級 2：用戶行為洞察](#優先級-2用戶行為洞察)
- [優先級 3：功能使用追蹤](#優先級-3功能使用追蹤)
- [事件屬性規範](#事件屬性規範)
- [實作指南](#實作指南)
- [建議報表](#建議報表)

---

## 追蹤工具概覽

專案整合了三個追蹤服務：

| 工具 | 用途 | 適用場景 |
|------|------|----------|
| **Google Analytics** | 流量分析 | 頁面瀏覽、基本事件 |
| **Microsoft Clarity** | 會話重放 | 用戶行為錄影、熱力圖、Debug |
| **PostHog** | 產品分析 | 漏斗、留存、功能開關、A/B 測試 |

### 使用方式

```typescript
import {
  // Google Analytics
  trackEvent,
  trackPageView,

  // Microsoft Clarity
  clarityIdentify,
  claritySetTag,
  clarityEvent,

  // PostHog
  posthogCapture,
  posthogIdentify,
  posthogReset,
  posthogSetPersonProperties,
  posthogIsFeatureEnabled,
  posthogGetFeatureFlag,
} from '@daodao/analytics'
```

### 工具選擇建議

| 場景 | 推薦工具 | 原因 |
|------|----------|------|
| 頁面瀏覽追蹤 | GA | 標準流量分析 |
| 轉化漏斗分析 | PostHog | 漏斗視覺化 |
| 用戶留存分析 | PostHog | 留存報表 |
| Debug 用戶問題 | Clarity | 會話重放 |
| A/B 測試 | PostHog | Feature Flags |
| 用戶分群 | PostHog | 自定義屬性過濾 |

---

## 優先級 1：核心轉化漏斗

### 1.1 實踐建立漏斗

追蹤用戶從開始到完成建立實踐的完整流程。

| 事件名稱 | 觸發時機 | 必要屬性 | 檔案位置 |
|----------|----------|----------|----------|
| `practice_creation_started` | 點擊「新增任務」FAB | `entry_point` | `dashboard/page.tsx` |
| `practice_category_viewed` | 查看類別選擇頁 | - | `practices/create/page.tsx` |
| `practice_template_selected` | 選擇模板 | `template_id`, `template_name` | `practices/create/page.tsx` |
| `practice_manual_started` | 選擇自訂建立 | - | `practices/create/page.tsx` |
| `practice_step_completed` | 完成每個步驟 | `step_number`, `step_name` | `create/manual/page.tsx` |
| `practice_created` | 成功建立實踐 | `practice_id`, `is_from_template`, `category` | `create/success/page.tsx` |
| `practice_creation_abandoned` | 離開建立流程 | `last_step`, `time_spent` | `create/manual/page.tsx` |
| `practice_draft_saved` | 保存草稿 | `step_number` | `create/manual/page.tsx` |
| `practice_draft_restored` | 恢復草稿 | - | `create/manual/page.tsx` |

**實作範例：**

```typescript
// 點擊新增任務
posthogCapture('practice_creation_started', {
  entry_point: 'dashboard_fab'
})

// 完成步驟
posthogCapture('practice_step_completed', {
  step_number: 1,
  step_name: 'basic_info',
  time_on_step: 45 // 秒
})

// 成功建立
posthogCapture('practice_created', {
  practice_id: 'prac_123',
  is_from_template: false,
  category: 'language',
  total_creation_time: 180 // 秒
})
```

### 1.2 打卡漏斗

追蹤用戶每日打卡的完整流程。

| 事件名稱 | 觸發時機 | 必要屬性 | 檔案位置 |
|----------|----------|----------|----------|
| `check_in_started` | 打開打卡表單 | `practice_id` | `check-in-sheet.tsx` |
| `check_in_mood_selected` | 選擇心情 | `mood` | `check-in-sheet.tsx` |
| `check_in_tags_added` | 添加標籤 | `tags_count`, `tags` | `check-in-sheet.tsx` |
| `check_in_media_uploaded` | 上傳媒體 | `media_count`, `media_types` | `check-in-sheet.tsx` |
| `check_in_completed` | 完成打卡 | `practice_id`, `mood`, `has_description`, `media_count` | `check-in-sheet.tsx` |
| `check_in_abandoned` | 關閉未完成 | `practice_id`, `filled_fields` | `check-in-sheet.tsx` |

**實作範例：**

```typescript
// 開始打卡
posthogCapture('check_in_started', {
  practice_id: 'prac_123'
})

// 完成打卡
posthogCapture('check_in_completed', {
  practice_id: 'prac_123',
  mood: 'happy',
  has_description: true,
  description_length: 150,
  media_count: 2,
  tags: ['練習', '有趣']
})
```

### 1.3 連續打卡里程碑

| 事件名稱 | 觸發時機 | 必要屬性 |
|----------|----------|----------|
| `streak_milestone_reached` | 達成連續打卡里程碑 | `streak_days`, `milestone` |

**里程碑定義：** 3, 7, 14, 21, 30, 60, 90, 180, 365 天

```typescript
posthogCapture('streak_milestone_reached', {
  streak_days: 7,
  milestone: '7_days',
  practice_id: 'prac_123'
})
```

---

## 優先級 2：用戶行為洞察

### 2.1 認證流程

| 事件名稱 | 觸發時機 | 必要屬性 |
|----------|----------|----------|
| `signup_started` | 進入註冊頁 | `referrer` |
| `signup_completed` | 註冊成功 | `method` |
| `signup_failed` | 註冊失敗 | `method`, `error_type` |
| `login_completed` | 登入成功 | `method`, `is_returning_user` |
| `login_failed` | 登入失敗 | `method`, `error_type` |
| `logout_completed` | 登出 | - |
| `password_reset_requested` | 請求重設密碼 | - |
| `password_reset_completed` | 完成重設密碼 | - |

**method 值：** `email`, `google`, `facebook`, `apple`

```typescript
// 註冊完成
posthogCapture('signup_completed', {
  method: 'google'
})

// 識別用戶
posthogIdentify(userId, {
  email: user.email,
  name: user.name,
  signup_date: new Date().toISOString(),
  signup_method: 'google'
})
```

### 2.2 內容互動

| 事件名稱 | 觸發時機 | 必要屬性 |
|----------|----------|----------|
| `practice_viewed` | 查看實踐詳情 | `practice_id`, `is_own_practice` |
| `check_in_viewed` | 查看打卡詳情 | `check_in_id`, `practice_id` |
| `user_profile_viewed` | 查看用戶檔案 | `viewed_user_id`, `is_own_profile` |
| `check_in_shared` | 分享打卡 | `check_in_id`, `platform` |
| `resource_link_clicked` | 點擊參考資源 | `resource_url`, `practice_id` |

**platform 值：** `line`, `facebook`, `twitter`, `copy_link`

```typescript
posthogCapture('check_in_shared', {
  check_in_id: 'ci_456',
  practice_id: 'prac_123',
  platform: 'line'
})
```

### 2.3 Landing Page（用戶獲取）

| 事件名稱 | 觸發時機 | 必要屬性 |
|----------|----------|----------|
| `landing_page_viewed` | 進入 Landing Page | `referrer`, `utm_source`, `utm_campaign` |
| `cta_clicked` | 點擊「立即加入」 | `cta_location` |
| `feature_section_viewed` | 功能區塊進入視窗 | `section_name` |
| `testimonial_viewed` | 見證區塊進入視窗 | - |

**cta_location 值：** `hero`, `feature_section`, `bottom_cta`

### 2.4 測驗功能

| 事件名稱 | 觸發時機 | 必要屬性 |
|----------|----------|----------|
| `quiz_started` | 開始測驗 | - |
| `quiz_question_answered` | 回答問題 | `question_id`, `answer` |
| `quiz_completed` | 完成測驗 | `result_type`, `time_spent` |
| `quiz_result_viewed` | 查看結果 | `result_type` |
| `quiz_result_shared` | 分享結果 | `result_type`, `platform` |

```typescript
posthogCapture('quiz_completed', {
  result_type: 'explorer',
  time_spent: 120, // 秒
  questions_answered: 10
})
```

---

## 優先級 3：功能使用追蹤

### 3.1 實踐管理

| 事件名稱 | 觸發時機 | 必要屬性 |
|----------|----------|----------|
| `practice_archived` | 封存實踐 | `practice_id`, `days_active`, `total_check_ins` |
| `practice_restored` | 恢復實踐 | `practice_id` |
| `practice_deleted` | 刪除實踐 | `practice_id`, `days_active`, `total_check_ins` |
| `practice_tags_edited` | 編輯標籤 | `practice_id`, `tags_added`, `tags_removed` |
| `practice_resources_added` | 添加資源 | `practice_id`, `resource_count` |

```typescript
posthogCapture('practice_archived', {
  practice_id: 'prac_123',
  days_active: 30,
  total_check_ins: 25,
  completion_rate: 0.83
})
```

### 3.2 媒體上傳

| 事件名稱 | 觸發時機 | 必要屬性 |
|----------|----------|----------|
| `media_upload_started` | 開始上傳 | `media_type`, `file_size` |
| `media_upload_completed` | 上傳完成 | `media_type`, `file_size`, `upload_time` |
| `media_upload_failed` | 上傳失敗 | `media_type`, `error_type` |

**media_type 值：** `image`, `video`

### 3.3 設定頁面

| 事件名稱 | 觸發時機 | 必要屬性 |
|----------|----------|----------|
| `settings_viewed` | 進入設定頁 | - |
| `account_info_edited` | 編輯帳戶資訊 | `fields_changed` |
| `profile_visibility_changed` | 修改隱私設定 | `new_settings` |
| `language_changed` | 切換語言 | `from_language`, `to_language` |
| `account_deletion_requested` | 請求刪除帳戶 | - |

### 3.4 錯誤追蹤

| 事件名稱 | 觸發時機 | 必要屬性 |
|----------|----------|----------|
| `api_error_occurred` | API 錯誤 | `endpoint`, `status_code`, `error_message` |
| `form_validation_error` | 表單驗證失敗 | `form_name`, `field_name`, `error_type` |
| `page_not_found` | 404 錯誤 | `attempted_path` |

---

## 事件屬性規範

### 通用屬性（自動附加）

以下屬性會自動附加到所有事件：

```typescript
{
  // 由 PostHog 自動收集
  $current_url: string,      // 當前頁面 URL
  $referrer: string,         // 來源頁面
  $device_type: string,      // desktop, mobile, tablet
  $os: string,               // 作業系統
  $browser: string,          // 瀏覽器

  // 由應用附加
  locale: string,            // 語言設定 (zh-TW, en)
  app_version: string,       // 應用版本
}
```

### 用戶屬性

登入後應設定的用戶屬性：

```typescript
posthogIdentify(userId, {
  email: string,
  name: string,
  signup_date: ISO8601,
  signup_method: 'email' | 'google' | 'facebook',
  total_practices: number,
  total_check_ins: number,
  longest_streak: number,
  last_active_date: ISO8601,
})
```

### 命名規範

1. **事件名稱**：使用 `snake_case`，格式為 `object_action`
   - ✅ `practice_created`, `check_in_completed`
   - ❌ `practiceCreated`, `CheckInCompleted`

2. **屬性名稱**：使用 `snake_case`
   - ✅ `practice_id`, `is_from_template`
   - ❌ `practiceId`, `isFromTemplate`

3. **布林值**：使用 `is_` 或 `has_` 前綴
   - ✅ `is_own_practice`, `has_description`
   - ❌ `own_practice`, `description_exists`

---

## 實作指南

### 步驟 1：建立追蹤 Hook

建議建立統一的追蹤 hook：

```typescript
// hooks/use-analytics.ts
import { posthogCapture, trackEvent, clarityEvent } from '@daodao/analytics'

export function useAnalytics() {
  const track = useCallback((
    event: string,
    properties?: Record<string, unknown>
  ) => {
    // 同時發送到多個平台
    posthogCapture(event, properties)
    trackEvent(event, 'user_action', properties?.label as string)
    clarityEvent(event)
  }, [])

  return { track }
}
```

### 步驟 2：在元件中使用

```typescript
// components/dashboard/check-in-sheet.tsx
import { useAnalytics } from '@/hooks/use-analytics'

export function CheckInSheet({ practiceId }: Props) {
  const { track } = useAnalytics()

  useEffect(() => {
    track('check_in_started', { practice_id: practiceId })
  }, [])

  const handleSubmit = async (data: FormData) => {
    await submitCheckIn(data)
    track('check_in_completed', {
      practice_id: practiceId,
      mood: data.mood,
      has_description: !!data.description,
      media_count: data.media.length
    })
  }
}
```

### 步驟 3：追蹤漏斗流失

使用 `beforeunload` 或路由變化追蹤流失：

```typescript
// 實踐建立流程
useEffect(() => {
  const handleBeforeUnload = () => {
    if (currentStep < totalSteps) {
      track('practice_creation_abandoned', {
        last_step: currentStep,
        time_spent: Date.now() - startTime
      })
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [currentStep])
```

---

## 建議報表

### 1. 實踐建立漏斗

```
practice_creation_started
    ↓ (轉化率 %)
practice_category_viewed
    ↓
practice_template_selected / practice_manual_started
    ↓
practice_step_completed (step 1-5)
    ↓
practice_created
```

**關鍵指標：**
- 整體轉化率（開始 → 完成）
- 各步驟流失率
- 模板 vs 自訂建立比例
- 平均建立時間

### 2. 打卡完成率

```
每日活躍用戶 (DAU)
    ÷
有進行中實踐的用戶數
    =
打卡完成率
```

**關鍵指標：**
- 每日打卡完成率
- 平均每用戶打卡數
- 心情分布
- 媒體使用率

### 3. 用戶留存

```
第 N 天留存 =
  第 N 天有打卡的用戶數 / 註冊用戶數
```

**關鍵指標：**
- D1, D7, D14, D30 留存率
- 連續打卡天數分布
- 各里程碑達成率

### 4. 功能使用熱度

```
功能使用次數排名
功能使用用戶數排名
新功能採用率
```

---

## 環境變數設定

```env
# .env.local

# 啟用追蹤（設為 "true" 啟用）
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Microsoft Clarity
NEXT_PUBLIC_CLARITY_PROJECT_ID=xxxxxxxxxx

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## 附錄：事件清單總覽

### 優先級 1（核心）
- `practice_creation_started`
- `practice_category_viewed`
- `practice_template_selected`
- `practice_manual_started`
- `practice_step_completed`
- `practice_created`
- `practice_creation_abandoned`
- `practice_draft_saved`
- `practice_draft_restored`
- `check_in_started`
- `check_in_mood_selected`
- `check_in_tags_added`
- `check_in_media_uploaded`
- `check_in_completed`
- `check_in_abandoned`
- `streak_milestone_reached`

### 優先級 2（行為洞察）
- `signup_started`
- `signup_completed`
- `signup_failed`
- `login_completed`
- `login_failed`
- `logout_completed`
- `password_reset_requested`
- `password_reset_completed`
- `practice_viewed`
- `check_in_viewed`
- `user_profile_viewed`
- `check_in_shared`
- `resource_link_clicked`
- `landing_page_viewed`
- `cta_clicked`
- `feature_section_viewed`
- `quiz_started`
- `quiz_question_answered`
- `quiz_completed`
- `quiz_result_viewed`
- `quiz_result_shared`

### 優先級 3（功能使用）
- `practice_archived`
- `practice_restored`
- `practice_deleted`
- `practice_tags_edited`
- `practice_resources_added`
- `media_upload_started`
- `media_upload_completed`
- `media_upload_failed`
- `settings_viewed`
- `account_info_edited`
- `profile_visibility_changed`
- `language_changed`
- `account_deletion_requested`
- `api_error_occurred`
- `form_validation_error`
- `page_not_found`
