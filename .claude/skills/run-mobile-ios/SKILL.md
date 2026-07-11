---
name: run-mobile-ios
description: 在 iOS 模擬器上跑 apps/mobile（Expo）。涵蓋 prebuild 過期、code signing、模擬器選錯、Metro 舊 bundle、i18n key 對不到等已知陷阱與除錯法
---

# 跑 apps/mobile 到 iOS 模擬器

## 快路徑

Pods 已 cache 且 code signing 設定過的話，只要：

```bash
cd apps/mobile && npx expo run:ios
```

不要加 `--device`。這個 flag 一律走實機簽章流程，跟 UDID 是不是模擬器無關。

驗證 app 真的起來（`Build Succeeded` 只代表編譯完成，不代表畫面有東西）：

```bash
# 找出 app 裝在哪台模擬器
for U in $(xcrun simctl list devices booted | grep -oE '[0-9A-F-]{36}'); do
  xcrun simctl get_app_container "$U" com.daodao.app >/dev/null 2>&1 && echo "installed on $U"
done

xcrun simctl launch <UDID> com.daodao.app
xcrun simctl io <UDID> screenshot /tmp/app.png   # 然後真的去看這張圖
```

## 陷阱一：ios/ 是 gitignored 的 prebuild 產物，會過期

`apps/mobile/.gitignore` 排除了 `/ios`，git 追蹤 0 個檔案。它由 `app.config.ts` 生成，**不會自動跟著 config 更新**。

症狀是 `pod install` 失敗：

```
The Swift pod `FirebaseCoreInternal` depends upon `GoogleUtilities`,
which does not define modules.
```

`app.config.ts` 裡的 `expo-build-properties` → `extraPods` 早就設好 `GoogleUtilities: modular_headers: true`，但那筆設定要透過 prebuild 才會寫進 `ios/Podfile.properties.json` 的 `apple.extraPods` 鍵。舊的 ios/ 沒有這個鍵。

診斷與修復：

```bash
grep apple.extraPods apps/mobile/ios/Podfile.properties.json   # 沒有 → 過期
cd apps/mobile && npx expo prebuild -p ios --clean
```

`--clean` 會整個刪掉重建 ios/。因為是純生成物（`AppDelegate.swift`、`Info.plist`、`SplashScreen.storyboard` 等，無手寫 native code），不影響 repo。若哪天有人在 ios/ 裡手改了東西，那些改動本來就已經在 gitignore 之外，重建前先確認。

同一個原因也會讓 `app.config.ts` 的 `scheme: "daodao"` 沒進 `ios/DaoDao/Info.plist`，啟動時出現：

> Could not find a shared URI scheme for the dev client

看到這個 warning 就是該重跑 prebuild 了。

## 陷阱二：模擬器 build 也需要 code signing

錯誤訊息會誤導你以為是實機問題：

```
Your computer requires some additional setup before you can build onto physical iOS devices.
CommandError: No code signing certificates are available to use.
```

實際上 Expo CLI（`@expo/cli/build/src/run/ios/XcodeBuild.js`）有這道 gate：

```js
if (!props.isSimulator || simulatorBuildRequiresCodeSigning(projectRoot)) {
```

`simulatorBuildRequiresCodeSigning()` 讀 entitlements，只要含 `com.apple.developer.applesignin` 或 `com.apple.developer.associated-domains` 就強制要求開發簽章。本專案的 `expo-apple-authentication` plugin 帶來前者，寫在 `ios/DaoDao/DaoDao.entitlements`。

所以換模擬器、換 UDID、拿掉 flag 都沒用。必須有 `Apple Development` 憑證。

## 陷阱三：有憑證但 Expo 看不到（WWDR G3）

Expo 用這個正則過濾憑證（`codeSigning/Security.js`）：

```
/^\s*\d+\).+"(.+Develop(ment|er).+)"$/
```

`Develop` 前面必須至少有一個字元，所以 `"Developer ID Application: ..."`（macOS 分發用）**不符合**，只有 `"Apple Development: ..."` 才算數。

檢查：

```bash
security find-identity -v -p codesigning    # 要看到 "Apple Development:" 開頭那行
```

若 `security find-identity -p codesigning`（不加 `-v`）看得到、加了 `-v` 卻消失，代表憑證存在但被判定 invalid。多半是缺 WWDR G3 中繼憑證 —— 舊的 G1 在 2023-02-07 過期，而 Apple Development 憑證的 issuer 是 `OU=G3`：

```bash
security find-certificate -c "Apple Development" -p | openssl x509 -noout -issuer
security find-certificate -a -c "Worldwide Developer Relations" -p | openssl x509 -noout -subject -dates

curl -fsSL -o /tmp/AppleWWDRCAG3.cer https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer
security import /tmp/AppleWWDRCAG3.cer -k ~/Library/Keychains/login.keychain-db
```

匯入會改動使用者 keychain，動手前先問過使用者。

憑證本身怎麼生：Xcode > Settings > Accounts > 選 Apple ID > Manage Certificates… > **+** > Apple Development（免費帳號即可）。

## 陷阱四：同名模擬器

這台 Mac 上有兩台都叫 `iPhone 15 Pro` 的模擬器（iOS 17.5 與 18.3）。`--device "iPhone 15 Pro"` 會解析錯，Expo 也可能把其中一台誤判成實機。用 UDID，或先確認 app 裝到哪台：

```bash
xcrun simctl list devices available | grep 'iPhone 15 Pro'
xcrun devicectl list devices        # 確認真的沒有實機連著
```

## 驗證 JS 改動：Metro 可能 serve 舊 bundle

改了 JS/TS 後想在模擬器上確認效果時，Metro 的 file watcher 偶爾會漏接變更、繼續 serve 舊 bundle，讓你誤以為改動沒生效（native binary 沒變、只需重打包 JS，但打包出來的是 stale 的）。

**別假設重啟 app 就會載到新 code。先確認 bundle 真的含你的改動再測：**

```bash
# 1) 用一段你剛加的獨特字串，直接查 Metro 打包出來的 bundle
curl -s "http://localhost:8081/.expo/.virtual-metro-entry.bundle?platform=ios&dev=true" \
  -o /tmp/b.js --max-time 400
grep -c "你剛加的獨特字串" /tmp/b.js     # 0 = Metro 還是舊的

# 2) 若是 0，清 cache 重啟 Metro（app 不用重 build）
lsof -ti:8081 | xargs -r kill -9
cd apps/mobile && npx expo start --clear    # 背景跑
#    再重跑步驟 1 確認變成 1，才 terminate + launch app 截圖驗證
```

打包入口是 `/.expo/.virtual-metro-entry.bundle`（不是 Metro 預設的 `/index.bundle`——那條在這專案是 404，入口走 `expo-router/entry`）。

## 除錯：畫面顯示 translation key 原文（i18n 沒生效）

看到畫面印出像 `practice.status_in_progress` 這種「namespace.key」原始字串，不是 i18n 系統壞掉——是 **key 對不到**。`i18n/index.tsx` 的 `t()` 查不到就原樣回傳 key：

```ts
const message = readMessage(messages, key) ?? readMessage(fallbackMessages, key) ?? key;
```

排查步驟（key 在 `packages/i18n/src/locales/{zh-TW,en}.json`）：

```bash
# 1) 找渲染處，確認 namespace（useMobileTranslation("X") + t("Y") → 實際查 X.Y）
grep -rn 'useMobileTranslation\|t("' apps/mobile/app/<畫面>.tsx

# 2) 用 node 確認 key 實際住在哪個 namespace
node -e '
const z=require("./packages/i18n/src/locales/zh-TW.json");
const hits=[];(function w(o,p){for(const k in o){const n=p?p+"."+k:k;
  if(k==="你的key") hits.push(n); if(o[k]&&typeof o[k]==="object") w(o[k],n);}})(z,"");
console.log(hits);'
```

常見成因是 **namespace 漂移**：某支畫面 refactor 後用錯 namespace（例如 status 標籤住在 `mobile.practiceCard`，卻用綁 `practice` 的 `t`）。修法優先**在畫面端補一個對的 translator**（`const statusT = useMobileTranslation("mobile.practiceCard")`），不要去共用的 `packages/i18n` 加重複 key——那會波及 web app、blast radius 大。改完掃一遍同類畫面確認沒有同樣的漂移。

## 環境變數

`apps/mobile/.env.development` 提供 `EXPO_PUBLIC_API_URL`、`EXPO_PUBLIC_AI_API_URL`，Expo 自動載入，不需另外設定。

## 不需要 native build 時

`pnpm --filter @daodao/mobile dev:web` 跳過整條 native 路徑。但 Firebase 與其他 native module 的行為會和真機不同，只適合純 UI 驗證。
