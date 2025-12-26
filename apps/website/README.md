# @daodao/website

DaoDao 靜態官網應用程式。

## 開發

```bash
# 開發模式
pnpm dev

# 構建
pnpm build

# 啟動生產環境
pnpm start
```

## 結構

- `src/app/` - Next.js App Router 頁面
- `src/app/[locale]/` - 多語系路由
- `public/` - 靜態資源

## 依賴

- `@daodao/i18n` - 多語系支援
- `@daodao/ui` - UI 組件庫
- `@daodao/shared` - 共享工具
- `@daodao/features-quiz` - Quiz 功能模組

