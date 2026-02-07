# 前端獨立部署指南（使用外部網路）

## 架構說明

### 專案結構
```
/Users/xiaoxu/Projects/daodao/
├── daodao-server/
│   ├── docker-compose.yaml (後端獨立管理)
│   │   ├── nginx (已存在)
│   │   ├── prod_app
│   │   ├── dev_app
│   │   ├── mongo_prod/dev
│   │   └── redis_prod/dev
│   └── nginx.conf
│
└── daodao-f2e/
    ├── docker-compose.yaml (前端獨立管理 - 待建立)
    ├── Dockerfile (待建立)
    └── ... (Next.js 專案)
```

### 網路架構
```
┌─────────────────────────────────────────────────────┐
│              Linode VPS                             │
│                                                     │
│  後端網路 (prod-daodao-network)                     │
│  ┌───────────────────────────────────────────────┐ │
│  │                                               │ │
│  │  ┌────────┐    ┌─────────┐    ┌──────────┐  │ │
│  │  │ Nginx  │───▶│prod_app │───▶│ MongoDB  │  │ │
│  │  │(Port   │    │(Port    │    │  Redis   │  │ │
│  │  │80/443) │    │ 3000)   │    │          │  │ │
│  │  └────┬───┘    └─────────┘    └──────────┘  │ │
│  │       │                                       │ │
│  └───────┼───────────────────────────────────────┘ │
│          │ 透過外部網路連接                         │
│          │                                         │
│  前端網路 (frontend-network)                       │
│  ┌───────▼───────────────────────────────────────┐ │
│  │                                               │ │
│  │  ┌──────────────┐                            │ │
│  │  │prod_frontend │ (連接到 prod-daodao-network)│ │
│  │  │(Port 3000)   │                            │ │
│  │  └──────────────┘                            │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**關鍵點**：
- 前端容器加入**外部網路** `prod-daodao-network`
- Nginx (在後端網路中) 可以訪問前端容器
- 前端可以透過容器名稱訪問後端 API

---

## 部署步驟

### 步驟一：建立前端 Dockerfile

在 `/Users/xiaoxu/Projects/daodao/daodao-f2e/Dockerfile`：

```dockerfile
# ==================== 依賴安裝階段 ====================
FROM node:20.19.4-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 安裝 pnpm
RUN npm install -g pnpm@10.15.0

# 複製依賴相關檔案
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ==================== 建置階段 ====================
FROM node:20.19.4-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 安裝 pnpm
RUN npm install -g pnpm@10.15.0

# 從 deps 複製 node_modules
COPY --from=deps /app/node_modules ./node_modules

# 複製所有原始碼
COPY . .

# 設定環境變數 (建置時)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 建置 Next.js (standalone 模式)
RUN pnpm build

# ==================== 運行階段 ====================
FROM node:20.19.4-alpine AS runner

RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 建立 nextjs 使用者 (安全性考量)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 複製必要檔案
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 步驟二：建立前端 docker-compose.yaml

在 `/Users/xiaoxu/Projects/daodao/daodao-f2e/docker-compose.yaml`：

```yaml
version: '3.8'

services:
  # ==================== 生產環境前端 ====================
  prod_frontend:
    build:
      context: .
      dockerfile: Dockerfile
    image: daodao-frontend:prod
    container_name: prod_frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://prod_app:3000
      - NEXT_PUBLIC_ENVIRONMENT=production
      - PORT=3000
    networks:
      - prod-daodao-network  # 連接到後端的網路
      - frontend-network     # 前端自己的網路
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ==================== 開發環境前端（可選）====================
  dev_frontend:
    build:
      context: .
      dockerfile: Dockerfile
    image: daodao-frontend:dev
    container_name: dev_frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://dev_app:3000
      - NEXT_PUBLIC_ENVIRONMENT=development
      - PORT=3000
    networks:
      - dev-daodao-network   # 連接到後端的開發網路
      - frontend-network     # 前端自己的網路
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  # 連接到後端的外部網路（已存在）
  prod-daodao-network:
    external: true
    name: prod-daodao-network

  dev-daodao-network:
    external: true
    name: dev-daodao-network

  # 前端自己的內部網路
  frontend-network:
    driver: bridge
```

### 步驟三：建立 .dockerignore

在 `/Users/xiaoxu/Projects/daodao/daodao-f2e/.dockerignore`：

```
# 依賴
node_modules
.pnpm-store

# Next.js
.next
out
build
dist

# 測試
coverage
.nyc_output

# Git
.git
.github
.gitignore

# 環境變數
.env*.local
.env.production

# IDE
.vscode
.idea
*.swp
*.swo

# 日誌
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# 其他
.husky
.DS_Store
*.md
LICENSE
README.md
CLAUDE.md
```

### 步驟四：修改 next.config.js

啟用 standalone 模式：

```javascript
// next.config.js
const config = {
  // ... 其他配置保持不變

  // ✅ 新增：啟用 standalone 輸出模式
  output: 'standalone',

  // 移除 Cloudflare 特定設定（可選）
  // images: {
  //   unoptimized: true,
  // },
};

module.exports = withNextIntl(withPWA(withBundleAnalyzer(config)));
```

### 步驟五：修改後端的 nginx.conf

編輯 `/Users/xiaoxu/Projects/daodao/daodao-server/nginx.conf`，添加前端配置：

```nginx
http {
    # ... 現有配置保持不變 ...

    # ==================== 新增：前端 HTTPS 配置 ====================

    # HTTP -> HTTPS 重定向
    server {
        listen 80;
        server_name v2.daoedu.tw www.v2.daoedu.tw;

        # Let's Encrypt ACME challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS 主站配置
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name v2.daoedu.tw www.v2.daoedu.tw;

        # SSL 憑證
        ssl_certificate /etc/letsencrypt/live/v2.daoedu.tw/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/v2.daoedu.tw/privkey.pem;

        # SSL 安全設定
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # 安全標頭
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Next.js 靜態資源 - 長期快取
        location /_next/static {
            proxy_pass http://prod_frontend:3000;
            proxy_http_version 1.1;
            expires 365d;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        # 靜態資源
        location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
            proxy_pass http://prod_frontend:3000;
            proxy_http_version 1.1;
            expires 7d;
            add_header Cache-Control "public";
            access_log off;
        }

        # API 代理到後端
        location /api {
            proxy_pass http://prod_app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            proxy_connect_timeout 300s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }

        # Next.js 應用主體
        location / {
            proxy_pass http://prod_frontend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
    }

    # ... 現有的後端配置保持不變 ...
}
```

### 步驟六：修改後端 docker-compose.yaml

編輯 `/Users/xiaoxu/Projects/daodao/daodao-server/docker-compose.yaml`，更新 nginx 的 volumes：

```yaml
services:
  # ... 其他服務保持不變 ...

  nginx:
    image: nginx:latest
    container_name: nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro  # ✅ 新增：掛載 SSL 憑證
    environment:
      - APP_ENV=${APP_ENV}
    depends_on:
      - prod_app
      - dev_app
    networks:
      - prod-daodao-network
      - dev-daodao-network
```

---

## 部署流程

### 初次部署

#### 1. 確認後端網路已建立

```bash
# 檢查後端網路
docker network ls | grep daodao

# 如果沒有，先啟動後端服務
cd /Users/xiaoxu/Projects/daodao/daodao-server
docker-compose up -d
```

#### 2. 建置前端映像檔

```bash
cd /Users/xiaoxu/Projects/daodao/daodao-f2e

# 建置生產環境前端
docker-compose build prod_frontend

# 查看映像檔
docker images | grep daodao-frontend
```

#### 3. 啟動前端容器

```bash
# 啟動生產環境前端
docker-compose up -d prod_frontend

# 查看狀態
docker-compose ps

# 查看日誌
docker-compose logs -f prod_frontend
```

#### 4. 測試容器間連線

```bash
# 進入前端容器
docker exec -it prod_frontend sh

# 測試連到後端
wget -O- http://prod_app:3000/api/v1/health
# 應該能正常回應

# 離開容器
exit

# 從後端的 nginx 測試連到前端
docker exec -it nginx sh
wget -O- http://prod_frontend:3000
# 應該能正常回應

exit
```

#### 5. 配置 SSL 憑證

```bash
# 暫時停止後端的 nginx
cd /Users/xiaoxu/Projects/daodao/daodao-server
docker-compose stop nginx

# 使用 Certbot 取得憑證
sudo certbot certonly --standalone -d v2.daoedu.tw -d www.v2.daoedu.tw

# 重啟 nginx
docker-compose up -d nginx

# 測試自動更新
sudo certbot renew --dry-run
```

#### 6. 重啟後端 nginx 載入新配置

```bash
cd /Users/xiaoxu/Projects/daodao/daodao-server
docker-compose restart nginx

# 查看 nginx 日誌
docker-compose logs -f nginx
```

#### 7. 測試前端訪問

```bash
# 修改本地 hosts 檔案測試
# /etc/hosts (Linux/Mac) 或 C:\Windows\System32\drivers\etc\hosts (Windows)
your-linode-ip  v2.daoedu.tw

# 瀏覽器測試
# https://v2.daoedu.tw

# curl 測試
curl -I https://v2.daoedu.tw
curl https://v2.daoedu.tw/api/v1/health
```

---

## 部署腳本

### 前端自動部署腳本

在 `/Users/xiaoxu/Projects/daodao/daodao-f2e/deploy.sh`：

```bash
#!/bin/bash
set -e

echo "🚀 Deploying frontend..."

cd /Users/xiaoxu/Projects/daodao/daodao-f2e

# 1. 拉取最新程式碼
echo "📥 Pulling latest code..."
git fetch origin
git reset --hard origin/prod

# 2. 建置新映像檔
echo "🔨 Building Docker image..."
docker-compose build prod_frontend

# 3. 停止舊容器
echo "🛑 Stopping old container..."
docker-compose stop prod_frontend

# 4. 啟動新容器
echo "🚀 Starting new container..."
docker-compose up -d prod_frontend

# 5. 等待啟動
echo "⏳ Waiting for container to start..."
sleep 10

# 6. 檢查狀態
if docker ps | grep -q "prod_frontend"; then
    echo "✅ Frontend deployed successfully!"
    docker-compose ps prod_frontend
    docker-compose logs --tail=20 prod_frontend
else
    echo "❌ Frontend deployment failed!"
    docker-compose logs prod_frontend
    exit 1
fi

# 7. 清理舊映像檔
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment completed!"
```

```bash
chmod +x /Users/xiaoxu/Projects/daodao/daodao-f2e/deploy.sh
```

### 回滾腳本

在 `/Users/xiaoxu/Projects/daodao/daodao-f2e/rollback.sh`：

```bash
#!/bin/bash
set -e

echo "🔄 Rolling back frontend..."

cd /Users/xiaoxu/Projects/daodao/daodao-f2e

# 列出最近的 commits
echo "Recent commits:"
git log --oneline -10

# 輸入要回滾的 commit
read -p "Enter commit hash to rollback to: " COMMIT_HASH

if [ -z "$COMMIT_HASH" ]; then
    echo "❌ No commit hash provided"
    exit 1
fi

# 回滾程式碼
git reset --hard $COMMIT_HASH

# 重新建置並部署
docker-compose build prod_frontend
docker-compose up -d prod_frontend

echo "✅ Rollback completed to $COMMIT_HASH"
docker-compose ps prod_frontend
```

```bash
chmod +x /Users/xiaoxu/Projects/daodao/daodao-f2e/rollback.sh
```

---

## 管理命令

### 前端服務管理

```bash
cd /Users/xiaoxu/Projects/daodao/daodao-f2e

# 啟動
docker-compose up -d prod_frontend

# 停止
docker-compose stop prod_frontend

# 重啟
docker-compose restart prod_frontend

# 查看狀態
docker-compose ps

# 查看日誌
docker-compose logs -f prod_frontend

# 進入容器
docker exec -it prod_frontend sh

# 查看資源使用
docker stats prod_frontend
```

### 後端 Nginx 管理

```bash
cd /Users/xiaoxu/Projects/daodao/daodao-server

# 重啟 nginx
docker-compose restart nginx

# 測試配置
docker exec nginx nginx -t

# 查看日誌
docker-compose logs -f nginx

# 重新載入配置（無需重啟）
docker exec nginx nginx -s reload
```

### 網路管理

```bash
# 查看所有網路
docker network ls

# 檢查前端網路連接
docker network inspect prod-daodao-network

# 查看哪些容器連接到網路
docker network inspect prod-daodao-network | grep Name
```

---

## GitHub Actions CI/CD

在 `/Users/xiaoxu/Projects/daodao/daodao-f2e/.github/workflows/deploy-linode.yml`：

```yaml
name: Deploy Frontend to Linode

on:
  push:
    branches:
      - prod
  workflow_dispatch:

env:
  HUSKY: 0

jobs:
  continuous_integration:
    uses: ./.github/workflows/continuous-integration.yml
    secrets: inherit

  deploy:
    name: Deploy to Linode VPS
    runs-on: ubuntu-latest
    needs: continuous_integration
    if: needs.continuous_integration.result == 'success'

    steps:
      - name: Deploy Frontend via SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.LINODE_HOST }}
          username: ${{ secrets.LINODE_USER }}
          key: ${{ secrets.LINODE_SSH_KEY }}
          script: |
            cd /Users/xiaoxu/Projects/daodao/daodao-f2e
            ./deploy.sh

      - name: Health Check
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.LINODE_HOST }}
          username: ${{ secrets.LINODE_USER }}
          key: ${{ secrets.LINODE_SSH_KEY }}
          script: |
            # 等待服務啟動
            sleep 15

            # 檢查容器狀態
            docker ps | grep prod_frontend

            # 檢查服務健康
            docker exec prod_frontend wget --quiet --tries=1 --spider http://localhost:3000

      - name: Restart Nginx
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.LINODE_HOST }}
          username: ${{ secrets.LINODE_USER }}
          key: ${{ secrets.LINODE_SSH_KEY }}
          script: |
            cd /Users/xiaoxu/Projects/daodao/daodao-server
            docker-compose restart nginx

      - name: Send notification
        if: always()
        uses: ./.github/actions/notification
        with:
          TYPE: ${{ job.status }}
          TITLE: 前端部署 ${{ job.status }}
          DESCRIPTION: |
            Branch: ${{ github.ref_name }}
            Commit: ${{ github.sha }}
          DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
```

---

## 監控與維護

### 日常檢查

```bash
# 前端健康檢查
docker exec prod_frontend wget --quiet --tries=1 --spider http://localhost:3000

# 檢查容器狀態
docker ps | grep -E "prod_frontend|nginx"

# 查看資源使用
docker stats --no-stream prod_frontend nginx prod_app

# 查看日誌
docker-compose -f /Users/xiaoxu/Projects/daodao/daodao-f2e/docker-compose.yaml logs --tail=100 prod_frontend
docker-compose -f /Users/xiaoxu/Projects/daodao/daodao-server/docker-compose.yaml logs --tail=100 nginx
```

### 定期維護

```bash
# 清理未使用的映像檔
docker image prune -a

# 清理未使用的容器
docker container prune

# 檢查磁碟空間
docker system df

# 完整清理（謹慎使用）
docker system prune -a
```

---

## 疑難排解

### 問題 1：前端無法連接後端

```bash
# 檢查網路連接
docker network inspect prod-daodao-network

# 確認前端和後端都在同一網路
docker network inspect prod-daodao-network | grep -A 5 "Containers"

# 測試連線
docker exec -it prod_frontend ping prod_app
docker exec -it prod_frontend wget -O- http://prod_app:3000/api/v1/health
```

### 問題 2：Nginx 找不到前端容器

```bash
# 確認 nginx 和前端在同一網路
docker network inspect prod-daodao-network

# 從 nginx 測試連線
docker exec -it nginx ping prod_frontend
docker exec -it nginx wget -O- http://prod_frontend:3000

# 檢查 nginx 配置
docker exec -it nginx nginx -t

# 重新載入 nginx
docker exec -it nginx nginx -s reload
```

### 問題 3：外部網路不存在

```bash
# 檢查網路是否存在
docker network ls | grep prod-daodao-network

# 如果不存在，先啟動後端服務
cd /Users/xiaoxu/Projects/daodao/daodao-server
docker-compose up -d

# 再啟動前端服務
cd /Users/xiaoxu/Projects/daodao/daodao-f2e
docker-compose up -d prod_frontend
```

---

## 啟動順序

**重要**：由於前端依賴後端的網路，必須按順序啟動：

### 正確的啟動順序

```bash
# 1. 先啟動後端（建立網路）
cd /Users/xiaoxu/Projects/daodao/daodao-server
docker-compose up -d

# 2. 再啟動前端（連接到後端網路）
cd /Users/xiaoxu/Projects/daodao/daodao-f2e
docker-compose up -d prod_frontend

# 3. 檢查所有服務
docker ps | grep -E "nginx|prod_app|prod_frontend"
```

### 重啟所有服務

```bash
# 1. 停止前端
cd /Users/xiaoxu/Projects/daodao/daodao-f2e
docker-compose down

# 2. 停止後端
cd /Users/xiaoxu/Projects/daodao/daodao-server
docker-compose down

# 3. 啟動後端
docker-compose up -d

# 4. 啟動前端
cd /Users/xiaoxu/Projects/daodao/daodao-f2e
docker-compose up -d
```

---

## 優勢總結

### ✅ 獨立管理
- 前端和後端各自維護自己的 docker-compose.yaml
- 團隊可以獨立部署前端或後端
- 降低相互干擾的風險

### ✅ 共用網路
- 透過外部網路 `prod-daodao-network` 連接
- 容器間可以直接通訊
- Nginx 可以訪問前端容器

### ✅ 靈活部署
- 前端可以獨立更新而不影響後端
- 支援多環境（prod/dev）
- 易於擴展和維護

---

**文件版本**：v1.0
**建立日期**：2025-12-23
**適用場景**：前後端各自獨立管理 docker-compose.yaml
