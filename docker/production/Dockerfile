# 生產環境 Dockerfile
# 使用方式：
#   1. 在本地執行 `pnpm build` 預先建置應用
#   2. 使用 docker-compose：docker-compose -f docker/production/docker-compose.yml up --build
#   3. 或單獨構建：docker build -f docker/production/Dockerfile --target website --build-arg APP_NAME=website --build-arg APP_PORT=3000 -t daodao-website .
#
# 注意：此 Dockerfile 需要預先執行 `pnpm build`，只複製建置後的輸出檔案

# Build argument 指定要運行的 app
ARG APP_NAME=website
ARG APP_PORT=3000

# 生產階段 - Website (靜態導出 + Nginx)
FROM node:20.19.4-alpine AS website

ARG APP_NAME=website
ARG APP_PORT=3000

WORKDIR /app

# 設置環境變數
ENV NODE_ENV=production
ENV PORT=${APP_PORT}

# 創建非 root 用戶
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 從本地複製預先建置的靜態導出文件
COPY --chown=nextjs:nodejs apps/${APP_NAME}/out ./apps/${APP_NAME}/out
COPY --chown=nextjs:nodejs apps/${APP_NAME}/public ./apps/${APP_NAME}/public

# 複製 packages 的靜態資源
COPY --chown=nextjs:nodejs packages/assets/generated ./packages/assets/generated
COPY --chown=nextjs:nodejs packages/assets/images ./packages/assets/images

# 安裝 Nginx
RUN apk add --no-cache nginx

# 複製 Nginx 配置檔
COPY docker/production/nginx.conf /etc/nginx/http.d/default.conf

# 創建 Nginx 運行時目錄並設置權限
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nextjs:nodejs /var/cache/nginx /var/log/nginx /var/run && \
    chmod -R 755 /var/cache/nginx /var/log/nginx /var/run

WORKDIR /app/apps/${APP_NAME}

# 暴露端口
EXPOSE ${APP_PORT}

# 啟動 Nginx（使用 daemon off 模式以在前台運行）
CMD ["nginx", "-g", "daemon off;"]

# 生產階段 - Product (Standalone + Node.js)
FROM node:20.19.4-alpine AS product

ARG APP_NAME=product
ARG APP_PORT=3001

WORKDIR /app

# 設置環境變數
ENV NODE_ENV=production
ENV PORT=${APP_PORT}

# 創建非 root 用戶
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 安裝 sharp 所需的系統依賴（根據 Next.js 官方建議）
# 安裝 wget 用於健康檢查
RUN apk add --no-cache libc6-compat wget

# 從本地複製預先建置的 standalone 輸出
COPY --chown=nextjs:nodejs apps/${APP_NAME}/.next/standalone ./
COPY --chown=nextjs:nodejs apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static
COPY --chown=nextjs:nodejs apps/${APP_NAME}/public ./apps/${APP_NAME}/public

# 複製 packages 的靜態資源
COPY --chown=nextjs:nodejs packages/assets/generated ./packages/assets/generated
COPY --chown=nextjs:nodejs packages/assets/images ./packages/assets/images

# 切換到非 root 用戶
USER nextjs

# 暴露端口
EXPOSE ${APP_PORT}

# 設置工作目錄並啟動應用
WORKDIR /app/apps/${APP_NAME}
CMD ["node", "server.js"]
