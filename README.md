# Daodao 前台

## 待執行

https://spacejelly.dev/posts/how-to-use-cloudflare-pages-to-host-deploy-a-next-js-app/

## 如何切換 Node 版本

### 安裝

```
nvm install 16.7
```

### 切換

```
nvm use 16.7
```

## 如何在 local 測試(SSR/ISR)

1. 安裝相依套件

```bash
yarn install
```

2. 執行網站

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

## 開發技術

<p float="left" margin="10px">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nextjs-logo.svg/1200px-Nextjs-logo.svg.png" height="100px"> 
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" height="100px"> 
  <img src="https://redux-saga.js.org/img/Redux-Saga-Logo.png" height="100px"> 
  <img src="https://raw.githubusercontent.com/emotion-js/emotion/main/emotion.png" height="100px"> 
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" height="100px"> 
  <img src="https://i.imgur.com/A2XaNqc.png" height="100px"> 
</p>

## 主要技術列表

前端 library：React.js  
前端框架：Next.js  
狀態管理：Redux-saga
CSS-in-JS：[emotion](https://emotion.sh/docs/introduction)  
coding-style：[airbnb-eslint](https://github.com/airbnb/javascript)  
database：Notion

### 使用 Next.js 原因

1. 提升專案整體的開發體驗與時程，讓工程更專注在設計網頁而非處理其他雜項的相依設定。
2. 不需要設定額外複雜的設定
3. 搭配 CSS-in-JS solution 使開發體驗和使用者體驗更加分

### 使用 emotion 原因

emotion 為近年討論度最高的 CSS 設計解決方案，除了部分撰寫方式如同 styled-components，此外也提供部分強大的功能提升開發體驗，例如：inline-style 可以 hot reload。
以往在開發 CSS 時，時常因為耦合性過高的關係而改 A 壞 B，因此需要導入一些 CSS coding style，例如：OOCSS。因此近年 CSS 模組化日益流行，尤其是可以設計模組元件的 styled-components 與 emotion 最具有代表性，也很適合搭配 React 的 component 設計。

### 使用 airbnb-eslint 原因

透過 eslint 的強大檢測與縮排功能，開發者不需要再花額外的時間處理縮排與查看瑣碎的小失誤。

## 開發須知

1. 進入點：page/\_app.jsx

- 非必要通常不會動這邊

2. 路徑即網址：page 下的路徑等於網址的路徑
3. 狀態管理：集中在 redux 裏面使用 action 與 reducer
4. 共享元件：有大量共享的元件請放在 shared 內，如：Nav, Footer
5. 設計元件：盡可能多用 CSS-in-JS 設計元件避免影響到其他元件的樣式

## 參考

[Next 範例](https://github.com/vercel/next.js/tree/canary/examples/api-routes-rest/pages)
[Notion API](https://developers.notion.com/docs/working-with-databases)
