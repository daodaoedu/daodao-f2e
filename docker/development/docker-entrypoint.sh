#!/bin/sh
# Nginx Docker Entrypoint Script
# 自動生成 SSL 證書（如果不存在）

SSL_DIR="/etc/nginx/ssl"
CERT_FILE="${SSL_DIR}/cert.pem"
KEY_FILE="${SSL_DIR}/key.pem"

# 檢查 openssl 是否可用
if ! command -v openssl >/dev/null 2>&1; then
    echo "警告：openssl 未安裝，嘗試安裝..."
    apk add --no-cache openssl >/dev/null 2>&1 || {
        echo "錯誤：無法安裝 openssl，請手動生成 SSL 證書"
        exit 1
    }
fi

# 如果證書不存在，自動生成
if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    echo "SSL 證書不存在，正在生成自簽名證書..."
    mkdir -p "$SSL_DIR"
    
    # 生成自簽名證書
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -subj "/C=TW/ST=Taiwan/L=Taipei/O=Daodao/OU=Development/CN=localhost" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "SSL 證書已成功生成"
        chmod 644 "$CERT_FILE"
        chmod 600 "$KEY_FILE"
    else
        echo "錯誤：無法生成 SSL 證書"
        exit 1
    fi
else
    echo "SSL 證書已存在，跳過生成"
fi

# 執行原始的 nginx 啟動命令
exec "$@"
