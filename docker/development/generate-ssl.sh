#!/bin/sh
# 生成自簽名 SSL 證書腳本（用於開發環境）
# 支援多個域名：app-feat.daodao.so 和 feat.daodao.so

# 創建 ssl 目錄
mkdir -p ssl

# 創建 openssl 配置文件
cat > ssl/openssl.conf <<EOF
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

# 生成私鑰和證書（支援多個域名）
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -config ssl/openssl.conf \
    -extensions v3_req

# 清理臨時配置文件
rm ssl/openssl.conf

echo "SSL 證書已生成在 ssl/ 目錄中"
echo "cert.pem: SSL 證書（支援 app-feat.daodao.so 和 feat.daodao.so）"
echo "key.pem: SSL 私鑰"
