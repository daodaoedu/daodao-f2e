# @daodao/i18n

多語系套件，提供國際化功能和工具。

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

