# 開發環境 Dockerfile
# 使用方式：
#   1. 使用 docker-compose：docker-compose -f docker/development/docker-compose.yml up --build
#   2. 或單獨構建：docker build -f docker/development/Dockerfile -t daodao-dev .

FROM node:20.19.4-alpine

# 安裝 pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 pnpm 相關文件（利用 Docker 層級緩存）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# 複製所有 package.json 文件（包括嵌套目錄）
# 先複製目錄結構，然後只保留 package.json 文件
COPY apps/ ./apps/
COPY packages/ ./packages/

# 安裝依賴（只在依賴文件變更時重新執行）
# 注意：這裡會安裝所有依賴到根目錄的 node_modules（pnpm workspace 的行為）
RUN pnpm install --frozen-lockfile

# 暴露常用端口（根據實際需要調整）
EXPOSE 3000 3001

# 設置環境變數
ENV NODE_ENV=development

# 啟動開發服務器
CMD ["pnpm", "dev"]
