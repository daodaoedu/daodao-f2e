# 生產階段 - 假設本地已經完成 build
# 使用方式：在本地執行 pnpm build 後，使用此 Dockerfile 打包
FROM node:20.19.4-alpine

# Build argument 指定要運行的 app
ARG APP_NAME=website
ARG APP_PORT=3000

# 啟用 corepack 並安裝 pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# 創建非 root 用戶
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# 複製必要的配置檔案（用於 pnpm workspace 解析）
COPY --chown=nextjs:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 複製所有 package.json（用於 pnpm workspace 解析）
COPY --chown=nextjs:nodejs apps/website/package.json ./apps/website/
COPY --chown=nextjs:nodejs apps/product/package.json ./apps/product/
COPY --chown=nextjs:nodejs packages/api/package.json ./packages/api/
COPY --chown=nextjs:nodejs packages/assets/package.json ./packages/assets/
COPY --chown=nextjs:nodejs packages/config/package.json ./packages/config/
COPY --chown=nextjs:nodejs packages/features/quiz/package.json ./packages/features/quiz/
COPY --chown=nextjs:nodejs packages/i18n/package.json ./packages/i18n/
COPY --chown=nextjs:nodejs packages/shared/package.json ./packages/shared/
COPY --chown=nextjs:nodejs packages/ui/package.json ./packages/ui/

# 安裝 production 依賴（使用 cache mount 快取 pnpm store）
# 注意：需要啟用 Docker BuildKit (DOCKER_BUILDKIT=1)
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts && \
    chown -R nextjs:nodejs /app/node_modules

# 複製 Next.js 建置產物和必要檔案
COPY --chown=nextjs:nodejs apps/${APP_NAME}/.next ./apps/${APP_NAME}/.next
COPY --chown=nextjs:nodejs apps/${APP_NAME}/public ./apps/${APP_NAME}/public

# 複製 packages 的建置產物和必要檔案
# 注意：由於 Next.js transpilePackages 配置，大部分 packages 的源碼已被編譯到 .next 中
# 但某些 packages 仍需要其建置產物（如 shared/dist, assets/generated）
COPY --chown=nextjs:nodejs packages/assets/generated ./packages/assets/generated
COPY --chown=nextjs:nodejs packages/assets/images ./packages/assets/images
COPY --chown=nextjs:nodejs packages/shared/dist ./packages/shared/dist

WORKDIR /app/apps/${APP_NAME}

# 切換到非 root 用戶
USER nextjs

# 暴露端口
EXPOSE ${APP_PORT}

ENV NODE_ENV=production
ENV PORT=${APP_PORT}

# 啟動應用
CMD ["pnpm", "start"]

