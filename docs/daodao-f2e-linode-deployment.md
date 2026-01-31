# 島島前端 (daodao-f2e) Linode 部署完整指南

**日期**：2026-01-09
**狀態**：✅ 配置完成，可以開始部署
**架構**：與 daodao-server 相同的 CI/CD 模式

---

## 📋 目錄

- [系統架構](#系統架構)
- [已創建的文件](#已創建的文件)
- [環境配置](#環境配置)
- [GitHub Secrets 設定](#github-secrets-設定)
- [部署流程](#部署流程)
- [常用命令](#常用命令)
- [監控與維護](#監控與維護)
- [故障排除](#故障排除)

---

## 🏗️ 系統架構

### 整體架構

```
GitHub Repository (daodao-f2e)
    ↓
[CI] TypeScript Check → Lint → Build
    ↓
[CD] Build Docker Images → Push to Docker Hub
    ↓
[Deploy] SSH to Linode → Pull Images → Start Containers
    ↓
[Verify] Health Check → Discord Notification
```

### 部署環境

| 環境 | 分支 | 域名 | 容器 |
|-----|------|------|------|
| **正式環境** | main | daodao.so<br>app.daodao.so | prod_website<br>prod_product |
| **測試環境** | dev | dev.daodao.so<br>app-dev.daodao.so | dev_website<br>dev_product |

### 網路架構

```
Nginx (daodao-server)
    ↓
┌─────────────┬─────────────┐
↓             ↓             ↓
prod-daodao-network    dev-daodao-network
    ↓                       ↓
prod_website          dev_website
prod_product          dev_product
```

---

## 📁 已創建的文件

### CI/CD Workflows

✅ **`.github/workflows/linode-ci.yml`**
- 持續整合：類型檢查、Lint、構建
- 觸發：PR to main/dev
- 輸出：構建產物 artifact

✅ **`.github/workflows/linode-cd.yml`**
- 持續部署：Docker 構建、推送、部署
- 觸發：push to main/dev
- 支援：單獨部署 website 或 product
- 策略：藍綠部署（零停機）

✅ **`.github/workflows/linode-emergency-rebuild.yml`**
- 緊急重建：強制清除快取，完全重建
- 觸發：手動
- 用途：解決快取相關問題

### Docker 配置

✅ **`docker-compose.yaml`**
- 4 個服務：prod_website, prod_product, dev_website, dev_product
- 外部網路：prod-daodao-network, dev-daodao-network
- 健康檢查：每個容器都配置健康檢查
- 資源限制：適配 2GB RAM VPS

✅ **`Dockerfile`**（已存在）
- 支援多應用構建（APP_NAME, APP_PORT）
- 使用 standalone 輸出模式

### 備份文件

✅ **`docker-compose.local.yml.backup`**
- 原本的本地開發配置

---

## ⚙️ 環境配置

### 1. 創建環境變數文件

在 daodao-f2e 根目錄創建：

#### `.env.prod`（正式環境）

```bash
# ============================================
# 基本配置
# ============================================
NODE_ENV=production

# ============================================
# 共用 API 配置
# ============================================
NEXT_PUBLIC_API_URL=https://dao-server.daoedu.tw/api/v1
NEXT_PUBLIC_BACKEND_URL=https://dao-server.daoedu.tw

# ============================================
# Website 應用配置
# ============================================
NEXT_PUBLIC_SITE_URL_WEBSITE=https://daodao.so
NEXT_PUBLIC_SITE_NAME_WEBSITE=島島阿學

# ============================================
# Product 應用配置
# ============================================
NEXT_PUBLIC_SITE_URL_PRODUCT=https://app.daodao.so
NEXT_PUBLIC_SITE_NAME_PRODUCT=島島阿學 - 產品

# ============================================
# 功能開關
# ============================================
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true

# ============================================
# Google Analytics
# ============================================
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID_WEBSITE=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID_PRODUCT=G-YYYYYYYYYY

# ============================================
# Sentry 錯誤追蹤
# ============================================
NEXT_PUBLIC_SENTRY_DSN_WEBSITE=https://xxx-website@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN_PRODUCT=https://xxx-product@sentry.io/xxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production

# ============================================
# 其他配置
# ============================================
NEXT_TELEMETRY_DISABLED=1
```

#### `.env.dev`（測試環境）

```bash
# ============================================
# 基本配置
# ============================================
NODE_ENV=production

# ============================================
# 共用 API 配置
# ============================================
NEXT_PUBLIC_API_URL=https://server.daoedu.tw/api/v1
NEXT_PUBLIC_BACKEND_URL=https://server.daoedu.tw

# ============================================
# Website 應用配置
# ============================================
NEXT_PUBLIC_SITE_URL_WEBSITE=https://dev.daodao.so
NEXT_PUBLIC_SITE_NAME_WEBSITE=島島阿學 (測試)

# ============================================
# Product 應用配置
# ============================================
NEXT_PUBLIC_SITE_URL_PRODUCT=https://app-dev.daodao.so
NEXT_PUBLIC_SITE_NAME_PRODUCT=島島阿學 - 產品 (測試)

# ============================================
# 功能開關
# ============================================
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=false
NEXT_PUBLIC_DEBUG_MODE=true

# ============================================
# Sentry 錯誤追蹤
# ============================================
NEXT_PUBLIC_SENTRY_DSN_WEBSITE=https://xxx-website@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN_PRODUCT=https://xxx-product@sentry.io/xxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development

# ============================================
# 其他配置
# ============================================
NEXT_TELEMETRY_DISABLED=1
```

### 2. 在 Linode 服務器創建環境文件

SSH 到 Linode 服務器：

```bash
ssh root@<LINODE_IP>

# 創建項目目錄
mkdir -p /root/daodao-f2e
cd /root/daodao-f2e

# 創建 .env.prod 和 .env.dev
# 使用上面的模板內容
nano .env.prod
nano .env.dev

# 設置權限
chmod 600 .env.prod .env.dev
```

---

## 🔑 GitHub Secrets 設定

在 GitHub Repository → Settings → Secrets and variables → Actions 中添加：

### 必要 Secrets

| Secret 名稱 | 說明 | 範例 |
|------------|------|------|
| `DOCKER_HUB_USERNAME` | Docker Hub 用戶名 | `your-username` |
| `DOCKER_HUB_ACCESS_TOKEN` | Docker Hub Access Token | `dckr_pat_xxxxx` |
| `LINODE_INSTANCE_IP` | Linode 服務器 IP | `139.162.xx.xx` |
| `LINODE_SSH_PRIVATE_KEY` | SSH 私鑰 | `-----BEGIN OPENSSH...` |
| `GIT_HUB_USERNAME` | GitHub 用戶名 | `your-github-username` |
| `GIT_HUB_ACCESS_TOKEN` | GitHub Personal Access Token | `ghp_xxxxx` |
| `DISCORD_WEBHOOK_URL` | Discord Webhook URL | `https://discord.com/api/webhooks/...` |

### 如何獲取 Secrets

#### 1. Docker Hub Access Token
```bash
# 登入 Docker Hub → Account Settings → Security → New Access Token
# 權限：Read, Write, Delete
```

#### 2. Linode SSH 私鑰
```bash
# 在本機生成 SSH 密鑰對
ssh-keygen -t ed25519 -C "github-actions@daodao-f2e"

# 將公鑰添加到 Linode
cat ~/.ssh/id_ed25519.pub
# SSH 到 Linode，添加到 ~/.ssh/authorized_keys

# 將私鑰內容添加到 GitHub Secret
cat ~/.ssh/id_ed25519
```

#### 3. GitHub Personal Access Token
```bash
# GitHub → Settings → Developer settings → Personal access tokens → Generate new token
# 權限：repo (Full control of private repositories)
```

#### 4. Discord Webhook URL
```bash
# Discord Server → Edit Channel → Integrations → Webhooks → New Webhook
# 複製 Webhook URL
```

---

## 🚀 部署流程

### 自動部署（推薦）

#### 部署正式環境
```bash
# 1. 確保代碼已合併到 main 分支
git checkout main
git pull origin main

# 2. 推送到 main 分支觸發自動部署
git push origin main

# 3. 觀察 GitHub Actions
# Repository → Actions → Linode CD workflow
# 等待部署完成，查看 Discord 通知
```

#### 部署測試環境
```bash
# 推送到 dev 分支
git checkout dev
git pull origin dev
git push origin dev

# 自動觸發部署到測試環境
```

### 手動部署

#### 只部署 Website
```bash
# GitHub → Actions → Linode CD → Run workflow
# 選擇：
# - Branch: main 或 dev
# - App: website
# - Force deploy: false
```

#### 只部署 Product
```bash
# GitHub → Actions → Linode CD → Run workflow
# 選擇：
# - Branch: main 或 dev
# - App: product
# - Force deploy: false
```

#### 強制部署（跳過 CI）
```bash
# 緊急修復時使用
# Force deploy: true
```

### 緊急重建

當遇到快取問題時：

```bash
# GitHub → Actions → Linode Emergency Rebuild → Run workflow
# 選擇：
# - Branch: main 或 dev
# - App: all / website / product
# - Reason: 填寫重建原因
# - Skip tests: 僅緊急情況勾選
```

---

## 📝 常用命令

### 在 Linode 服務器上

#### 查看容器狀態
```bash
cd /root/daodao-f2e
docker ps | grep -E "website|product"
```

#### 查看日誌
```bash
# Website 日誌
docker logs prod_website --tail=100 -f
docker logs dev_website --tail=100 -f

# Product 日誌
docker logs prod_product --tail=100 -f
docker logs dev_product --tail=100 -f
```

#### 手動重啟容器
```bash
# 重啟正式環境
docker compose -f docker-compose.yaml --env-file .env.prod restart prod_website prod_product

# 重啟測試環境
docker compose -f docker-compose.yaml --env-file .env.dev restart dev_website dev_product
```

#### 手動拉取新映像
```bash
# 拉取正式環境映像
export DOCKER_HUB_USERNAME=your-username
export IMAGE_TAG=prod
export COMMIT_SHA=latest-commit-sha

docker pull ${DOCKER_HUB_USERNAME}/daodao-website:${IMAGE_TAG}-${COMMIT_SHA}
docker pull ${DOCKER_HUB_USERNAME}/daodao-product:${IMAGE_TAG}-${COMMIT_SHA}
```

#### 停止環境（節省資源）
```bash
# 停止測試環境（保留數據）
docker compose -f docker-compose.yaml --env-file .env.dev stop dev_website dev_product

# 啟動測試環境
docker compose -f docker-compose.yaml --env-file .env.dev up -d dev_website dev_product
```

#### 健康檢查
```bash
# 檢查容器健康狀態
docker inspect --format='{{.State.Health.Status}}' prod_website
docker inspect --format='{{.State.Health.Status}}' prod_product

# 測試容器內部訪問
docker exec prod_website wget --quiet --tries=1 --spider http://localhost:3000
docker exec prod_product wget --quiet --tries=1 --spider http://localhost:3001
```

#### 資源監控
```bash
# 查看資源使用
docker stats prod_website prod_product dev_website dev_product --no-stream

# 查看系統資源
free -h
df -h
```

#### 清理磁碟空間
```bash
# 清理舊映像
docker image prune -a -f --filter "until=48h"

# 清理構建快取
docker builder prune -a -f

# 完整清理（小心使用）
docker system prune -a --volumes -f
```

---

## 📊 監控與維護

### Discord 通知

CI/CD 會自動發送以下通知到 Discord：

- ✅ **CI 成功**：代碼檢查通過
- ❌ **CI 失敗**：類型錯誤或 Lint 失敗
- ✅ **部署成功**：容器啟動並通過健康檢查
- ❌ **部署失敗**：構建或部署過程出錯
- ⚠️ **緊急重建**：強制重建完成

### 健康檢查端點

確保應用有健康檢查端點：

- Website: `GET /` 或自定義健康檢查路由
- Product: `GET /` 或自定義健康檢查路由

### 日誌管理

正式環境：
- Docker 日誌已禁用（logging: driver: "none"）
- 需要應用層面的日誌方案（如文件日誌）

測試環境：
- 保留最近 1MB 日誌
- 使用 `docker logs` 查看

---

## 🔧 故障排除

### 問題 1：部署失敗 - 無法拉取映像

**症狀**：
```
Error: failed to pull image: unauthorized
```

**解決方案**：
1. 檢查 Docker Hub Secrets 是否正確
2. 確認映像已成功推送到 Docker Hub
3. 檢查映像名稱和標籤是否正確

```bash
# 在 Linode 上手動登入 Docker Hub
docker login -u your-username

# 手動拉取測試
docker pull your-username/daodao-website:prod-commit-sha
```

### 問題 2：容器啟動但健康檢查失敗

**症狀**：
```
Container started but health check failed
```

**解決方案**：
1. 查看容器日誌
```bash
docker logs prod_website --tail=100
```

2. 進入容器檢查
```bash
docker exec -it prod_website sh
wget --quiet --tries=1 --spider http://localhost:3000
```

3. 檢查環境變數
```bash
docker exec prod_website env | grep NEXT_PUBLIC
```

### 問題 3：網路連接問題

**症狀**：
```
nginx: [error] connect() failed
```

**解決方案**：
1. 檢查外部網路是否存在
```bash
docker network ls | grep daodao-network
```

2. 如果不存在，需要由 daodao-server 創建
```bash
docker network create prod-daodao-network
docker network create dev-daodao-network
```

3. 重新啟動容器
```bash
docker compose -f docker-compose.yaml --env-file .env.prod up -d --force-recreate
```

### 問題 4：磁碟空間不足

**症狀**：
```
Error: no space left on device
```

**解決方案**：
```bash
# 檢查磁碟使用
df -h

# 清理 Docker 資源
docker system prune -a --volumes -f

# 清理舊映像
docker images | grep "months ago" | awk '{print $3}' | xargs docker rmi
```

### 問題 5：內存不足

**症狀**：
```
Container killed due to OOM
```

**解決方案**：
1. 檢查資源使用
```bash
docker stats --no-stream
```

2. 停止非必要容器
```bash
# 停止測試環境
docker compose --env-file .env.dev stop dev_website dev_product
```

3. 調整資源限制（在 docker-compose.yaml 中）

### 問題 6：CI 構建失敗

**症狀**：
```
TypeScript errors or Lint failures
```

**解決方案**：
1. 本地運行檢查
```bash
pnpm run typecheck
pnpm run lint
```

2. 修復錯誤後重新提交
```bash
git add .
git commit -m "fix: resolve type errors"
git push
```

### 問題 7：緊急情況 - 快速回滾

**解決方案**：
```bash
# 1. SSH 到 Linode
ssh root@<LINODE_IP>
cd /root/daodao-f2e

# 2. 拉取上一個版本的映像
export PREVIOUS_COMMIT=<previous-commit-sha>
docker pull ${DOCKER_HUB_USERNAME}/daodao-website:prod-${PREVIOUS_COMMIT}

# 3. 更新 docker-compose.yaml 中的 COMMIT_SHA
export COMMIT_SHA=${PREVIOUS_COMMIT}

# 4. 重新啟動容器
docker compose --env-file .env.prod up -d --force-recreate prod_website prod_product
```

---

## 📚 相關文檔

- **部署配置總結**：`deployment-config-confirmed.md`
- **2GB RAM 優化方案**：`deployment-plan-2gb-ram.md`
- **Monorepo 部署指南**：`monorepo-deployment-guide.md`
- **環境變數模板**：`env-files-template.md`
- **快速測試指南**：`test-with-existing-yaml.md`

---

## ✅ 部署檢查清單

### 初次部署前

- [ ] 在 GitHub 設置所有必要的 Secrets
- [ ] 在 Linode 創建 .env.prod 和 .env.dev
- [ ] 確認 daodao-server 的外部網路已創建
- [ ] 確認 Nginx 配置已添加前端域名
- [ ] 測試 SSH 連接到 Linode
- [ ] 確認 Docker Hub 可以訪問

### 每次部署後

- [ ] 檢查 GitHub Actions 是否成功
- [ ] 查看 Discord 通知
- [ ] SSH 到 Linode 檢查容器狀態
- [ ] 測試網站訪問：https://daodao.so
- [ ] 測試產品訪問：https://app.daodao.so
- [ ] 檢查容器日誌
- [ ] 監控資源使用

---

## 🎯 最佳實踐

1. **永遠先部署到測試環境**
   - push 到 dev 分支
   - 驗證功能正常
   - 再合併到 main

2. **使用 Feature Branch 開發**
   - 從 dev 創建 feature 分支
   - 完成後 PR 到 dev
   - 測試通過後 PR 到 main

3. **監控資源使用**
   - 定期檢查容器內存使用
   - VPS 只有 2GB RAM，注意優化

4. **定期清理**
   - 每週清理舊 Docker 映像
   - 檢查磁碟空間使用

5. **保持環境變數同步**
   - 本地、GitHub Secrets、Linode 服務器
   - 記錄變更歷史

6. **使用 Discord 通知**
   - 所有團隊成員加入 Discord 頻道
   - 及時響應部署失敗通知

---

**文件維護者**：島島技術團隊
**創建日期**：2026-01-09
**狀態**：✅ 完整配置，可以開始部署
