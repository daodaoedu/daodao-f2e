# Docker 部署指南

## 📋 目錄

- [本地測試](#本地測試)
- [開發環境](#開發環境)
- [生產環境](#生產環境)
- [映像大小檢查](#映像大小檢查)

## 🧪 本地測試

### 建置生產映像

```bash
# 建置 website 映像
docker build --build-arg APP_NAME=website --build-arg APP_PORT=3000 -t daodao-website:latest .

# 建置 product 映像
docker build --build-arg APP_NAME=product --build-arg APP_PORT=3001 -t daodao-product:latest .
```

### 運行生產映像

```bash
# 運行 website
docker run -d \
  --name daodao-website \
  -p 3000:3000 \
  -e NODE_ENV=production \
  daodao-website:latest

# 運行 product
docker run -d \
  --name daodao-product \
  -p 3001:3001 \
  -e NODE_ENV=production \
  daodao-product:latest
```

### 檢查映像大小

```bash
# 查看映像大小
docker images daodao-website:latest
docker images daodao-product:latest

# 詳細分析映像層
docker history daodao-website:latest

# 使用 dive 工具分析（需要安裝: brew install dive）
dive daodao-website:latest
```

### 查看日誌

```bash
# 查看 website 日誌
docker logs -f daodao-website

# 查看 product 日誌
docker logs -f daodao-product
```

### 進入容器檢查

```bash
# 進入 website 容器
docker exec -it daodao-website sh

# 檢查檔案結構
ls -lah /app
du -sh /app/*

# 檢查 node_modules 大小
du -sh /app/node_modules
```

### 停止和清理

```bash
# 停止容器
docker stop daodao-website daodao-product

# 移除容器
docker rm daodao-website daodao-product

# 移除映像
docker rmi daodao-website:latest daodao-product:latest
```

## 💻 開發環境

### 使用開發環境 Dockerfile

開發環境支援 hot reload，適合本地開發使用。

```bash
# 使用 docker-compose.dev.yml 啟動開發環境
docker-compose -f docker-compose.dev.yml up

# 或只啟動特定服務
docker-compose -f docker-compose.dev.yml up website

# 背景運行
docker-compose -f docker-compose.dev.yml up -d

# 查看日誌
docker-compose -f docker-compose.dev.yml logs -f

# 停止服務
docker-compose -f docker-compose.dev.yml down
```

### 開發環境特點

- ✅ **Hot Reload**: 源碼變更自動重新載入
- ✅ **完整依賴**: 包含所有 devDependencies
- ✅ **開發工具**: 包含 git, curl, vim 等工具
- ✅ **Volume Mount**: 源碼掛載，即時反映變更

### 手動建置開發映像

```bash
# 建置開發映像
docker build -f Dockerfile.dev --build-arg APP_NAME=website --build-arg APP_PORT=3000 -t daodao-website:dev .

# 運行開發容器（掛載源碼）
docker run -d \
  --name daodao-website-dev \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  -e NODE_ENV=development \
  daodao-website:dev
```

## 🚀 生產環境

### 使用 Docker Compose（推薦）

```bash
# 建置並啟動所有服務
docker-compose up -d

# 只啟動特定服務
docker-compose up -d website
docker-compose up -d product

# 查看所有日誌
docker-compose logs -f

# 查看特定服務日誌
docker-compose logs -f website
docker-compose logs -f product

# 停止所有服務
docker-compose down

# 停止特定服務
docker-compose stop website
docker-compose stop product
```

### 使用 Docker 命令

#### Website (Port 3000)

```bash
# 建置映像
docker build --build-arg APP_NAME=website --build-arg APP_PORT=3000 -t daodao-website .

# 運行容器
docker run -d \
  --name daodao-website \
  -p 3000:3000 \
  -e NODE_ENV=production \
  daodao-website

# 查看日誌
docker logs -f daodao-website

# 停止容器
docker stop daodao-website
docker rm daodao-website
```

#### Product (Port 3001)

```bash
# 建置映像
docker build --build-arg APP_NAME=product --build-arg APP_PORT=3001 -t daodao-product .

# 運行容器
docker run -d \
  --name daodao-product \
  -p 3001:3001 \
  -e NODE_ENV=production \
  daodao-product

# 查看日誌
docker logs -f daodao-product

# 停止容器
docker stop daodao-product
docker rm daodao-product
```

## 環境變數

如果需要設定環境變數，可以：

1. **使用 docker-compose.yml**：取消註解 `env_file` 區塊
2. **使用 Docker 命令**：添加 `-e KEY=value` 參數
3. **使用 .env 文件**：創建 `.env.production` 文件

## Port 配置

- **Website**: Port `3000` - http://localhost:3000
- **Product**: Port `3001` - http://localhost:3001

## VPS 部署步驟

```bash
# 1. 克隆專案
git clone <your-repo-url>
cd daodao-f2e

# 2. 建置並啟動所有服務（使用 docker-compose）
docker-compose up -d --build

# 或只啟動特定服務
docker-compose up -d --build website
docker-compose up -d --build product

# 3. 設定 Nginx 反向代理（可選）
# Website: proxy_pass http://localhost:3000;
# Product: proxy_pass http://localhost:3001;
```

## 更新部署

```bash
# 拉取最新代碼
git pull

# 重新建置並重啟
docker-compose up -d --build
```

## 📊 映像大小檢查

### 檢查映像大小

```bash
# 查看所有映像
docker images | grep daodao

# 查看特定映像的詳細資訊
docker images daodao-website:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
```

### 分析映像內容

```bash
# 使用 docker history 查看各層大小
docker history daodao-website:latest

# 使用 dive 工具（推薦）
# 安裝: brew install dive (macOS) 或從 https://github.com/wagoodman/dive 下載
dive daodao-website:latest
```

### 預期大小

- **生產映像**: ~400-600 MB（優化後）
- **開發映像**: ~1.5-2 GB（包含所有 devDependencies）

## 📝 Dockerfile 說明

### Dockerfile（生產環境）

- ✅ 多階段建置，最小化映像大小
- ✅ 只包含 production 依賴
- ✅ 只複製建置產物，不包含源碼
- ✅ 使用非 root 用戶運行

### Dockerfile.dev（開發環境）

- ✅ 包含所有 devDependencies
- ✅ 支援 hot reload
- ✅ 包含開發工具
- ✅ 適合本地開發使用

## 🔍 故障排除

### 建置失敗

```bash
# 清理 Docker cache
docker builder prune -a

# 重新建置（不使用 cache）
docker build --no-cache --build-arg APP_NAME=website -t daodao-website:latest .
```

### 容器無法啟動

```bash
# 查看容器日誌
docker logs daodao-website

# 檢查容器狀態
docker ps -a

# 進入容器檢查
docker exec -it daodao-website sh
```

### 映像太大

```bash
# 檢查哪些檔案佔用空間
docker run --rm -it daodao-website:latest sh
du -sh /app/*

# 檢查 node_modules
docker run --rm daodao-website:latest du -sh /app/node_modules
```

## ⚠️ 注意事項

- **生產環境**: 使用 `Dockerfile`，映像較小，適合部署
- **開發環境**: 使用 `Dockerfile.dev`，支援 hot reload，適合本地開發
- 確保 VPS 有足夠記憶體（建議 2GB+）
- 首次建置可能需要較長時間（下載依賴）
- 生產環境建議使用環境變數文件管理敏感資訊
- 開發環境使用 volume mount，確保源碼變更即時反映

