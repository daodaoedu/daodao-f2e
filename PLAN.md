# Admin 管理介面規劃

## 一、後端 API 盤點

根據 `packages/api/src/types.ts` 自動生成的 OpenAPI 類型，後端已提供以下管理相關 API：

### 1. 使用者統計 (Admin User Stats)
| API 路徑 | 方法 | 說明 |
|---|---|---|
| `/api/v1/admin/user-stats/overview` | GET | 總覽儀表板：總使用者數、本月新增、增長率、活躍使用者數、活躍率 |
| `/api/v1/admin/user-stats/registrations` | GET | 註冊統計：支援按 day/week/month/year/location/role/education_stage 分組，可篩選日期、地區、角色、教育階段 |
| `/api/v1/admin/user-stats/activity` | GET | 活躍度統計：活躍/非活躍使用者數、活躍率，可按 role/location/education_stage 分組 |
| `/api/v1/admin/user-stats/active-users` | GET | DAU/WAU/MAU 統計：日活/週活/月活及趨勢變化 |
| `/api/v1/admin/user-stats/device-analytics` | GET | 裝置分析：裝置類型、瀏覽器、作業系統分佈統計 |
| `/api/v1/admin/user-stats/retention` | GET | 用戶留存率：群組分析（cohort analysis），追蹤 day1/day7/day14/day30 留存 |
| `/api/v1/admin/user-stats/popular-profiles` | GET | 熱門檔案排行：瀏覽次數最多的用戶檔案 |
| `/api/v1/admin/user-stats/segmentation` | GET | 用戶活躍度分類：highly_active/active/moderate/inactive/dormant 五個等級 |
| `/api/v1/admin/user-stats/export` | GET | 匯出統計資料：支援 CSV/Excel 格式，可匯出 registrations/activity/full |

### 2. 角色與權限管理 (RBAC)
| API 路徑 | 方法 | 說明 |
|---|---|---|
| `/api/v1/admin/roles` | GET | 獲取所有角色列表 |
| `/api/v1/admin/roles` | POST | 創建角色（需超級管理員） |
| `/api/v1/admin/roles/{id}` | GET | 獲取單一角色（含權限） |
| `/api/v1/admin/roles/{id}` | PUT | 更新角色（需超級管理員） |
| `/api/v1/admin/roles/{id}` | DELETE | 刪除角色（需超級管理員） |
| `/api/v1/admin/permissions` | GET | 獲取所有權限列表 |
| `/api/v1/admin/permissions` | POST | 創建權限（格式：resource:action） |
| `/api/v1/admin/permissions/{id}` | GET/PUT/DELETE | 權限 CRUD |
| `/api/v1/admin/roles/{roleId}/permissions` | POST | 為角色新增權限 |
| `/api/v1/admin/roles/{roleId}/permissions/{permissionId}` | DELETE | 移除角色權限 |
| `/api/v1/admin/users/{userId}/role` | GET | 獲取用戶角色 |
| `/api/v1/admin/users/{userId}/role` | PUT | 更新用戶角色（需超級管理員） |

### 3. 郵件服務 (Email)
| API 路徑 | 方法 | 說明 |
|---|---|---|
| `/api/v1/email/stats` | GET | 郵件發送統計：總發送數、失敗數、成功率、按模板分類統計 |
| `/api/v1/email/health` | GET | 郵件服務健康狀態：SMTP 連線、佇列大小、錯誤訊息 |
| `/api/v1/email/verification` | POST | 發送驗證郵件 |
| `/api/v1/email/welcome` | POST | 發送歡迎郵件（需管理員） |
| `/api/v1/email/marathon` | POST | 發送馬拉松活動郵件（需管理員） |
| `/api/v1/email/custom` | POST | 發送自定義郵件（需管理員） |
| `/api/v1/email/bulk` | POST | 批量發送郵件，最多100人（需管理員） |
| `/api/v1/email/preview` | POST | 預覽郵件模板 |
| `/api/v1/email/validate` | POST | 驗證郵件地址格式 |

### 4. 主題實踐 (Practices) — 可用於管理檢視
| API 路徑 | 方法 | 說明 |
|---|---|---|
| `/api/v1/practices` | GET | 取得實踐列表（分頁、搜尋、篩選 status: draft/not_started/active/completed/archived/all） |
| `/api/v1/practices/stats` | GET | 取得實踐統計（可指定 userId） |
| `/api/v1/practices/user/{userId}` | GET | 取得指定用戶的實踐列表 |

### 5. 系統監控
| API 路徑 | 方法 | 說明 |
|---|---|---|
| `/api/v1/monitor` | GET | 系統資源：CPU、記憶體、磁碟、PostgreSQL 連線數/DB 大小/表格資訊 |
| `/api/v1/db-info` | GET | 資料庫資訊：PostgreSQL 欄位/索引/約束、Redis 狀態 |
| `/api/v1/health` | GET | API 健康檢查 |

---

## 二、Admin 介面頁面規劃

### 路由結構

在 product app 新增 admin 路由群組 `(admin)`，使用獨立的 admin layout（側邊導航列）：

```
apps/product/src/app/[locale]/(admin)/
├── layout.tsx                          # Admin 專用 layout（側邊導航 + 頂部列）
├── admin/
│   ├── page.tsx                        # 總覽儀表板 (/admin)
│   ├── users/
│   │   ├── page.tsx                    # 使用者統計 (/admin/users)
│   │   └── [userId]/
│   │       └── page.tsx                # 使用者詳情 (/admin/users/[userId])
│   ├── practices/
│   │   └── page.tsx                    # 主題實踐管理 (/admin/practices)
│   ├── email/
│   │   └── page.tsx                    # 郵件管理 (/admin/email)
│   ├── roles/
│   │   └── page.tsx                    # 角色權限管理 (/admin/roles)
│   └── system/
│       └── page.tsx                    # 系統監控 (/admin/system)
```

### API Service 層

在 `packages/api/src/services/` 新增：

```
packages/api/src/services/
├── admin.ts                            # Admin API 服務函式
├── admin-hooks.ts                      # Admin SWR hooks
├── email.ts                            # Email API 服務函式（目前不存在）
└── email-hooks.ts                      # Email SWR hooks
```

---

## 三、各頁面詳細規劃

### 頁面 1：總覽儀表板 (`/admin`)

**對應 API：**
- `GET /api/v1/admin/user-stats/overview`
- `GET /api/v1/admin/user-stats/active-users`
- `GET /api/v1/email/stats`
- `GET /api/v1/email/health`

**UI 元件：**
- **KPI 卡片列**（4 張卡片）：
  - 總使用者數 + 本月增長率（↑↓ 箭頭）
  - 本月新增使用者數（對比上月）
  - 活躍使用者數 + 活躍率
  - 郵件發送成功率
- **DAU/WAU/MAU 趨勢圖**：折線圖顯示日活/週活/月活及各自趨勢
- **郵件服務健康狀態**：狀態指示燈 (healthy/degraded/unhealthy)、SMTP 連線、佇列大小
- **快速連結**：跳轉到各子頁面

---

### 頁面 2：使用者統計 (`/admin/users`)

**對應 API：**
- `GET /api/v1/admin/user-stats/registrations`
- `GET /api/v1/admin/user-stats/activity`
- `GET /api/v1/admin/user-stats/retention`
- `GET /api/v1/admin/user-stats/device-analytics`
- `GET /api/v1/admin/user-stats/segmentation`
- `GET /api/v1/admin/user-stats/popular-profiles`
- `GET /api/v1/admin/user-stats/export`

**UI 元件：**

#### 2a. 註冊統計 Tab
- **日期範圍選擇器**：startDate / endDate
- **分組切換**：day / week / month / year / location / role / education_stage
- **註冊趨勢圖**：長條圖/折線圖，X 軸為時間或分類，Y 軸為註冊數
- **篩選條件**：地區 ID、角色 ID、教育階段下拉選單

#### 2b. 活躍度分析 Tab
- **活躍度環形圖**：活躍 vs 非活躍使用者比例
- **分組分析表格**：按 role/location/education_stage 的活躍度細分

#### 2c. 留存率 Tab
- **留存率熱力圖**（Cohort Table）：橫軸為 Day 0 ~ Day 30，縱軸為各 cohort 群組日期
- **平均留存指標**：Day 1 / Day 7 / Day 14 / Day 30 的平均留存率卡片
- **參數控制**：群組數量、追蹤天數、粒度（day/week）

#### 2d. 裝置分析 Tab
- **裝置類型圓餅圖**：Desktop / Mobile / Tablet 佔比
- **瀏覽器分佈長條圖**：Chrome / Safari / Firefox 等
- **作業系統分佈長條圖**：Windows / macOS / iOS / Android 等

#### 2e. 用戶分群 Tab
- **活躍度分群圓餅圖**：highly_active / active / moderate / inactive / dormant 各自人數與佔比
- **分群描述卡片**：每個等級的 displayName、description、criteria

#### 2f. 熱門檔案排行 Tab
- **排行表格**：頭像、暱稱、瀏覽次數、最後活躍時間
- **篩選**：最低瀏覽次數

#### 匯出功能
- **匯出按鈕**：支援 CSV / Excel 格式
- **匯出類型**：registrations / activity / full

---

### 頁面 3：使用者詳情 (`/admin/users/[userId]`)

**對應 API：**
- `GET /api/v1/admin/users/{userId}/role`
- `PUT /api/v1/admin/users/{userId}/role`
- `GET /api/v1/practices/user/{userId}`
- `GET /api/v1/practices/stats?userId={userId}`

**UI 元件：**
- **使用者資訊卡片**：頭像、暱稱、email、註冊時間
- **角色管理**：當前角色顯示 + 修改角色下拉選單
- **該用戶的實踐統計**：總實踐數、活躍數、完成數、總簽到次數、平均連續天數、最大連續天數
- **該用戶的實踐列表**：表格顯示，支援分頁和狀態篩選

---

### 頁面 4：主題實踐管理 (`/admin/practices`)

**對應 API：**
- `GET /api/v1/practices` (帶管理篩選)
- `GET /api/v1/practices/stats`

**UI 元件：**
- **全站實踐統計卡片**：總實踐數、活躍數、完成數、總簽到次數
- **實踐列表表格**：
  - 欄位：標題、創建者、狀態、開始日期、持續天數、簽到數、按讚數
  - 篩選：狀態（draft/not_started/active/completed/archived/all）
  - 搜尋：關鍵字搜尋
  - 排序：createdAt / updatedAt / likeCount
  - 分頁

---

### 頁面 5：郵件管理 (`/admin/email`)

**對應 API：**
- `GET /api/v1/email/stats`
- `GET /api/v1/email/health`
- `POST /api/v1/email/custom`
- `POST /api/v1/email/bulk`
- `POST /api/v1/email/preview`
- `POST /api/v1/email/validate`

**UI 元件：**

#### 5a. 郵件統計 Tab
- **KPI 卡片**：總發送數、總失敗數、成功率
- **按模板分類長條圖**：welcome / verification / password-reset 等各模板發送數量
- **日期範圍篩選**

#### 5b. 服務健康 Tab
- **服務狀態指示**：healthy (綠) / degraded (黃) / unhealthy (紅)
- **SMTP 連線狀態**
- **佇列大小**
- **最後錯誤訊息**

#### 5c. 發送郵件 Tab
- **郵件類型選擇**：驗證 / 歡迎 / 馬拉松 / 自定義
- **收件人輸入**（支援驗證地址格式）
- **模板預覽**：即時預覽郵件內容
- **批量發送**：上傳收件人列表（最多 100 人）

---

### 頁面 6：角色權限管理 (`/admin/roles`)

**對應 API：**
- `GET/POST /api/v1/admin/roles`
- `GET/PUT/DELETE /api/v1/admin/roles/{id}`
- `GET/POST /api/v1/admin/permissions`
- `GET/PUT/DELETE /api/v1/admin/permissions/{id}`
- `POST /api/v1/admin/roles/{roleId}/permissions`
- `DELETE /api/v1/admin/roles/{roleId}/permissions/{permissionId}`

**UI 元件：**

#### 6a. 角色管理 Tab
- **角色列表表格**：名稱、描述、權限數量、創建時間
- **新增角色 Dialog**：名稱、描述
- **編輯角色 Dialog**：修改名稱、描述
- **角色詳情展開**：顯示該角色的所有權限，可新增/移除
- **刪除角色**：確認 Dialog（有用戶使用時無法刪除）

#### 6b. 權限管理 Tab
- **權限列表表格**：名稱（resource:action 格式）、描述、創建時間
- **新增權限 Dialog**：resource 選擇 + action 選擇
- **編輯/刪除權限**

---

### 頁面 7：系統監控 (`/admin/system`)

**對應 API：**
- `GET /api/v1/monitor`
- `GET /api/v1/db-info`
- `GET /api/v1/health`

**UI 元件：**
- **系統資訊卡片**：主機名、平台、架構、uptime
- **CPU 負載圖**：loadAverage 視覺化
- **記憶體使用量**：進度條顯示 used/total
- **磁碟使用量**：各磁碟分割的使用率進度條
- **PostgreSQL 狀態**：版本、連線數、資料庫大小、各表格大小/行數
- **Redis 狀態**：版本、uptime、連線數、記憶體使用、命令處理數

---

## 四、實作步驟

### Phase 1：基礎架構
1. 建立 admin 路由群組和 layout
2. 建立 admin 側邊導航元件
3. 建立 admin API service (`packages/api/src/services/admin.ts`)
4. 建立 admin SWR hooks (`packages/api/src/services/admin-hooks.ts`)
5. 建立 email API service 和 hooks
6. 在 AuthProvider 中加入 admin 路由保護（需管理員權限才能進入）

### Phase 2：總覽儀表板
7. 實作 KPI 卡片元件（可複用）
8. 實作總覽儀表板頁面
9. 整合 DAU/WAU/MAU 圖表（使用 recharts 或類似圖表庫）

### Phase 3：使用者統計
10. 實作註冊統計圖表
11. 實作活躍度分析
12. 實作留存率熱力圖
13. 實作裝置分析圖表
14. 實作用戶分群視覺化
15. 實作熱門檔案排行
16. 實作匯出功能

### Phase 4：主題實踐管理
17. 實作全站實踐統計
18. 實作實踐列表表格（含篩選/搜尋/分頁）

### Phase 5：郵件管理
19. 實作郵件統計頁面
20. 實作服務健康監控
21. 實作發送郵件功能

### Phase 6：角色權限管理
22. 實作角色 CRUD
23. 實作權限 CRUD
24. 實作角色-權限關聯管理
25. 實作用戶角色指派

### Phase 7：系統監控
26. 實作系統資源視覺化
27. 實作資料庫資訊顯示

---

## 五、技術選型建議

| 需求 | 建議 |
|---|---|
| 圖表庫 | `recharts`（React 生態系主流，支援 SSR） |
| 表格 | `@tanstack/react-table` 或直接使用 shadcn/ui Table |
| 日期選擇器 | shadcn/ui DatePicker（已有 shadcn/ui 套件） |
| 匯出 | 直接使用後端 `/export` API 下載 CSV/Excel |
| 狀態管理 | SWR hooks（與現有架構一致） |
| 權限檢查 | 在 admin layout 層級統一檢查，403 時導回首頁 |

---

## 六、權限保護策略

1. **Admin Layout 層級**：在 `(admin)/layout.tsx` 中呼叫 `getCurrentUser()` 確認角色是否為 admin
2. **路由保護**：在 `AuthProvider` 的 `publicPattern` 中不包含 `/admin`，確保所有 admin 路由需登入
3. **API 層**：後端已對所有 admin API 做 401/403 檢查，前端不需重複驗證，但需處理錯誤回應
4. **超級管理員操作**：如角色/權限 CRUD、用戶角色指派等，前端可根據用戶權限隱藏/禁用操作按鈕
