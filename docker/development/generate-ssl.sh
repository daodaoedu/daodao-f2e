#!/bin/sh
# 生成自簽名 SSL 證書腳本（用於開發環境）

# 創建 ssl 目錄
mkdir -p ssl

# 生成私鑰和證書
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=TW/ST=Taiwan/L=Taipei/O=Daodao/OU=Development/CN=localhost"

echo "SSL 證書已生成在 ssl/ 目錄中"
echo "cert.pem: SSL 證書"
echo "key.pem: SSL 私鑰"
