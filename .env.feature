# 功能分支環境配置模板
# 使用前請複製為 .env.feature 並替換 {branch} 為實際分支名
# 警告：不要將此文件提交到 Git！

# ============================================
# 基本配置
# ============================================
NODE_ENV=production

# ============================================
# 網站信息
# ============================================
# 替換 {branch} 為實際分支名稱，例如: update, new-feature
NEXT_PUBLIC_SITE_URL=https://feat-{branch}.daodao.so
NEXT_PUBLIC_SITE_NAME=島島阿學 (功能測試: {branch})
NEXT_PUBLIC_SITE_DESCRIPTION=島島阿學功能分支測試環境

# ============================================
# API 端點
# ============================================
# 功能分支通常使用測試環境後端
NEXT_PUBLIC_API_BASE_URL=https://server.daoedu.tw/api/v1
NEXT_PUBLIC_BACKEND_URL=https://server.daoedu.tw

# ============================================
# 功能開關
# ============================================
# 停用 Google Analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=false
# 停用 PWA
NEXT_PUBLIC_ENABLE_PWA=false
# 啟用調試模式
NEXT_PUBLIC_DEBUG_MODE=true

# ============================================
# 分支信息
# ============================================
# 替換 {branch} 為實際分支名稱
NEXT_PUBLIC_FEATURE_BRANCH={branch}

# ============================================
# 第三方服務（功能分支建議停用）
# ============================================
# Google Analytics ID (留空)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=

# Sentry DSN (留空)
NEXT_PUBLIC_SENTRY_DSN=

# ============================================
# 其他配置
# ============================================
# 禁用 Next.js 遙測
NEXT_TELEMETRY_DISABLED=1
