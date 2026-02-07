# 伺服器資源分析報告

> 分析日期：2026-01-20

## 伺服器概況

| 指標 | 數值 | 狀態 |
|------|------|------|
| 運行時間 | 201 天 | 穩定 |
| 負載平均 | 0.44, 0.48, 0.53 | ✅ 正常 |
| CPU 空閒 | 81.9% | ✅ 充足 |
| 總內存 | 1964 MB (~2GB) | |
| 內存使用 | 1393 MB (71%) | ⚠️ 偏高 |
| 可用內存 | 386 MB | ⚠️ 不足 |
| Swap 使用 | 1220 MB (26%) | ⚠️ 已啟用 |

## 容器清單

目前運行 **16 個容器**：

| 容器名稱 | 映像 | 用途 | 環境 |
|----------|------|------|------|
| feat_product | daodao-product | 產品頁前端 | feat 測試 |
| feat_website | daodao-website | 網站前端 | feat 測試 |
| daodao-server-dev_app-1 | app:dev | 主應用 | dev |
| prod_app | app:prod | 主應用 | prod |
| pg-dev | postgres:14 | PostgreSQL | dev |
| postgres-dev | postgres:14 | PostgreSQL | dev |
| postgres-prod | postgres:14 | PostgreSQL | prod |
| mongo_dev | mongo:4.4 | MongoDB | dev |
| mongo_prod | mongo:4.4 | MongoDB | prod |
| redis_dev | redis:6 | Redis | dev |
| redis_prod | redis:6 | Redis | prod |
| daodao-ai-redis-dev | redis:alpine | Redis (AI) | dev |
| qdrant-dev | qdrant:v1.7.3 | 向量資料庫 | dev |
| qdrant-prod | qdrant:v1.7.3 | 向量資料庫 | prod |
| daodao-ai-backend-dev | daodao-ai-backend | Python AI 後端 | dev |
| n8n | n8n:1.104.2 | 工作流自動化 | shared |
| nginx | nginx:latest | 反向代理 | shared |

## 容器資源使用

### 內存使用排行

| 排名 | 容器 | 內存使用 | 佔主機% | 備註 |
|------|------|---------|---------|------|
| 1 | prod_app | 297 MB | 15.1% | 🔴 最高 |
| 2 | n8n | 164 MB | 8.3% | |
| 3 | daodao-server-dev_app-1 | 142 MB | 7.2% | |
| 4 | daodao-ai-backend-dev | 85 MB | 4.3% | |
| 5 | feat_product | 71 MB | 3.6% | 已設 256MB 限制 |
| 6 | mongo_prod | 36 MB | 1.8% | |
| 7 | postgres-prod | 35 MB | 1.8% | |
| 8 | pg-dev | 31 MB | 1.6% | |
| 9 | mongo_dev | 30 MB | 1.5% | |
| 10 | postgres-dev | 16 MB | 0.8% | |
| 11 | feat_website | 12 MB | 0.6% | 已設 256MB 限制 |
| 12 | qdrant-dev | 10 MB | 0.5% | |
| 13 | nginx | 8 MB | 0.4% | |
| 14 | redis_prod | 4 MB | 0.2% | |
| 15 | qdrant-prod | 4 MB | 0.2% | |
| 16 | redis_dev | 2 MB | 0.1% | |
| 17 | daodao-ai-redis-dev | 2 MB | 0.1% | |

**容器總內存使用：約 1 GB**

### CPU 使用

| 容器 | CPU % |
|------|-------|
| postgres-prod | 6.89% |
| postgres-dev | 6.84% |
| pg-dev | 6.54% |
| feat_product | 2.86% |
| 其他 | < 1% |

### 磁碟 I/O（Block I/O）

高 I/O 容器：

| 容器 | 讀取 | 寫入 |
|------|------|------|
| n8n | 115 GB | 12.8 GB |
| redis_dev | 41.7 GB | 1.77 MB |
| postgres-prod | 44.3 GB | 34.6 GB |
| postgres-dev | 32.4 GB | 35.2 GB |
| redis_prod | 31.8 GB | 1.64 MB |

## 問題分析

### 1. 內存壓力過大

- 2GB 主機運行 16 個容器
- 已使用 1.2GB Swap，表示物理內存不足
- 可用內存僅 386 MB，存在 OOM 風險

### 2. 環境重複

同時運行 Production 和 Development 環境：

| 服務 | Prod | Dev |
|------|------|-----|
| Node.js App | ✅ | ✅ |
| PostgreSQL | ✅ | ✅ (x2) |
| MongoDB | ✅ | ✅ |
| Redis | ✅ | ✅ (x2) |
| Qdrant | ✅ | ✅ |

### 3. 測試容器未清理

`feat_product` 和 `feat_website` 為功能測試用，佔用約 85 MB。

## 優化建議

### 短期（立即可執行）

1. **停止未使用的 dev 容器**
   ```bash
   docker stop daodao-server-dev_app-1 pg-dev qdrant-dev \
     daodao-ai-redis-dev daodao-ai-backend-dev mongo_dev \
     postgres-dev redis_dev
   ```
   預估釋放：~300 MB

2. **移除測試容器**
   ```bash
   docker stop feat_product feat_website
   docker rm feat_product feat_website
   ```
   預估釋放：~85 MB

### 中期

1. **為 Node.js 應用設定內存限制**

   在 `docker-compose.yaml` 中加入：
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             memory: 512M
   ```

2. **考慮將 n8n 移至其他機器**
   - 單獨佔用 164 MB
   - 磁碟 I/O 極高（115 GB 讀取）

### 長期

1. **升級伺服器至 4GB 內存**
2. **分離 Prod/Dev 環境至不同機器**
3. **建立資源監控告警機制**

## 監控命令參考

```bash
# 即時監控容器資源
docker stats

# 單次快照
docker stats --no-stream

# 格式化輸出
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

# 查看主機資源
top -b -n 1 | head -20

# 查看內存詳情
free -h

# 查看磁碟使用
df -h
```
