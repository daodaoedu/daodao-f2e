# 建議目錄與模組化架構

原則：功能導向（feature-first）、I/O 與 UI 解耦、可測試性、可重用性。

建議結構（節錄）：

```
app/
  [language]/(public)/(default-layout)/
  [language]/(protected)/
components/
  ui/                 # shadcn 基礎元件
  shared/             # 跨領域展示元件
features/
  <domain>/
    components/
    hooks/
    utils/
    types.ts | schemas.ts
services/
  _shared/            # fetcher / 攔截器 / 公用錯誤處理
  <domain>/           # 以 generated 封裝出的呼叫層
generated/            # orval 產碼（勿改）
utils/                # 通用工具（cn, date, env...）
constants/            # 常數與設定
```

規範：
- `features/*` 僅輸出該領域公開 API（components、hooks）；內部細節保持封裝。
- `services/*` 為資料介面與副作用層，禁止 UI 邏輯。
- `generated/*` 僅為產物，請勿修改，必要時在 `services/*` 包一層。
- 公用 UI 放 `components/shared`，基礎 UI 放 `components/ui`。


## 命名與邏輯切分

- 檔名：以職責命名，避免縮寫；元件使用 PascalCase，hook/useXxx。
- hooks：只做資料/狀態取得與封裝；UI 邏輯放元件。
- utils：純函式、無副作用，覆用於多領域。

## 範例路徑

- `features/projects/hooks/useProjects.ts`：SWR 取數 + Zod 驗證。
- `features/projects/components/ProjectList.tsx`：展示與互動。
- `services/projects/index.ts`：呼叫 `generated` 並處理錯誤、mapping。

