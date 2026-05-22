# 登入與認證流程

本文整理 daodao 平台前後端的登入、OAuth、Onboarding、路由保護流程，供工程師快速理解整體運作。

前端程式碼以 `daodao-f2e/apps/product` 為主，使用 `@daodao/auth` package；後端以 `daodao-server` 為主，由 Google OAuth callback 驅動。

---

## 登入流程總覽

```mermaid
flowchart TD
    U["使用者觸發登入"] --> T{"觸發方式"}

    T -->|"點擊登入按鈕"| B["AuthButton 點擊"]
    T -->|"訪問需認證頁面"| G["AuthProvider 路由保護<br/>(onAuthRequired callback)"]
    T -->|"useRequireAuth() 頁面"| Q["push /auth/login?redirect=..."]

    B --> D["openLoginDialog()"]
    G --> L["/auth/login (自動開 Dialog)"]
    Q --> L
    L --> CHK{"已登入?"}
    CHK -->|"是"| TGT0["window.location.href = redirect"]
    CHK -->|"否"| D

    D --> P["Google OAuth (唯一選項)"]
    P --> G_O["initiateOAuthLogin()<br/>Redirect 後端 /api/v1/auth/google"]

    G_O --> C["/auth/callback?state=...&isNewUser=..."]
    C --> R["useRedirectAfterLogin()"]
    R --> N{"isNewUser?"}

    N -->|"是"| ON["hardNavigate /auth/onboarding"]
    N -->|"否"| H{"驗證 state 成功?"}

    H -->|"是"| TARGET["hardNavigate state.redirectUrl"]
    H -->|"否"| DEFAULT["hardNavigate / (首頁)"]

    ON --> FORM["填寫 OnboardingForm"]
    FORM --> COMPLETE["isTemporary=false"]
    COMPLETE --> EVCHK{"isEmailVerified?"}
    EVCHK -->|"是"| HOME["Redirect /"]
    EVCHK -->|"否"| VERIFY["Redirect /auth/verify-email"]
```

---

## OAuth State 驗證流程

```mermaid
flowchart TD
    C["/auth/callback 頁面載入"] --> SIG["寫入 AuthSignal<br/>(通知其他 tab 重新驗證)"]
    SIG --> S["取得 URL state 參數"]

    S --> E{"state 存在?"}
    E -->|"否"| N1{"isNewUser?"}
    E -->|"是"| D["decodeOAuthState()"]

    N1 -->|"是"| ON1["hardNavigate /auth/onboarding"]
    N1 -->|"否"| HOME1["hardNavigate /"]

    D --> V{"state 格式正確?"}
    V -->|"否"| N2{"isNewUser?"}
    V -->|"是"| VERIFY["verifyAndConsumeOAuthState()<br/>比對 localStorage 內 nonce<br/>+ 檢查 timestamp 未過期 (10 分鐘)"]

    N2 -->|"是"| ON2["hardNavigate /auth/onboarding"]
    N2 -->|"否"| HOME2["hardNavigate /"]

    VERIFY --> C1{"nonce 匹配且未過期?"}
    C1 -->|"否"| N3{"isNewUser?"}
    C1 -->|"是"| CLEAR["清除 localStorage nonce<br/>(防重放)"]

    N3 -->|"是"| ON3["hardNavigate /auth/onboarding"]
    N3 -->|"否"| HOME3["hardNavigate /"]

    CLEAR --> N4{"isNewUser?"}
    N4 -->|"是"| ON4["hardNavigate /auth/onboarding"]
    N4 -->|"否"| SAFE{"redirectUrl 包含 /auth/error?"}

    SAFE -->|"是"| HOME4["hardNavigate /"]
    SAFE -->|"否"| TARGET["hardNavigate redirectUrl"]
```

> 注意：OAuth nonce 過去使用 sessionStorage，已改用 localStorage。
> sessionStorage 在 iOS Safari ITP / Android Chrome Custom Tab 跨域 redirect 後可能被清空或不共享，
> 會導致 callback 端 state 驗證失敗、redirectUrl 被丟掉、使用者被踢回登入頁。
> 安全性仍由 timestamp（10 分鐘 TTL）+ 一次性消費保障。

---

## Onboarding 與 Email 驗證流程

```mermaid
flowchart TD
    P["/auth/onboarding 頁面載入"] --> C["useAuth() 取得狀態"]

    C --> L{"isLoading?"}
    L -->|"是"| WAIT["顯示 Loading..."]
    L -->|"否"| A{"isAuthenticated?"}

    A -->|"否"| R1["Redirect /"]
    A -->|"是"| T{"isTemporary?"}

    T -->|"否 (已完成)"| R2["Redirect /"]
    T -->|"是 (新用戶)"| I["setHasInitialized(true)"]

    I --> FORM["顯示 OnboardingForm"]
    FORM --> SUBMIT["填寫並提交表單"]

    SUBMIT --> API["呼叫 API 更新用戶資料"]
    API --> SUCCESS["isTemporary = false<br/>refreshAuth()"]

    SUCCESS --> EV{"isEmailVerified?"}
    EV -->|"否"| VRD["AuthProvider 自動 redirect<br/>→ /auth/verify-email"]
    EV -->|"是"| R3["Redirect /"]
```

---

## 各頁面職責

```mermaid
flowchart LR
    subgraph Pages["認證相關頁面"]
        L["/auth/login"] --> |"開啟 LoginDialog<br/>(已登入則直接跳轉)"| D["Dialog"]
        CB["/auth/callback"] --> |"處理跳轉"| R["useRedirectAfterLogin"]
        ON["/auth/onboarding"] --> |"新用戶引導"| F["OnboardingForm"]
        E["/auth/error"] --> |"顯示錯誤"| ERR["錯誤訊息"]
        V["/auth/verify-email"] --> |"信箱驗證"| VEF["驗證流程"]
    end

    subgraph Hooks["認證 Hooks"]
        A["useAuth()"] --> |"狀態管理"| CTX["AuthContext"]
        RA["useRequireAuth()"] --> |"頁面層保護<br/>push /auth/login"| LOGIN["/auth/login"]
        RL["useRedirectAfterLogin()"] --> |"登入後跳轉"| NAV["Navigation"]
    end

    subgraph Components["UI 元件"]
        AB["AuthButton"] --> |"未登入觸發 openLoginDialog"| D
        AG["AuthGuard"] --> |"條件渲染 fallback<br/>(不會跳轉)"| FB["Fallback / children"]
    end

    subgraph Provider["AuthProvider"]
        AP["路由保護"] --> |"符合 protectedPattern<br/>且未登入"| ONAUTH["onAuthRequired(currentPath)"]
        TMP["臨時用戶偵測"] --> |"isTemporary=true"| ONB["跳轉 onboardingPath"]
        EMU["Email 未驗證偵測"] --> |"isEmailVerified=false<br/>且非臨時用戶"| EVP["跳轉 emailVerificationPath"]
        H401["401 自動 refresh"] --> |"refreshToken 失敗"| FALLBACK["clearAuthState + openLoginDialog"]
    end
```

---

## 登入 Dialog 流程

```mermaid
flowchart TD
    O["openLoginDialog()"] --> D["LoginDialog 開啟<br/>(Mobile=Sheet, Desktop=Dialog)"]

    D --> S1["顯示 Google 登入按鈕<br/>+ 服務條款 / 隱私權連結"]
    S1 --> CK["點擊 Google 按鈕"]

    CK --> G["initiateOAuthLogin(redirectUrl, source)"]
    G --> ST["createOAuthState():<br/>產生 nonce + 組 state 物件"]
    ST --> STORE["localStorage 存 nonce<br/>(state 物件 base64url 進 URL)"]
    STORE --> URL["組成 backend URL:<br/>/api/v1/auth/google?state=..."]
    URL --> REDIRECT["window.location.href 跳轉"]

    REDIRECT --> AUTH["使用者在 Google 授權"]
    AUTH --> CB["後端處理 callback 後<br/>redirect 回 /auth/callback"]
```

---

## Android Chrome Custom Tab 場景

```mermaid
sequenceDiagram
    participant U as 使用者
    participant M as 主 Tab (AuthProvider)
    participant C as Chrome Custom Tab
    participant G as Google OAuth

    U->>M: 點擊登入
    M->>C: 開啟 CCT 到 Google OAuth
    C->>G: OAuth 請求
    G->>C: 授權成功，redirect 回 /auth/callback
    C->>C: useRedirectAfterLogin 寫入<br/>localStorage AuthSignal

    par 主要路徑（不可靠）
        C-->>M: storage event 觸發 checkAuth()
    and 補強路徑（必備）
        U->>M: CCT 關閉，主 tab 重新可見
        M->>M: visibilitychange + !isAuthenticated<br/>→ checkAuth()
    end

    M->>M: getAuthMe() → 設定 user/isAuthenticated
    M->>M: 後續流程依 isTemporary / isEmailVerified 決定

    Note over C,M: storage event 在 CCT → 主 tab 不可靠<br/>(獨立 renderer process)，故以 visibilitychange 補強
```

---

## 401 自動續命流程

```mermaid
flowchart TD
    REQ["API 請求"] --> RES{"回應狀態"}
    RES -->|"2xx"| OK["正常處理"]
    RES -->|"401"| H["unauthorizedHandler<br/>(由 AuthProvider 註冊)"]

    H --> RT["呼叫 apiRefreshToken()"]
    RT --> RC{"refresh 成功?"}
    RC -->|"是"| RETRY["原請求由 API client 重試"]
    RC -->|"否"| CLR["clearAuthState()<br/>+ openLoginDialog()"]
```

---

## 後端 Google OAuth Callback 流程

```mermaid
flowchart TD
    A["GET /api/v1/auth/google?state=..."] --> P["passport-google-oauth20<br/>redirect 到 Google"]
    P --> AUTH["使用者在 Google 授權"]
    AUTH --> CB["GET /api/v1/auth/google/callback?code=...&state=..."]

    CB --> ST{"state 存在?"}
    ST -->|"否"| ERR1["redirect /auth/error?reason=missing_state"]
    ST -->|"是"| VAL["validateOAuthState(state)"]

    VAL --> VR{"state 有效?"}
    VR -->|"否 (過期)"| ERR2["redirect /auth/error?reason=state_expired"]
    VR -->|"否 (其他)"| ERR3["redirect /auth/error?reason=invalid_state"]
    VR -->|"是"| NV["oauthNonceService.verifyAndConsumeNonce(nonce)<br/>(Redis)"]

    NV --> NVR{"nonce OK?"}
    NVR -->|"否"| ERR4["redirect /auth/error?reason=nonce_failed"]
    NVR -->|"是"| USR["passport 取得/建立 user<br/>標記 _isNewUser"]

    USR --> JWT["jwtService.sign(user)"]
    JWT --> CKE["setAuthCookie(res, token)<br/>HttpOnly, Secure, SameSite=none"]

    CKE --> SCH{"redirectUrl 是 custom scheme?<br/>(app://)"}
    SCH -->|"是"| AC["產生 auth_code → Redis<br/>redirect app scheme + ?code=..."]
    SCH -->|"否"| WEB["redirect FRONTEND_URL/auth/callback<br/>?state=...&isNewUser=true|false"]
```

### 後端關鍵元件

- `src/controllers/auth.controller.ts` — `googleCallback` 主控邏輯
- `src/services/auth/oauth.service.ts` — passport-google-oauth20 設定、`_isNewUser` 判斷
- `src/services/auth/oauth-nonce.service.ts` — nonce 存取（Redis）
- `src/services/auth/oauth-redis-state-store.service.ts` — state 暫存
- `src/services/auth/auth-code.service.ts` — 行動 app 用的一次性 auth code
- `src/utils/oauth-state.ts` — state 物件編解碼、驗證
- `src/utils/cookie-config.ts` — auth cookie 設定（SameSite=none、Secure、可選 domain）

### Cookie 設定

```
name:     auth_token
httpOnly: true
secure:   true
sameSite: none
path:     /
maxAge:   7 days
domain:   process.env.COOKIE_DOMAIN  (例如 .daodao.so)
```

`SameSite=none + Secure` 是跨子域 fetch 帶上 cookie 的必要條件。
若要前後端跨子域共享（`app.daodao.so` ↔ `api.daodao.so`），務必設 `COOKIE_DOMAIN=.daodao.so`。

---

## 相關程式位置

### 前端 (daodao-f2e)

- `apps/product/src/app/[locale]/auth/login/page.tsx`
- `apps/product/src/app/[locale]/auth/callback/page.tsx`
- `apps/product/src/app/[locale]/auth/onboarding/page.tsx`
- `apps/product/src/app/global-provider.tsx`（AuthProvider 路由保護設定）
- `apps/product/src/middleware.ts`（i18n only，無認證檢查）
- `packages/auth/src/hooks/use-auth.ts`
- `packages/auth/src/hooks/use-require-auth.ts`
- `packages/auth/src/hooks/use-redirect-after-login.ts`
- `packages/auth/src/lib/auth-provider.tsx`
- `packages/auth/src/lib/auth-client.ts`
- `packages/auth/src/components/login-dialog.tsx`
- `packages/auth/src/components/auth-button.tsx`
- `packages/auth/src/components/auth-guard.tsx`
- `packages/shared/src/lib/storage.ts`（OAuthNonce / AuthSignal / UserInfo 等 storage key）

### 後端 (daodao-server)

- `src/controllers/auth.controller.ts`
- `src/services/auth/oauth.service.ts`
- `src/services/auth/oauth-nonce.service.ts`
- `src/services/auth/oauth-redis-state-store.service.ts`
- `src/services/auth/auth-code.service.ts`
- `src/services/auth/auth.service.ts`
- `src/routes/auth.routes.ts`
- `src/middleware/auth.ts`
- `src/utils/oauth-state.ts`
- `src/utils/cookie-config.ts`
- `src/utils/redirect-validation.ts`
