# 島島前端 Monorepo 部署配置 - 已確認項目

**文件日期**：2026-01-08
**狀態**：配置確認完成，待實施

---

## ✅ 已確認的配置決策

### 1. 域名映射策略

| 應用 | 正式環境 | 測試環境 | 功能分支 |
|------|----------|----------|----------|
| **Website** | daodao.so | dev.daodao.so | feat-{branch}.daodao.so |
| **Product** | app.daodao.so | app-dev.daodao.so | app-feat-{branch}.daodao.so |

**理由**：
- ✅ 職責清晰：主站用主域名，產品用子域名
- ✅ 易於擴展：未來可以繼續添加其他子域名服務
- ✅ SEO 友好：主站保持主域名權重

### 2. 部署策略

**✅ 同時部署兩個應用**

**實施方式**：
```bash
# 使用並行構建
docker-compose build --parallel website_prod product_prod

# 同時啟動所有容器
docker-compose up -d website_prod product_prod
```

**CI/CD 配置**：
- GitHub Actions 的兩個 job (deploy-website, deploy-product) 會並行執行
- 可以節省部署時間
- 如果一個失敗不影響另一個

**部署命令**：
```bash
# 正式環境同時部署
./deploy.sh prod all

# 測試環境同時部署
./deploy.sh dev all

# 功能分支同時部署
./deploy.sh feature all update
```

### 3. 後端 API 配置

**✅ 兩個應用共用同個後端 API**

| 環境 | API 端點 |
|------|---------|
| 正式環境 | `https://dao-server.daoedu.tw/api/v1` |
| 測試環境 | `https://server.daoedu.tw/api/v1` |
| 功能分支 | `https://server.daoedu.tw/api/v1` |

**環境變數配置**：
```bash
# .env.prod
NEXT_PUBLIC_API_URL=https://dao-server.daoedu.tw/api/v1
NEXT_PUBLIC_BACKEND_URL=https://dao-server.daoedu.tw

# .env.dev
NEXT_PUBLIC_API_URL=https://server.daoedu.tw/api/v1
NEXT_PUBLIC_BACKEND_URL=https://server.daoedu.tw

# .env.feature
NEXT_PUBLIC_API_URL=https://server.daoedu.tw/api/v1
NEXT_PUBLIC_BACKEND_URL=https://server.daoedu.tw
```

---

## 📊 完整的服務架構

### Docker Compose 服務清單

```yaml
services:
  # 正式環境 (prod-daodao-network)
  website_prod:      # daodao.so → :3000
  product_prod:      # app.daodao.so → :3001

  # 測試環境 (dev-daodao-network)
  website_dev:       # dev.daodao.so → :3000
  product_dev:       # app-dev.daodao.so → :3001

  # 功能分支 (dev-daodao-network)
  website_feat:      # feat-{branch}.daodao.so → :3000
  product_feat:      # app-feat-{branch}.daodao.so → :3001
```

### 網路連接

```
                    Nginx (在 daodao-server)
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
prod-daodao-network                   dev-daodao-network
        ↓                                       ↓
  ┌─────┴─────┐                    ┌────────────┴────────────┐
  ↓           ↓                    ↓            ↓             ↓
website_prod  product_prod    website_dev  product_dev  website_feat
                                                          product_feat
```

### 資源配置（每個容器）

| 資源類型 | 限制 | 保留 |
|---------|------|------|
| Memory | 1GB | 512MB |
| CPU | 1.0 | 0.5 |

**總資源需求**：
- 正式環境：2 容器 × 1GB = 2GB RAM
- 測試環境：2 容器 × 1GB = 2GB RAM
- 功能分支：2 容器 × 1GB = 2GB RAM（按需部署）
- **最大同時運行**：6GB RAM, 6 CPU cores

---

## 🔧 優化的部署腳本

已創建優化版部署腳本：`optimized-deploy.sh`

**關鍵特性**：
- ✅ 支援並行構建：`docker-compose build --parallel`
- ✅ 支援同時部署：`docker-compose up -d` 多個服務
- ✅ 智能模式切換：單應用用單一模式，多應用用並行模式
- ✅ 並行健康檢查：同時檢查所有容器狀態
- ✅ 詳細的日誌輸出：清晰的進度顯示

**使用範例**：
```bash
# 同時部署正式環境所有應用（並行模式）
./optimized-deploy.sh prod all

# 只部署 website（單一模式）
./optimized-deploy.sh prod website

# 同時部署功能分支（並行模式）
./optimized-deploy.sh feature all update
```

---

## 📄 需要創建的配置文件

### 1. 環境變數文件

#### `.env.prod`
```bash
NODE_ENV=production

# 共用 API 配置
NEXT_PUBLIC_API_URL=https://dao-server.daoedu.tw/api/v1
NEXT_PUBLIC_BACKEND_URL=https://dao-server.daoedu.tw

# Website 特定配置
NEXT_PUBLIC_SITE_URL_WEBSITE=https://daodao.so
NEXT_PUBLIC_SITE_NAME_WEBSITE=島島阿學

# Product 特定配置
NEXT_PUBLIC_SITE_URL_PRODUCT=https://app.daodao.so
NEXT_PUBLIC_SITE_NAME_PRODUCT=島島阿學 - 產品

# 功能開關
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true

# 第三方服務 - Website
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID_WEBSITE=G-WEBSITE-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN_WEBSITE=https://xxx-website@sentry.io/xxx

# 第三方服務 - Product
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID_PRODUCT=G-PRODUCT-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN_PRODUCT=https://xxx-product@sentry.io/xxx

NEXT_TELEMETRY_DISABLED=1
```

#### `.env.dev`
```bash
NODE_ENV=production

# 共用 API 配置
NEXT_PUBLIC_API_URL=https://server.daoedu.tw/api/v1
NEXT_PUBLIC_BACKEND_URL=https://server.daoedu.tw

# Website 特定配置
NEXT_PUBLIC_SITE_URL_WEBSITE=https://dev.daodao.so
NEXT_PUBLIC_SITE_NAME_WEBSITE=島島阿學 (測試)

# Product 特定配置
NEXT_PUBLIC_SITE_URL_PRODUCT=https://app-dev.daodao.so
NEXT_PUBLIC_SITE_NAME_PRODUCT=島島阿學 - 產品 (測試)

# 功能開關
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=false
NEXT_PUBLIC_DEBUG_MODE=true

NEXT_TELEMETRY_DISABLED=1
```

#### `.env.feature.template`
```bash
NODE_ENV=production

# 共用 API 配置
NEXT_PUBLIC_API_URL=https://server.daoedu.tw/api/v1
NEXT_PUBLIC_BACKEND_URL=https://server.daoedu.tw

# Website 特定配置
NEXT_PUBLIC_SITE_URL_WEBSITE=https://feat-{branch}.daodao.so
NEXT_PUBLIC_SITE_NAME_WEBSITE=島島阿學 (功能測試)

# Product 特定配置
NEXT_PUBLIC_SITE_URL_PRODUCT=https://app-feat-{branch}.daodao.so
NEXT_PUBLIC_SITE_NAME_PRODUCT=島島阿學 - 產品 (功能測試)

# 功能開關
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=false
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_FEATURE_BRANCH={branch}

NEXT_TELEMETRY_DISABLED=1
```

### 2. docker-compose.yaml

位置：`/Users/xiaoxu/Projects/daodao/daodao-f2e/docker-compose.yaml`

詳細配置請參考：`monorepo-deployment-guide.md`

### 3. 部署腳本

- ✅ **主要腳本**：`optimized-deploy.sh` - 已創建優化版
- ⏳ **回滾腳本**：`rollback.sh` - 可選，按需創建
- ⏳ **監控腳本**：`monitor.sh` - 可選，用於健康檢查

### 4. Nginx 配置

需要在後端服務器的 nginx.conf 添加 6 個域名的配置。

詳細配置請參考：`monorepo-deployment-guide.md` 中的「後端 Nginx 配置」章節

---

## ⏳ 待確認的配置項

### Google Analytics

**✅ 已確認：為兩個應用使用不同的 GA ID**

**理由**：
- ✅ 分別追蹤流量和用戶行為
- ✅ 更精確的數據分析
- ✅ 可以分別設置目標和轉換

**配置方式**：
```bash
# .env.prod
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID_WEBSITE=G-WEBSITE-ID
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID_PRODUCT=G-PRODUCT-ID
```

### Sentry 錯誤追蹤

**✅ 已確認：為兩個應用使用不同的 Sentry Project**

**理由**：
- ✅ 分別追蹤和管理錯誤
- ✅ 可以設置不同的告警規則
- ✅ 更容易定位問題來源

**配置方式**：
```bash
# .env.prod
NEXT_PUBLIC_SENTRY_DSN_WEBSITE=https://xxx-website@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN_PRODUCT=https://xxx-product@sentry.io/xxx
```

### 功能分支策略

**當前配置**：功能分支會同時部署兩個應用

**詢問**：
- 是否通常只需要測試其中一個應用？
- 如果是，可以優化部署腳本，支援：
  ```bash
  # 只部署 website 功能分支
  ./deploy.sh feature website update
  ```

---

## ⚠️ 2GB RAM VPS 特別說明

由於 VPS 只有 **2GB RAM**，需要採用**分時部署策略**：

- ✅ **正式環境**：24/7 運行（消耗 1GB）
- ⏰ **測試環境**：工作時間手動啟動（消耗 768MB）
- ⏰ **功能分支**：需要時手動啟動（消耗 768MB）

**重要**：測試環境和功能分支無法同時運行！

詳細方案請參考：**`deployment-plan-2gb-ram.md`** ⭐

---

## 🚀 下一步實施步驟

### 階段 1：配置文件創建（30分鐘）

1. **創建環境變數文件**
   ```bash
   cd /Users/xiaoxu/Projects/daodao/daodao-f2e

   # 創建正式環境配置
   touch .env.prod
   # 根據上面的模板填寫

   # 創建測試環境配置
   touch .env.dev
   # 根據上面的模板填寫

   # 創建功能分支模板
   cp doc/CICD-LINODE/.env.feature.template .env.feature.template
   ```

2. **複製 docker-compose.yaml**
   ```bash
   # 從文檔複製到專案根目錄
   # 內容參考 monorepo-deployment-guide.md
   ```

3. **複製部署腳本**
   ```bash
   # 複製優化版部署腳本
   cp doc/CICD-LINODE/optimized-deploy.sh deploy.sh
   chmod +x deploy.sh
   ```

4. **更新 product 配置**
   ```bash
   # 在 apps/product/next.config.ts 添加
   # output: "standalone"
   ```

### 階段 2：後端配置（1小時）

1. **DNS 配置**
   - [ ] 添加 `app.daodao.so` A 記錄
   - [ ] 添加 `app-dev.daodao.so` A 記錄
   - [ ] 配置泛域名 `app-feat-*.daodao.so`

2. **SSL 證書**
   ```bash
   # 申請或確認泛域名證書包含新子域名
   sudo certbot certificates
   ```

3. **更新 Nginx 配置**
   - [ ] 添加 6 個域名的 server 配置
   - [ ] 測試配置：`nginx -t`
   - [ ] 重新載入：`nginx -s reload`

### 階段 3：測試部署（1小時）

1. **測試環境部署**
   ```bash
   cd /Users/xiaoxu/Projects/daodao/daodao-f2e

   # 同時部署測試環境
   ./deploy.sh dev all

   # 驗證訪問
   curl https://dev.daodao.so
   curl https://app-dev.daodao.so
   ```

2. **功能分支測試**
   ```bash
   # 部署測試功能分支
   ./deploy.sh feature all test-branch

   # 驗證訪問
   curl https://feat-test-branch.daodao.so
   curl https://app-feat-test-branch.daodao.so
   ```

### 階段 4：正式部署（30分鐘）

1. **生產環境部署**
   ```bash
   # 同時部署正式環境
   ./deploy.sh prod all

   # 驗證訪問
   curl https://daodao.so
   curl https://app.daodao.so
   ```

2. **健康檢查**
   ```bash
   # 檢查容器狀態
   docker ps | grep -E "website|product"

   # 檢查健康狀態
   docker inspect --format='{{.State.Health.Status}}' website_prod
   docker inspect --format='{{.State.Health.Status}}' product_prod
   ```

3. **設置 CI/CD**
   - [ ] 在 GitHub 設置 Secrets
   - [ ] 測試自動部署流程

---

## 📋 快速參考

### 部署命令速查

```bash
# 正式環境
./deploy.sh prod all        # 同時部署所有應用
./deploy.sh prod website    # 只部署 website
./deploy.sh prod product    # 只部署 product

# 測試環境
./deploy.sh dev all         # 同時部署所有應用
./deploy.sh dev website     # 只部署 website
./deploy.sh dev product     # 只部署 product

# 功能分支
./deploy.sh feature all update       # 同時部署所有應用
./deploy.sh feature website update   # 只部署 website
./deploy.sh feature product update   # 只部署 product
```

### 監控命令速查

```bash
# 查看容器狀態
docker ps | grep -E "website|product"

# 查看日誌
docker logs -f website_prod
docker logs -f product_prod

# 健康檢查
curl https://daodao.so/api/health
curl https://app.daodao.so/api/health

# 資源使用
docker stats website_prod product_prod
```

---

## 📚 相關文檔

- **主要部署指南**：`monorepo-deployment-guide.md`
- **部署總結**：`monorepo-deployment-summary.md`
- **優化部署腳本**：`optimized-deploy.sh`
- **CI/CD Workflows**：`.github/workflows/deploy-*.yml`

---

**文件維護者**：島島技術團隊
**配置日期**：2026-01-08
**狀態**：✅ 配置確認完成，待實施
