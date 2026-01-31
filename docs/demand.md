# 島島前端遷移至 Linode 部署需求

## 需求背景

目前島島專案的部署架構為：
- **前端 (daodao-f2e)**：部署於 Cloudflare Workers
- **後端 + 資料庫**：部署於 Linode VPS

希望將前端遷移至 Linode VPS，實現統一平台部署。

---

## 專案資訊

### 前端技術棧
- **框架**：Next.js 15 + React 19
- **語言**：TypeScript 5.7
- **樣式**：Tailwind CSS + shadcn/ui
- **包管理**：pnpm 10.15.0
- **Node 版本**：20.19.4

### 當前部署方式
- 使用 `@opennextjs/cloudflare` 打包
- 透過 GitHub Actions 自動部署至 Cloudflare Workers
- CI/CD 流程：TypeScript 檢查 → ESLint → 建置 → 部署
- 支援 prod/dev/preview 三個環境

### 專案位置
- 前端專案：`/Users/xiaoxu/Projects/daodao/daodao-f2e`
- 後端 API：已部署於 Linode VPS (Port 8080)

---

## 遷移目標

### 主要目標
1. ✅ 將前端從 Cloudflare Workers 遷移至 Linode VPS
2. ✅ 實現前後端同平台部署
3. ✅ 保持現有 CI/CD 流程
4. ✅ 確保服務穩定性與效能

### 預期效益
- **簡化架構**：前後端統一管理
- **降低延遲**：前後端內網通訊
- **成本優化**：減少多平台維護成本
- **功能完整**：支援 Next.js 完整功能 (包括 ISR)

---

## 核心挑戰

1. **技術調整**：從 Cloudflare Worker 環境轉換至 Node.js Server
2. **CI/CD 改造**：修改 GitHub Actions 部署流程
3. **DNS 切換**：平順遷移，避免服務中斷
4. **效能維持**：確保遷移後效能不下降

---

## 遷移方案

採用 **Node.js Server 模式**（推薦方案）：
- 使用 Next.js standalone 輸出模式
- PM2 管理 Node.js 進程
- Nginx 作為反向代理 + SSL 終端
- GitHub Actions SSH 部署

詳細方案請參考：[migration-plan.md](./migration-plan.md)

---

## 部署架構

### 當前架構（Cloudflare）
```
使用者 → Cloudflare Workers → Linode VPS (API + DB)
```

### 目標架構（Linode）
```
使用者 → Linode VPS
           ├── Nginx (反向代理 + SSL)
           ├── Next.js Server (PM2)
           ├── Backend API
           └── Database
```

### 優化架構（建議）
```
使用者 → Cloudflare CDN → Linode VPS (Origin)
           ├── Nginx (反向代理 + SSL)
           ├── Next.js Server (PM2)
           ├── Backend API
           └── Database
```

---

## 執行計畫

### 階段一：環境準備
- [ ] VPS 資源檢查與評估
- [ ] 安裝 Node.js, pnpm, PM2, Nginx
- [ ] 設定 SSL 憑證

### 階段二：專案配置
- [ ] 修改 `next.config.js` (啟用 standalone 模式)
- [ ] 建立 PM2 配置檔
- [ ] 設定環境變數

### 階段三：部署設定
- [ ] 配置 Nginx 反向代理
- [ ] 建立部署腳本
- [ ] 設定 GitHub Actions 工作流

### 階段四：測試驗證
- [ ] 使用 hosts 檔案模擬切換
- [ ] 功能測試
- [ ] 效能測試

### 階段五：正式遷移
- [ ] 降低 DNS TTL
- [ ] DNS 切換
- [ ] 監控與驗證

### 階段六：優化監控
- [ ] 設定監控告警
- [ ] 效能優化
- [ ] 備份策略

---

## 風險管理

### 主要風險
1. **服務中斷**：DNS 切換期間可能短暫無法存取
2. **效能下降**：缺少全球 CDN 加速
3. **建置失敗**：環境差異導致建置錯誤

### 應對措施
1. **回滾機制**：保留 Cloudflare 部署至少 7 天
2. **監控告警**：即時監控系統狀態
3. **分階段執行**：充分測試後再正式切換
4. **混合架構**：考慮 Cloudflare CDN + Linode Origin

---

## 相關文件

- [詳細遷移規劃](./migration-plan.md) - 完整的步驟、配置與範例
- [專案 README](../../daodao-f2e/README.md) - 前端專案文件
- [專案開發指南](../../daodao-f2e/CLAUDE.md) - 架構與開發規範

---

## 時間規劃建議

- **準備階段**：2-3 天（環境設定與測試）
- **遷移執行**：1-2 小時（選擇低流量時段）
- **穩定觀察**：24-48 小時（監控與優化）

---

## 聯絡資訊

如有任何問題或建議，請聯絡技術團隊。

---

**文件版本**：v1.0
**建立日期**：2025-12-23
**更新日期**：2025-12-23
