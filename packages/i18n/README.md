# @daodao/i18n

多語系套件，提供國際化功能和工具。

## 翻譯檔案結構

翻譯檔案依 namespace 拆分，每個 namespace 一個 JSON 檔：

```
src/locales/
├── zh-TW/
│   ├── index.ts        # 彙整所有 namespace，export default merged object
│   ├── common.json
│   ├── practice.json
│   └── ...
└── en/
    ├── index.ts
    ├── common.json
    └── ...
```

### 新增 namespace 步驟

1. 在 `src/locales/zh-TW/` 和 `src/locales/en/` 各新增 `{namespace}.json`（兩語系 key 必須一致）
2. 在兩個 `index.ts` 各加上 import 與 export 項目（依字母排序）

型別會自動從 `locales/en` 推導（見 `i18n.d.ts`），`useTranslations` 的 key 補全與檢查即時生效。

### 載入 messages

App 的 `src/i18n/request.ts` 使用 `loadMessages(locale)` 載入：

```ts
import { loadMessages } from "@daodao/i18n";

return {
  locale,
  messages: await loadMessages(locale),
};
```

## 使用方式

### 時間格式化（多語系）

**Hook 版本（推薦）**：

```tsx
import { useTimeDuration } from "@daodao/i18n/hooks/use-time-duration";

const TimeAgo = ({ date }: { date: Date }) => {
  const formatted = useTimeDuration(date);
  return <span>{formatted}</span>;
};
```

**函數版本**：

```tsx
import { formatTimeDuration } from "@daodao/i18n/lib/time-duration";
import { useTranslations } from "next-intl";

const Component = () => {
  const t = useTranslations("common");
  const formatted = formatTimeDuration(new Date("2024-01-01"), t);
  return <span>{formatted}</span>;
};
```

## 依賴關係

- 依賴 `@daodao/shared` 提供純函數（如 `calculateTimeDifference`）
- 不依賴其他業務 packages
- 可以被 `apps` 和 `packages/features/*` 使用

