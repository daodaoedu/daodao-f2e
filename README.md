# Daodao前台

## 如何啟動
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
預設的port是5000，當然你也可以修改指令使用其他port

## 開發技術
<p float="left" margin="10px">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nextjs-logo.svg/1200px-Nextjs-logo.svg.png" height="100px"> 
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" height="100px"> 
  <img src="https://raw.githubusercontent.com/emotion-js/emotion/main/emotion.png" height="100px"> 
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" height="100px"> 
  <img src="https://i.imgur.com/A2XaNqc.png" height="100px"> 
</p>

## 主要技術列表
前端library：React.js  
前端框架：Next.js  
CSS-in-JS：[emotion](https://emotion.sh/docs/introduction)  
coding-style：[airbnb-eslint](https://github.com/airbnb/javascript)  
database：Notion  

### 使用 Next.js 原因
1. 提升專案整體的開發體驗與時程，讓工程更專注在設計網頁而非處理其他雜項的相依設定。
2. 不需要設定額外複雜的設定
3. 搭配CSS-in-JS solution使開發體驗和使用者體驗更加分

### 使用 emotion 原因
emotion為近年討論度最高的CSS設計解決方案，除了部分撰寫方式如同styled-components，此外也提供部分強大的功能提升開發體驗，例如：inline-style 可以 hot reload。
以往在開發CSS時，時常因為耦合性過高的關係而改A壞B，因此需要導入一些CSS coding style，例如：OOCSS。因此近年CSS模組化日益流行，尤其是可以設計模組元件的styled-components與emotion最具有代表性，也很適合搭配React的component設計。

### 使用 airbnb-eslint 原因
透過eslint的強大檢測與縮排功能，開發者不需要再花額外的時間處理縮排與查看瑣碎的小失誤。

### 其他
目前暫時未使用Redux而選擇使用React原生的Context，也適合剛入門React的團隊夥伴協作開發，若未來有開發上的需求會考慮導入。

## 參考
[Next範例](https://github.com/vercel/next.js/tree/canary/examples/api-routes-rest/pages)
[Notion API](https://developers.notion.com/docs/working-with-databases)
