# 多階段建置 - 建置階段
FROM node:20.19.4-alpine AS builder

# 啟用 corepack 並安裝 pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

WORKDIR /app

# 複製依賴管理文件（優化 Docker layer cache）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/website/package.json ./apps/website/
COPY packages/api/package.json ./packages/api/
COPY packages/assets/package.json ./packages/assets/
COPY packages/config/package.json ./packages/config/
COPY packages/features/quiz/package.json ./packages/features/quiz/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/

# 安裝依賴（跳過 postinstall 腳本，因為源碼尚未複製）
RUN pnpm install --frozen-lockfile --ignore-scripts

# 複製所有源碼
COPY . .

# 執行 typegen
RUN cd apps/website && pnpm typegen

# 建置專案
RUN pnpm build

# 生產階段
FROM node:20.19.4-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

WORKDIR /app

# 只複製必要的文件
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=builder /app/apps/website ./apps/website
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/apps/website

# 暴露端口
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# 啟動應用
CMD ["pnpm", "start"]

