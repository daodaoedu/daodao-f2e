# Kit 電子報訂閱整合規劃

## 目標

整合 Kit（前身 ConvertKit）電子報服務到 website 的 Footer 訂閱表單，讓訪客可以直接訂閱電子報。

---

## 現況分析

### 現有元件
- **位置**: `apps/website/src/components/layout/footer.tsx:111-121`
- **狀態**: 只有 UI，沒有實際功能
- **UI 元素**: email input + 訂閱按鈕

### 現有使用者訂閱機制
- 已登入使用者可透過 `isSubscribeEmail` 欄位設定訂閱偏好
- 此功能獨立於 Kit 整合，兩者可並存

---

## 技術方案

### 選擇：Kit Form API

使用 Kit 提供的 Form endpoint 直接從前端訂閱。

**優點**:
- 保持現有 UI 設計
- 不需要後端改動
- 不需要管理 API key（Form endpoint 是公開的）
- 實作簡單、維護容易

**Kit Form Endpoint**:
```
POST https://app.kit.com/forms/{FORM_ID}/subscriptions
Content-Type: application/json

{
  "email_address": "user@example.com"
}
```

---

## 實作計劃

### 1. 環境變數設定

**檔案**: `.env.local`, `.env.example`

```env
NEXT_PUBLIC_KIT_FORM_ID=your_form_id_here
```

### 2. 修改 Footer 元件

**檔案**: `apps/website/src/components/layout/footer.tsx`

**變更內容**:
- 新增 `email` state 控制 input 值
- 新增 `status` state 追蹤訂閱狀態（idle / loading / success / error）
- 新增 `handleSubscribe` 函數處理表單提交
- 更新 UI 顯示對應狀態

**訂閱狀態流程**:
```
idle → loading → success
                ↘ error
```

### 3. 新增 i18n 翻譯

**檔案**: `packages/i18n/src/locales/zh-TW.json`, `packages/i18n/src/locales/en.json`

| Key | 中文 | English |
|-----|------|---------|
| `footer_subscribing` | 訂閱中... | Subscribing... |
| `footer_subscribed` | 訂閱成功！ | Subscribed! |
| `footer_subscribe_error` | 訂閱失敗，請稍後再試 | Failed to subscribe, please try again |
| `footer_subscribe_retry` | 重試 | Retry |

### 4. 程式碼範例

```tsx
"use client";

import { useState } from "react";
// ... 其他 imports

const KIT_FORM_ID = process.env.NEXT_PUBLIC_KIT_FORM_ID;

export const Footer = () => {
  const t = useTranslations("common");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !KIT_FORM_ID) return;

    setStatus("loading");

    try {
      const response = await fetch(
        `https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email_address: email }),
        }
      );

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  // ... JSX 部分見下方
};
```

**表單 JSX**:
```tsx
<form className="space-y-3" onSubmit={handleSubscribe}>
  <input
    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-base"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder={t("footer_email_placeholder")}
    disabled={status === "loading" || status === "success"}
    required
  />
  <Button
    type="submit"
    variant="ctaPrimary"
    size="huge"
    className="w-full"
    disabled={status === "loading" || status === "success" || !email}
  >
    {status === "loading" && t("footer_subscribing")}
    {status === "success" && t("footer_subscribed")}
    {(status === "idle" || status === "error") && t("footer_subscribe_button")}
    {status !== "success" && <ChevronRight className="ml-2 size-5" />}
  </Button>
  {status === "error" && (
    <p className="text-sm text-red-400">{t("footer_subscribe_error")}</p>
  )}
</form>
```

---

## 檔案變更清單

| 檔案 | 變更類型 | 說明 |
|------|----------|------|
| `apps/website/src/components/layout/footer.tsx` | 修改 | 新增訂閱邏輯 |
| `packages/i18n/src/locales/zh-TW.json` | 修改 | 新增翻譯 |
| `packages/i18n/src/locales/en.json` | 修改 | 新增翻譯 |
| `.env.example` | 修改 | 新增 `NEXT_PUBLIC_KIT_FORM_ID` |
| `.env.local` | 修改 | 設定實際 Form ID |

---

## 前置需求

1. 在 Kit 後台建立表單（Form）
2. 取得 Form ID（從表單設定或 URL 中取得）
3. 確認 Form 的 double opt-in 設定符合需求

---

## 測試計劃

### 功能測試
- [ ] 輸入有效 email 並提交，應顯示成功狀態
- [ ] 輸入無效 email 格式，瀏覽器應阻擋提交
- [ ] 網路錯誤時應顯示錯誤狀態
- [ ] 成功後 input 應清空
- [ ] Loading 狀態時按鈕應 disabled

### 跨瀏覽器測試
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Kit 後台驗證
- [ ] 確認訂閱者有出現在 Kit 後台
- [ ] 確認 double opt-in 信件有發送（如有設定）

---

## 未來擴展（可選）

如需更進階功能，可考慮：

1. **Server Action 版本** - 加入 reCAPTCHA/Turnstile 防機器人
2. **同步 isSubscribeEmail** - 已登入用戶訂閱時同步更新資料庫
3. **訂閱來源追蹤** - 傳送 `referrer` 參數到 Kit
4. **自訂欄位** - 收集姓名或其他資訊

---

## 參考資料

- [Kit API Documentation](https://developers.kit.com/)
- [Kit Forms API](https://developers.kit.com/v4#tag/Forms)
