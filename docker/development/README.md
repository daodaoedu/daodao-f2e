# Docker 開發環境

## 概述

此目錄包含用於本地開發的 Docker Compose 配置，**僅用於 nginx 反向代理**。

**重要變更：** 開發服務（`pnpm dev`）現在在**本地執行**，不在 Docker 內執行，以獲得最佳效能和即時熱重載。

**支援平台：** macOS、Linux、Windows

## 架構

- **本地執行** `pnpm dev` → 啟動開發服務（端口 3000、3001）
- **Docker nginx** → 反向代理到本地服務
  - **app-feat.daodao.so** → `http://localhost:3001` (product)
  - **feat.daodao.so** → `http://localhost:3000` (website)

## 目錄結構

```
docker/development/
├── docker-compose.yml             # Docker Compose 配置
├── nginx.conf                     # Nginx 配置
├── docker-entrypoint.sh           # Docker 容器啟動腳本
├── generate-ssl.sh                # SSL 證書生成腳本
└── README.md                      # 本文件
```

## 快速開始

### 前置準備

在使用 Docker 開發環境之前，請確保已將以下域名添加到您的 hosts 文件中：

```
127.0.0.1 app-feat.daodao.so
127.0.0.1 feat.daodao.so
```

- **macOS/Linux:** 編輯 `/etc/hosts`
- **Windows:** 編輯 `C:\Windows\System32\drivers\etc\hosts`

### 啟動服務

**步驟 1：啟動本地開發服務**

在專案根目錄執行：

```bash
# 啟動所有開發服務（website:3000, product:3001）
pnpm dev
```

**步驟 2：啟動 Docker nginx 反向代理**

在另一個終端視窗：

```bash
cd docker/development

# 啟動 nginx（不需要 --build，因為不再構建開發服務）
docker-compose up -d

# 查看狀態
docker-compose ps

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

**或使用 npm scripts（推薦）：**

```bash
# 在專案根目錄
# 終端 1：啟動開發服務
pnpm dev

# 終端 2：啟動 nginx
pnpm docker:dev
```

### 使用 npm scripts

在項目根目錄可以使用 npm scripts：

```bash
# 啟動 nginx（需要先執行 pnpm dev）
pnpm docker:dev

# 停止 nginx
pnpm docker:dev:down

# 查看 nginx 狀態
pnpm docker:dev:status

# 查看 nginx 日誌
pnpm docker:dev:logs

# 重啟 nginx
pnpm docker:dev:restart
```

**完整開發流程：**

```bash
# 終端 1：啟動開發服務
pnpm dev

# 終端 2：啟動 nginx 反向代理
pnpm docker:dev

# 現在可以訪問：
# - https://app-feat.daodao.so (product)
# - https://feat.daodao.so (website)
```

## SSL 證書

SSL 證書會在容器啟動時自動生成（如果不存在）。證書存儲在 `./ssl/` 目錄中。

如果需要重新生成證書：

```bash
./generate-ssl.sh
```

## 故障排除

### 檢查 Docker 服務狀態

```bash
docker-compose ps
docker-compose logs
```

### 檢查域名解析

確保 hosts 文件已正確配置：

- **macOS/Linux:** `cat /etc/hosts | grep daodao`
- **Windows:** `Get-Content C:\Windows\System32\drivers\etc\hosts | Select-String "daodao"`

### 重新啟動 nginx

如果遇到問題，可以嘗試重新啟動：

```bash
docker-compose down
docker-compose up -d
```

### 檢查本地開發服務

確保本地開發服務正在運行：

```bash
# 檢查端口是否被佔用
lsof -i :3000  # website
lsof -i :3001  # product

# 或直接訪問
curl http://localhost:3000
curl http://localhost:3001
```

### Linux 用戶注意事項

在 Linux 上，`host.docker.internal` 可能不可用。如果遇到連接問題，可以：

1. 使用 `network_mode: "host"`（修改 docker-compose.yml）
2. 或使用主機 IP 地址替代 `host.docker.internal`
