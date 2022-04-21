# Daodao 前台

島島前台使用目前 React 流行的開發套件與設計風格，以下將會詳細介紹。

## 開發技術

<p float="left" margin="10px">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nextjs-logo.svg/1200px-Nextjs-logo.svg.png" height="100px"> 
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" height="100px"> 
  <img src="https://redux-saga.js.org/img/Redux-Saga-Logo.png" height="100px"> 
  <img src="https://mui.com/static/logo.png" height="100px"> 
  <img src="https://raw.githubusercontent.com/emotion-js/emotion/main/emotion.png" height="100px"> 
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" height="100px"> 
  <img src="https://i.imgur.com/A2XaNqc.png" height="100px"> 
</p>

## 主要技術列表

前端版本：React 18
前端框架：Next.js  
API server：Cloudflare worker  
狀態管理：Redux（Redux-saga）
Design System：mui（Material UI）
CSS-in-JS：[emotion](https://emotion.sh/docs/introduction)  
coding-style：[airbnb-eslint](https://github.com/airbnb/javascript)  
運行環境：Cloudflare  
資源管理：Notion

## 如何在 local 測試(SSR，非 SSG)

1. 安裝相依套件
   安裝 package.json 內的 dependencies 的套件

```bash
yarn
```

2. 執行網站
   組合技請參考 package.json 內的 scripts

```bash
yarn dev
```

3. 打開網頁

基本上會自動打開，沒有的話可自行前往 [http://localhost:5000](http://localhost:5000)
預設的 port 是 5000，當然你也可以修改指令使用其他 port

## 如何在 local 測試靜態檔(SSG)

1. 打包指令
   組合技包含打包與輸出，會放在 out 裡面

```bash
yarn build
```

2. 執行靜態檔

```bash
serve out
```

如果還沒安裝 serve，請先安裝：

```bash
npm install -g serve
```

## 開發須知

1. 進入點：page/\_app.jsx

- 非必要通常不會動這邊

2. 路徑即網址：page 下的路徑等於網址的路徑
3. 狀態管理：集中在 redux 裏面使用 action 與 reducer
4. 共享元件：需要被大量共享使用的元件，請放在 shared 內，如：Nav, Footer
5. 設計元件：盡可能多用 CSS-in-JS 設計元件（mui 可使用 sx 屬性）避免影響到其他元件的樣式

## Git Branch

dev - 開發分支：測試用的環境，模擬線上環境使用
prod - 線上分支：需要更新線上功能才需要推過去

## Git flow

多人協作的情況，更新流程基本上會是以下：

### 一般流程

先從 dev 拉下來更新，再上到 dev 測試（能開分支 merge 到 dev 更好）
feature(pull from dev) -> dev -> prod

比較嚴謹的走法
dev(create new branch from dev) -> feature -> feature(pull and merge) -> dev -> prod

### 緊急維修流程

多人同時開發時，需要走以下的 hotfix 流程：

1. 從線上拉下來更新內容，再推到 dev 進行測試
   hotfix(pull from prod) -> dev

2. 確認沒問題之後，再把**hotfix 分支**推到 prod
   請注意！不是從 dev 推到 prod，不然 commit 紀錄會混到某些 dev 的 feature
   feature(pull from prod) -> prod

## 如何切換 Node 版本

### local 自己切換

```
nvm use 16.7
```

無法切換則安裝

```
nvm install 16.7
```

## 筆記

### 關於 Next.js

1. 提升未來專案整體的開發與維護體驗，讓工程更專注在設計網頁而非處理其他雜項的相依設定
2. 可以選擇是否要產生靜態檔，或是選擇未來移到 Server 跑 Node 執行專案

### 關於 emotion

emotion 為近年討論度最高的 CSS 設計解決方案，除了部分撰寫方式如同 styled-components，此外也提供部分強大的功能提升開發體驗，例如：inline-style 可以 hot reload。
以往在開發 CSS 時，時常因為耦合性過高的關係而導致改 A 壞 B 以至於不好調整 CSS，因此需要導入一些額外的 CSS coding style 避免開發生的失誤。因此近年 CSS 模組化日益流行，尤其是可以設計模組元件的 styled-components 與 emotion 最具有代表性，也很適合搭配 React 的 component 設計。

## 關於 mui

[mui](https://mui.com/) 參考 Google 的 [Meterial Design](https://material-design.hexschool.io/guide/) 來做設計系統
目前官方最新版本（v5.0）原生使用 emotion 設計元件，可隨時切換使用 styled 或是 inline-style
每個元件可以是獨立的，也可以透過全站調色盤一次更改樣式（例如：dark mode 的開關）

### 關於 airbnb-eslint

透過 eslint 的強大檢測與縮排功能，開發者不需要再花額外的時間處理縮排與查看瑣碎的小失誤。

### 重新命名大小寫

Git 不會紀錄你更改大小寫的命名，記得使用：

```
git mv hello.txt Hello.txt
```

開發版本請使用 Node 16.14.0。
理論上在雲端放上 NODE_VERSION 就可以改版本，但是不知道為什麼只能用.node-version

## 會員登入 https 設定（Oauth2.0）

請注意！！一旦使用 gmail 註冊之後就無法使用其他供應商的登入方式了
Google 登入不用設定，Meta 強制登入使用 https，以下是 local 環境設定：

1. Install [Mkcert](https://github.com/FiloSottile/mkcert)

```
brew install mkcert
mkcert -install
```

2. 產生金鑰匙
   小心不要 push 到 GitHub

```
mkcert localhost
```

3. 執行 Server

```
node server.js
or
yarn dev-https
```

## 其他參考資源

[Next 範例](https://github.com/vercel/next.js/tree/canary/examples/api-routes-rest/pages)
[Notion API](https://developers.notion.com/docs/working-with-databases)
[How to Use Cloudflare Pages to Host & Deploy a Next.js App](https://spacejelly.dev/posts/how-to-use-cloudflare-pages-to-host-deploy-a-next-js-app/)
[Google Search Console 的「已檢索」、「已找到」是什麼意思？](https://editor.leonh.space/2022/google-search-console/)
