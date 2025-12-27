# Docker 部署指南

## 快速開始

### 使用 Docker Compose（推薦）

```bash
# 建置並啟動
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止
docker-compose down
```

### 使用 Docker 命令

```bash
# 建置映像
docker build -t daodao-website .

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

## 環境變數

如果需要設定環境變數，可以：

1. **使用 docker-compose.yml**：取消註解 `env_file` 區塊
2. **使用 Docker 命令**：添加 `-e KEY=value` 參數
3. **使用 .env 文件**：創建 `.env.production` 文件

## VPS 部署步驟

```bash
# 1. 克隆專案
git clone <your-repo-url>
cd daodao-f2e

# 2. 建置並啟動（使用 docker-compose）
docker-compose up -d --build

# 3. 設定 Nginx 反向代理（可選）
# 參考之前的 Nginx 配置
```

## 更新部署

```bash
# 拉取最新代碼
git pull

# 重新建置並重啟
docker-compose up -d --build
```

## 注意事項

- 確保 VPS 有足夠記憶體（建議 2GB+）
- 首次建置可能需要較長時間
- 生產環境建議使用環境變數文件管理敏感資訊

