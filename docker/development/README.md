# Docker 開發環境

## 概述

此目錄包含用於本地開發的 Docker Compose 配置，自動配置 nginx 反向代理。

**支援平台：** macOS、Linux、Windows

## 架構

- **app-feat.daodao.so** → 轉向端口 3001 (product)
- **feat.daodao.so** → 轉向端口 3000 (website)

## 目錄結構

```
docker/development/
├── docker-compose.yml             # Docker Compose 配置
├── nginx.conf                     # Nginx 配置
├── Dockerfile                     # Docker 映像檔配置
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

```bash
cd docker/development

# 啟動服務
docker-compose up -d --build

# 查看狀態
docker-compose ps

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

### 使用 npm scripts

在項目根目錄也可以使用 npm scripts：

```bash
# 啟動服務
pnpm docker:dev

# 停止服務
pnpm docker:dev:down

# 查看狀態
pnpm docker:dev:status

# 查看日誌
pnpm docker:dev:logs

# 重啟服務
pnpm docker:dev:restart
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

### 重新構建容器

如果遇到問題，可以嘗試重新構建：

```bash
docker-compose down
docker-compose up -d --build
```
