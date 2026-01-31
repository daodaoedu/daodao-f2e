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
    echo "SSL 證書不存在，正在生成自簽名證書（支援多個域名）..."
    mkdir -p "$SSL_DIR"
    
    # 創建 openssl 配置文件
    OPENSSL_CONF="${SSL_DIR}/openssl.conf"
    cat > "$OPENSSL_CONF" <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = TW
ST = Taiwan
L = Taipei
O = Daodao
OU = Development
CN = app-feat.daodao.so

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = app-feat.daodao.so
DNS.2 = feat.daodao.so
DNS.3 = localhost
EOF
    
    # 生成自簽名證書（支援多個域名）
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -config "$OPENSSL_CONF" \
        -extensions v3_req 2>/dev/null
    
    # 清理臨時配置文件
    rm -f "$OPENSSL_CONF"
    
    if [ $? -eq 0 ]; then
        echo "SSL 證書已成功生成（支援 app-feat.daodao.so 和 feat.daodao.so）"
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
