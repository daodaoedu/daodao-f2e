# 島島域名架構規劃文件

**文件版本**：v1.0
**最後更新**：2025-12-23
**選用方案**：方案 1 - 子域名分離架構

---

## 📋 目錄

1. [域名架構總覽](#域名架構總覽)
2. [完整域名清單](#完整域名清單)
3. [DNS 配置](#dns-配置)
4. [SSL 憑證管理](#ssl-憑證管理)
5. [Nginx 配置](#nginx-配置)
6. [Traefik 配置](#traefik-配置)
7. [CORS 跨域配置](#cors-跨域配置)
8. [環境變數配置](#環境變數配置)
9. [部署腳本](#部署腳本)
10. [監控與維護](#監控與維護)

---

## 域名架構總覽

### 架構圖

```
島島 (daodao.so) 域名架構
│
├── 前端服務
│   ├── daodao.so ........................... 主站（正式環境）
│   ├── www.daodao.so ....................... 自動重定向到 daodao.so
│   ├── dev.daodao.so ....................... 測試環境
│   └── feat-*.daodao.so .................... 功能分支（動態）
│
├── 後端 API
│   ├── api.daodao.so ....................... API（正式環境）
│   ├── api-dev.daodao.so ................... API（測試環境）
│   └── api-feat-*.daodao.so ................ API（功能分支）
│
├── 內容服務
│   ├── blog.daodao.so ...................... 部落格
│   ├── docs.daodao.so ...................... 技術文件
│   └── learn.daodao.so ..................... 學習平台/資源
│
├── 管理服務
│   ├── admin.daodao.so ..................... 後台管理系統
│   ├── console.daodao.so ................... 開發者控制台
│   └── dashboard.daodao.so ................. 數據儀表板
│
├── 基礎設施
│   ├── cdn.daodao.so ....................... 靜態資源 CDN
│   ├── assets.daodao.so .................... 用戶上傳資源
│   └── media.daodao.so ..................... 媒體資源
│
└── 監控與工具
    ├── status.daodao.so .................... 系統狀態頁
    ├── monitor.daodao.so ................... 監控面板
    └── traefik.daodao.so ................... Traefik 儀表板
```

---

## 完整域名清單

### 1. 前端服務

| 域名 | 用途 | 環境 | 技術棧 | 對應後端 |
|------|------|------|--------|----------|
| `daodao.so` | 主站 | 正式 | Next.js | `api.daodao.so` |
| `www.daodao.so` | 主站（重定向） | 正式 | - | - |
| `dev.daodao.so` | 測試環境 | 測試 | Next.js | `api-dev.daodao.so` |
| `feat-*.daodao.so` | 功能分支 | 開發 | Next.js | `api-feat-*.daodao.so` |

**範例功能分支**：
- `feat-update.daodao.so` → 功能分支：update
- `feat-payment.daodao.so` → 功能分支：payment
- `feat-ui-redesign.daodao.so` → 功能分支：ui-redesign

---

### 2. 後端 API

| 域名 | 用途 | 環境 | 技術棧 | 對應前端 |
|------|------|------|--------|----------|
| `api.daodao.so` | RESTful API | 正式 | Node.js/NestJS | `daodao.so` |
| `api-dev.daodao.so` | API 測試環境 | 測試 | Node.js/NestJS | `dev.daodao.so` |
| `api-feat-*.daodao.so` | API 功能分支 | 開發 | Node.js/NestJS | `feat-*.daodao.so` |

**API 路徑規劃**：
```
https://api.daodao.so/
├── /v1/                    # API v1（目前版本）
│   ├── /users              # 用戶相關
│   ├── /resources          # 資源相關
│   ├── /partners           # 合作夥伴
│   └── /auth               # 認證授權
├── /v2/                    # API v2（未來版本，可選）
└── /health                 # 健康檢查端點
```

---

### 3. 內容服務

| 域名 | 用途 | 技術方案 | 備註 |
|------|------|----------|------|
| `blog.daodao.so` | 部落格 | Ghost / WordPress / Next.js SSG | 教育內容、使用案例 |
| `docs.daodao.so` | 技術文件 | Docusaurus / GitBook / VitePress | API 文件、開發指南 |
| `learn.daodao.so` | 學習平台 | 自建 / Moodle | 線上課程、教學資源 |

**推薦方案**：
- **部落格**：Next.js + MDX（與主站技術棧一致）
- **文件**：VitePress（輕量、快速、支援 Markdown）
- **學習平台**：根據實際需求決定

---

### 4. 管理服務

| 域名 | 用途 | 訪問權限 | 技術棧 |
|------|------|----------|--------|
| `admin.daodao.so` | 後台管理系統 | 管理員 | React Admin / 自建 |
| `console.daodao.so` | 開發者控制台 | 開發者 | Next.js |
| `dashboard.daodao.so` | 數據儀表板 | 管理員 | Grafana / Metabase |

**安全措施**：
- ✅ IP 白名單限制
- ✅ 雙因素認證（2FA）
- ✅ 基本認證（Basic Auth）作為第一層防護
- ✅ VPN 訪問（可選）

---

### 5. 靜態資源與媒體

| 域名 | 用途 | 快取策略 | 備註 |
|------|------|----------|------|
| `cdn.daodao.so` | 靜態資源 | 長期快取 | JS、CSS、字體等 |
| `assets.daodao.so` | 用戶上傳 | 中期快取 | 頭像、文件等 |
| `media.daodao.so` | 媒體資源 | 長期快取 | 圖片、影片等 |

**整合建議**：
- 使用 Cloudflare CDN 加速
- 可考慮整合 S3 / R2 / Backblaze B2
- 配置圖片優化（WebP、AVIF）

---

### 6. 監控與工具

| 域名 | 用途 | 技術方案 | 訪問權限 |
|------|------|----------|----------|
| `status.daodao.so` | 系統狀態頁 | Statuspage / Upptime | 公開 |
| `monitor.daodao.so` | 監控面板 | Grafana / Prometheus | 內部 |
| `traefik.daodao.so` | Traefik 儀表板 | Traefik Dashboard | 內部 |

---

## DNS 配置

### Cloudflare DNS 設定

```dns
; ==================== 主要服務 ====================

; 前端主站（正式環境）
daodao.so.                  A       139.162.XX.XX
www.daodao.so.              CNAME   daodao.so.

; 前端測試環境
dev.daodao.so.              A       139.162.XX.XX

; 後端 API（正式環境）
api.daodao.so.              A       139.162.XX.XX

; 後端 API（測試環境）
api-dev.daodao.so.          A       139.162.XX.XX

; ==================== 功能分支（泛域名）====================

; 前端功能分支
feat-*.daodao.so.           A       139.162.XX.XX

; 後端功能分支（兩種方式）
; 方式 1：使用泛域名（推薦）
api-feat-*.daodao.so.       A       139.162.XX.XX

; 方式 2：手動配置每個分支
; api-feat-update.daodao.so.  A    139.162.XX.XX
; api-feat-payment.daodao.so. A    139.162.XX.XX

; ==================== 內容服務 ====================

blog.daodao.so.             A       139.162.XX.XX
docs.daodao.so.             A       139.162.XX.XX
learn.daodao.so.            A       139.162.XX.XX

; ==================== 管理服務 ====================

admin.daodao.so.            A       139.162.XX.XX
console.daodao.so.          A       139.162.XX.XX
dashboard.daodao.so.        A       139.162.XX.XX

; ==================== 靜態資源 ====================

cdn.daodao.so.              CNAME   daodao.so.
assets.daodao.so.           A       139.162.XX.XX
media.daodao.so.            A       139.162.XX.XX

; ==================== 監控工具 ====================

status.daodao.so.           A       139.162.XX.XX
monitor.daodao.so.          A       139.162.XX.XX
traefik.daodao.so.          A       139.162.XX.XX
```

### Cloudflare 設定建議

```yaml
# SSL/TLS 設定
SSL/TLS 加密模式: 完全 (Full) 或 完全(嚴格) (Full Strict)

# 頁面規則
規則 1: www.daodao.so/*
  → 轉發 URL (301 - 永久重定向)
  → https://daodao.so/$1

規則 2: *.daodao.so/*
  → SSL: 完全

規則 3: api*.daodao.so/*
  → 快取等級: 略過
  → 停用效能功能（保持 API 原始響應）

規則 4: cdn.daodao.so/*
  → 快取等級: 全部快取
  → 邊緣快取 TTL: 1 個月
  → 瀏覽器快取 TTL: 1 年

# 防火牆規則
規則 1: admin.daodao.so
  → 允許的國家: 台灣、美國
  → 威脅分數 > 10 → 質詢

規則 2: api*.daodao.so
  → 速率限制: 100 請求/分鐘（視需求調整）
```

---

## SSL 憑證管理

### 方案：使用泛域名憑證

#### Let's Encrypt 申請（推薦）

```bash
# 安裝 Certbot（如果還沒安裝）
sudo apt update
sudo apt install certbot python3-certbot-dns-cloudflare

# 配置 Cloudflare API Token
cat > ~/.secrets/cloudflare.ini << EOF
dns_cloudflare_api_token = your_cloudflare_api_token_here
EOF

chmod 600 ~/.secrets/cloudflare.ini

# 申請泛域名憑證
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  -d daodao.so \
  -d *.daodao.so \
  --email admin@daodao.so \
  --agree-tos \
  --non-interactive

# 自動更新（Certbot 會自動設定 cron job）
# 測試自動更新
sudo certbot renew --dry-run
```

#### 憑證位置

```
/etc/letsencrypt/live/daodao.so/
├── fullchain.pem      # 完整憑證鏈
├── privkey.pem        # 私鑰
├── cert.pem           # 憑證
└── chain.pem          # 中間憑證
```

#### 憑證涵蓋範圍

一張泛域名憑證 `*.daodao.so` 涵蓋：
- ✅ `api.daodao.so`
- ✅ `dev.daodao.so`
- ✅ `blog.daodao.so`
- ✅ `admin.daodao.so`
- ✅ `feat-update.daodao.so`
- ✅ 所有其他一級子域名

但**不涵蓋**：
- ❌ `api-feat-update.daodao.so` （二級子域名，需要另外處理）
- ✅ 解決方案：Traefik 自動申請獨立憑證

---

## Nginx 配置

### 正式環境配置

```nginx
# /etc/nginx/sites-available/daodao-prod.conf

# ==================== 前端主站 ====================

# HTTP → HTTPS 重定向
server {
    listen 80;
    server_name daodao.so www.daodao.so;
    return 301 https://daodao.so$request_uri;
}

# www → 非 www 重定向
server {
    listen 443 ssl http2;
    server_name www.daodao.so;

    ssl_certificate /etc/letsencrypt/live/daodao.so/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/daodao.so/privkey.pem;

    return 301 https://daodao.so$request_uri;
}

# 主站
server {
    listen 443 ssl http2;
    server_name daodao.so;

    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/daodao.so/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/daodao.so/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 安全標頭
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 代理到前端容器
    location / {
        proxy_pass http://daodao-frontend-prod:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 靜態資源快取
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://daodao-frontend-prod:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# ==================== 後端 API ====================

server {
    listen 80;
    server_name api.daodao.so;
    return 301 https://api.daodao.so$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.daodao.so;

    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/daodao.so/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/daodao.so/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 安全標頭
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;

    # CORS 配置
    add_header 'Access-Control-Allow-Origin' 'https://daodao.so' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Requested-With' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Max-Age' '86400' always;

    # 處理 OPTIONS 預檢請求
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://daodao.so' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Requested-With' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Content-Length' '0';
        add_header 'Content-Type' 'text/plain';
        return 204;
    }

    location / {
        proxy_pass http://daodao-backend-prod:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超時設定
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康檢查端點（不需要 CORS）
    location /health {
        proxy_pass http://daodao-backend-prod:3000/health;
        access_log off;
    }
}

# ==================== 測試環境 ====================

# 前端測試環境
server {
    listen 443 ssl http2;
    server_name dev.daodao.so;

    ssl_certificate /etc/letsencrypt/live/daodao.so/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/daodao.so/privkey.pem;

    location / {
        proxy_pass http://daodao-frontend-dev:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 後端測試環境
server {
    listen 443 ssl http2;
    server_name api-dev.daodao.so;

    ssl_certificate /etc/letsencrypt/live/daodao.so/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/daodao.so/privkey.pem;

    # CORS（允許測試環境）
    add_header 'Access-Control-Allow-Origin' 'https://dev.daodao.so' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;

    if ($request_method = 'OPTIONS') {
        return 204;
    }

    location / {
        proxy_pass http://daodao-backend-dev:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# ==================== 管理服務 ====================

# 後台管理系統
server {
    listen 443 ssl http2;
    server_name admin.daodao.so;

    ssl_certificate /etc/letsencrypt/live/daodao.so/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/daodao.so/privkey.pem;

    # 基本認證（第一層防護）
    auth_basic "Admin Area";
    auth_basic_user_file /etc/nginx/.htpasswd;

    # IP 白名單（可選）
    # allow 1.2.3.4;
    # deny all;

    location / {
        proxy_pass http://daodao-admin:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# ==================== 內容服務 ====================

# 部落格
server {
    listen 443 ssl http2;
    server_name blog.daodao.so;

    ssl_certificate /etc/letsencrypt/live/daodao.so/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/daodao.so/privkey.pem;

    location / {
        proxy_pass http://daodao-blog:3000;
        proxy_set_header Host $host;
    }
}

# 技術文件
server {
    listen 443 ssl http2;
    server_name docs.daodao.so;

    ssl_certificate /etc/letsencrypt/live/daodao.so/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/daodao.so/privkey.pem;

    location / {
        proxy_pass http://daodao-docs:80;
        proxy_set_header Host $host;
    }
}

# ==================== 監控工具 ====================

# 系統狀態頁
server {
    listen 443 ssl http2;
    server_name status.daodao.so;

    ssl_certificate /etc/letsencrypt/live/daodao.so/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/daodao.so/privkey.pem;

    location / {
        proxy_pass http://daodao-status:3000;
        proxy_set_header Host $host;
    }
}
```

### 啟用配置

```bash
# 測試配置
sudo nginx -t

# 啟用配置
sudo ln -s /etc/nginx/sites-available/daodao-prod.conf /etc/nginx/sites-enabled/

# 重新載入
sudo systemctl reload nginx

# 查看狀態
sudo systemctl status nginx
```

---

## Traefik 配置

### 功能分支動態路由

#### traefik.yaml（靜態配置）

```yaml
# ~/traefik/traefik.yaml

# 入口點
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
          permanent: true

  websecure:
    address: ":443"

# Providers
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: traefik-network
    watch: true

# Let's Encrypt（自動 SSL）
certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@daodao.so
      storage: /acme.json
      httpChallenge:
        entryPoint: web
      # 或使用 DNS Challenge（推薦，支援泛域名）
      # dnsChallenge:
      #   provider: cloudflare
      #   resolvers:
      #     - "1.1.1.1:53"
      #     - "1.0.0.1:53"

# API 和儀表板
api:
  dashboard: true
  insecure: false

# 日誌
log:
  level: INFO
  filePath: /var/log/traefik/traefik.log

accessLog:
  filePath: /var/log/traefik/access.log
```

#### docker-compose.yaml（Traefik 主服務）

```yaml
# ~/traefik/docker-compose.yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    ports:
      - "80:80"
      - "443:443"
    environment:
      # Cloudflare DNS Challenge（可選）
      - CF_API_EMAIL=${CF_API_EMAIL}
      - CF_API_KEY=${CF_API_KEY}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yaml:/traefik.yaml:ro
      - ./acme.json:/acme.json
      - ./logs:/var/log/traefik
    networks:
      - traefik-network
    labels:
      # 啟用 Traefik
      - "traefik.enable=true"

      # 儀表板路由
      - "traefik.http.routers.dashboard.rule=Host(`traefik.daodao.so`)"
      - "traefik.http.routers.dashboard.service=api@internal"
      - "traefik.http.routers.dashboard.entrypoints=websecure"
      - "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"

      # 基本認證
      - "traefik.http.routers.dashboard.middlewares=dashboard-auth"
      - "traefik.http.middlewares.dashboard-auth.basicauth.users=admin:$$apr1$$8evjzRBW$$Xn7j5EQx6wQXiSHQ3K8lT/"
      # 生成密碼：echo $(htpasswd -nb admin your_password) | sed -e s/\\$/\\$\\$/g

networks:
  traefik-network:
    external: true
```

#### 前端功能分支配置

```yaml
# ~/daodao-f2e/docker-compose.yaml
version: '3.8'

services:
  frontend-feat-${FEATURE_BRANCH}:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=https://api-feat-${FEATURE_BRANCH}.daodao.so
    container_name: daodao-frontend-feat-${FEATURE_BRANCH}
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api-feat-${FEATURE_BRANCH}.daodao.so
    networks:
      - traefik-network
    labels:
      # 啟用 Traefik
      - "traefik.enable=true"

      # 路由規則
      - "traefik.http.routers.frontend-feat-${FEATURE_BRANCH}.rule=Host(`feat-${FEATURE_BRANCH}.daodao.so`)"
      - "traefik.http.routers.frontend-feat-${FEATURE_BRANCH}.entrypoints=websecure"
      - "traefik.http.routers.frontend-feat-${FEATURE_BRANCH}.tls.certresolver=letsencrypt"

      # 服務定義
      - "traefik.http.services.frontend-feat-${FEATURE_BRANCH}.loadbalancer.server.port=3000"

      # 中間件：壓縮
      - "traefik.http.routers.frontend-feat-${FEATURE_BRANCH}.middlewares=compress"
      - "traefik.http.middlewares.compress.compress=true"

networks:
  traefik-network:
    external: true
```

#### 後端功能分支配置

```yaml
# ~/daodao-server/docker-compose.feature.yaml
version: '3.8'

services:
  backend-feat-${FEATURE_BRANCH}:
    build: .
    container_name: daodao-backend-feat-${FEATURE_BRANCH}
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - ALLOWED_ORIGINS=https://feat-${FEATURE_BRANCH}.daodao.so
    networks:
      - traefik-network
    labels:
      - "traefik.enable=true"

      # 路由規則
      - "traefik.http.routers.backend-feat-${FEATURE_BRANCH}.rule=Host(`api-feat-${FEATURE_BRANCH}.daodao.so`)"
      - "traefik.http.routers.backend-feat-${FEATURE_BRANCH}.entrypoints=websecure"
      - "traefik.http.routers.backend-feat-${FEATURE_BRANCH}.tls.certresolver=letsencrypt"

      # 服務定義
      - "traefik.http.services.backend-feat-${FEATURE_BRANCH}.loadbalancer.server.port=3000"

      # CORS 中間件
      - "traefik.http.routers.backend-feat-${FEATURE_BRANCH}.middlewares=cors-feat-${FEATURE_BRANCH}"
      - "traefik.http.middlewares.cors-feat-${FEATURE_BRANCH}.headers.accessControlAllowOriginList=https://feat-${FEATURE_BRANCH}.daodao.so"
      - "traefik.http.middlewares.cors-feat-${FEATURE_BRANCH}.headers.accessControlAllowCredentials=true"
      - "traefik.http.middlewares.cors-feat-${FEATURE_BRANCH}.headers.accessControlAllowMethods=GET,POST,PUT,DELETE,PATCH,OPTIONS"
      - "traefik.http.middlewares.cors-feat-${FEATURE_BRANCH}.headers.accessControlAllowHeaders=Authorization,Content-Type,X-Requested-With"
      - "traefik.http.middlewares.cors-feat-${FEATURE_BRANCH}.headers.accessControlMaxAge=86400"

networks:
  traefik-network:
    external: true
```

---

## CORS 跨域配置

### 後端 Express/NestJS 配置

#### Express.js

```javascript
// backend/src/middleware/cors.middleware.js
const cors = require('cors');

// 允許的來源清單
const allowedOrigins = {
  production: [
    'https://daodao.so',
    'https://www.daodao.so',
  ],
  development: [
    'https://dev.daodao.so',
  ],
  admin: [
    'https://admin.daodao.so',
    'https://console.daodao.so',
  ],
};

// 動態 CORS 配置
const corsOptions = {
  origin: function (origin, callback) {
    // 收集所有允許的來源
    const allAllowedOrigins = [
      ...allowedOrigins.production,
      ...allowedOrigins.development,
      ...allowedOrigins.admin,
    ];

    // 允許功能分支域名 (feat-*.daodao.so)
    if (origin && /^https:\/\/feat-[\w-]+\.daodao\.so$/.test(origin)) {
      callback(null, true);
      return;
    }

    // 允許列表中的域名
    if (!origin || allAllowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true, // 允許攜帶 Cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 預檢請求快取時間（24小時）
};

// 本地開發環境
if (process.env.NODE_ENV === 'development') {
  corsOptions.origin = function (origin, callback) {
    callback(null, true); // 開發環境允許所有來源
  };
}

module.exports = cors(corsOptions);
```

```javascript
// backend/src/app.js
const express = require('express');
const corsMiddleware = require('./middleware/cors.middleware');

const app = express();

// 使用 CORS 中間件（放在所有路由之前）
app.use(corsMiddleware);

// 你的路由...
app.use('/api/v1', require('./routes'));

module.exports = app;
```

#### NestJS

```typescript
// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 配置
  app.enableCors({
    origin: (origin, callback) => {
      // 允許的來源
      const allowedOrigins = [
        'https://daodao.so',
        'https://www.daodao.so',
        'https://dev.daodao.so',
        'https://admin.daodao.so',
      ];

      // 允許功能分支
      const featureBranchPattern = /^https:\/\/feat-[\w-]+\.daodao\.so$/;

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        featureBranchPattern.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400,
  });

  await app.listen(3000);
}

bootstrap();
```

### 前端配置

#### Next.js API 調用

```typescript
// frontend/lib/api.ts

// 根據環境獲取 API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.daodao.so';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    credentials: 'include', // 攜帶 Cookie
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// 使用範例
// const users = await fetchAPI<User[]>('/api/v1/users');
```

---

## 環境變數配置

### 前端環境變數

```bash
# .env.production（正式環境）
NEXT_PUBLIC_API_URL=https://api.daodao.so
NEXT_PUBLIC_SITE_URL=https://daodao.so
NEXT_PUBLIC_ENV=production

# .env.development（測試環境）
NEXT_PUBLIC_API_URL=https://api-dev.daodao.so
NEXT_PUBLIC_SITE_URL=https://dev.daodao.so
NEXT_PUBLIC_ENV=development

# .env.feat-update（功能分支範例）
NEXT_PUBLIC_API_URL=https://api-feat-update.daodao.so
NEXT_PUBLIC_SITE_URL=https://feat-update.daodao.so
NEXT_PUBLIC_ENV=feature
NEXT_PUBLIC_FEATURE_BRANCH=update
```

### 後端環境變數

```bash
# .env.production
NODE_ENV=production
PORT=3000

# 允許的來源
ALLOWED_ORIGINS=https://daodao.so,https://www.daodao.so,https://admin.daodao.so

# 資料庫
DATABASE_URL=mongodb://mongo-prod:27017/daodao
REDIS_URL=redis://redis-prod:6379

# JWT
JWT_SECRET=your_production_secret_here
JWT_EXPIRES_IN=7d

# .env.development
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=https://dev.daodao.so
DATABASE_URL=mongodb://mongo-dev:27017/daodao-dev
REDIS_URL=redis://redis-dev:6379

# .env.feat-update
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://feat-update.daodao.so
DATABASE_URL=mongodb://mongo-dev:27017/daodao-feat-update
REDIS_URL=redis://redis-dev:6379
FEATURE_BRANCH=update
```

---

## 部署腳本

### 功能分支部署腳本

```bash
#!/bin/bash
# deploy-feature.sh - 部署功能分支

set -e

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查參數
if [ -z "$1" ]; then
  echo -e "${RED}錯誤：請提供分支名稱${NC}"
  echo "使用方式: ./deploy-feature.sh <branch-name>"
  echo "範例: ./deploy-feature.sh update"
  exit 1
fi

BRANCH=$1
FRONTEND_DOMAIN="feat-${BRANCH}.daodao.so"
BACKEND_DOMAIN="api-feat-${BRANCH}.daodao.so"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署功能分支: ${BRANCH}${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📱 前端: ${YELLOW}https://${FRONTEND_DOMAIN}${NC}"
echo -e "🔌 後端: ${YELLOW}https://${BACKEND_DOMAIN}${NC}"
echo ""

# 導出環境變數
export FEATURE_BRANCH=$BRANCH
export FRONTEND_DOMAIN=$FRONTEND_DOMAIN
export BACKEND_DOMAIN=$BACKEND_DOMAIN
export NEXT_PUBLIC_API_URL="https://${BACKEND_DOMAIN}"

# 部署前端
echo -e "${GREEN}[1/3] 部署前端...${NC}"
cd ~/daodao-f2e
docker-compose -f docker-compose.feature.yaml up -d --build
echo -e "${GREEN}✓ 前端部署完成${NC}"
echo ""

# 部署後端
echo -e "${GREEN}[2/3] 部署後端...${NC}"
cd ~/daodao-server
docker-compose -f docker-compose.feature.yaml up -d --build
echo -e "${GREEN}✓ 後端部署完成${NC}"
echo ""

# 檢查狀態
echo -e "${GREEN}[3/3] 檢查服務狀態...${NC}"
echo ""
echo "前端容器："
docker ps --filter "name=daodao-frontend-feat-${BRANCH}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "後端容器："
docker ps --filter "name=daodao-backend-feat-${BRANCH}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 等待服務啟動
echo -e "${YELLOW}等待服務啟動...${NC}"
sleep 10

# 健康檢查
echo -e "${GREEN}執行健康檢查...${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${FRONTEND_DOMAIN} || echo "000")
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${BACKEND_DOMAIN}/health || echo "000")

echo "前端狀態: $FRONTEND_STATUS"
echo "後端狀態: $BACKEND_STATUS"
echo ""

if [ "$FRONTEND_STATUS" = "200" ] && [ "$BACKEND_STATUS" = "200" ]; then
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}✅ 部署成功！${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo -e "訪問連結："
  echo -e "  前端: ${YELLOW}https://${FRONTEND_DOMAIN}${NC}"
  echo -e "  後端: ${YELLOW}https://${BACKEND_DOMAIN}${NC}"
else
  echo -e "${RED}========================================${NC}"
  echo -e "${RED}⚠️  服務可能未完全啟動${NC}"
  echo -e "${RED}========================================${NC}"
  echo ""
  echo "請稍後再試，或查看日誌："
  echo "  docker logs daodao-frontend-feat-${BRANCH}"
  echo "  docker logs daodao-backend-feat-${BRANCH}"
fi
```

### 銷毀功能分支腳本

```bash
#!/bin/bash
# destroy-feature.sh - 銷毀功能分支

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
  echo -e "${RED}錯誤：請提供分支名稱${NC}"
  echo "使用方式: ./destroy-feature.sh <branch-name>"
  exit 1
fi

BRANCH=$1

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}警告：即將銷毀功能分支${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "分支: ${RED}${BRANCH}${NC}"
echo -e "前端: ${RED}feat-${BRANCH}.daodao.so${NC}"
echo -e "後端: ${RED}api-feat-${BRANCH}.daodao.so${NC}"
echo ""
read -p "確認要銷毀嗎？ (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "已取消"
  exit 0
fi

export FEATURE_BRANCH=$BRANCH

# 停止並刪除前端
echo -e "${YELLOW}銷毀前端容器...${NC}"
cd ~/daodao-f2e
docker-compose -f docker-compose.feature.yaml down -v

# 停止並刪除後端
echo -e "${YELLOW}銷毀後端容器...${NC}"
cd ~/daodao-server
docker-compose -f docker-compose.feature.yaml down -v

# 刪除未使用的映像
echo -e "${YELLOW}清理未使用的映像...${NC}"
docker image prune -f

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ 功能分支已銷毀${NC}"
echo -e "${GREEN}========================================${NC}"
```

### 權限設定

```bash
chmod +x deploy-feature.sh
chmod +x destroy-feature.sh
```

---

## 監控與維護

### 健康檢查端點

#### 後端健康檢查

```javascript
// backend/src/routes/health.js
const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // 檢查資料庫連接
    const dbConnected = await checkDatabase();

    // 檢查 Redis 連接
    const redisConnected = await checkRedis();

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      services: {
        database: dbConnected ? 'connected' : 'disconnected',
        redis: redisConnected ? 'connected' : 'disconnected',
      },
    };

    const statusCode = dbConnected && redisConnected ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message,
    });
  }
});

async function checkDatabase() {
  // 實作資料庫檢查邏輯
  return true;
}

async function checkRedis() {
  // 實作 Redis 檢查邏輯
  return true;
}

module.exports = router;
```

### 監控腳本

```bash
#!/bin/bash
# monitor-services.sh - 監控所有服務

echo "======================================"
echo "島島服務監控"
echo "======================================"
echo ""

# 正式環境
echo "【正式環境】"
echo "前端: $(curl -s -o /dev/null -w "%{http_code}" https://daodao.so)"
echo "後端: $(curl -s -o /dev/null -w "%{http_code}" https://api.daodao.so/health)"
echo ""

# 測試環境
echo "【測試環境】"
echo "前端: $(curl -s -o /dev/null -w "%{http_code}" https://dev.daodao.so)"
echo "後端: $(curl -s -o /dev/null -w "%{http_code}" https://api-dev.daodao.so/health)"
echo ""

# 功能分支
echo "【功能分支】"
docker ps --filter "name=feat-" --format "{{.Names}}" | while read container; do
  echo "  - $container: $(docker inspect -f '{{.State.Status}}' $container)"
done
echo ""

# 容器狀態
echo "【容器狀態】"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep daodao
```

### 日誌查看

```bash
# 查看前端日誌
docker logs -f --tail 100 daodao-frontend-prod

# 查看後端日誌
docker logs -f --tail 100 daodao-backend-prod

# 查看 Traefik 日誌
docker logs -f --tail 100 traefik

# 查看 Nginx 日誌
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 故障排除

### 常見問題

#### 1. 域名無法訪問

```bash
# 檢查 DNS 解析
dig +short daodao.so
nslookup daodao.so

# 檢查 SSL 憑證
openssl s_client -connect daodao.so:443 -servername daodao.so

# 檢查容器狀態
docker ps | grep daodao
```

#### 2. CORS 錯誤

檢查後端日誌，確認：
- 前端域名在 ALLOWED_ORIGINS 中
- 功能分支的正則匹配是否正確
- OPTIONS 預檢請求是否正確處理

#### 3. SSL 憑證問題

```bash
# 查看憑證
sudo certbot certificates

# 手動更新憑證
sudo certbot renew

# 測試更新
sudo certbot renew --dry-run
```

---

## 附錄：快速參考

### 域名對應表

| 服務 | 正式環境 | 測試環境 | 功能分支 |
|------|----------|----------|----------|
| 前端 | daodao.so | dev.daodao.so | feat-*.daodao.so |
| API | api.daodao.so | api-dev.daodao.so | api-feat-*.daodao.so |
| 部落格 | blog.daodao.so | - | - |
| 文件 | docs.daodao.so | - | - |
| 後台 | admin.daodao.so | - | - |

### 常用命令

```bash
# 部署功能分支
./deploy-feature.sh update

# 銷毀功能分支
./destroy-feature.sh update

# 查看所有容器
docker ps -a

# 查看 Traefik 路由
docker logs traefik | grep -i router

# 重啟服務
docker-compose restart

# 查看資源使用
docker stats
```

---

**文件維護者**：島島技術團隊
**問題回報**：請在專案 issue 中提出
**最後更新**：2025-12-23
