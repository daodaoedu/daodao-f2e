# 島島阿學 燈塔 v2 — 導師 Landing Page Prototype

對象：陪跑營導師／教練（新客群）的 Landing Page 原型。

- 來源：Claude Artifact「島島阿學 燈塔 v2」（2026-11-04 版），原樣搬入，未修改
- 結構：單一 `index.html`（內嵌 CSS／JS）+ `assets/` 4 個 SVG
- 頁面：以 hash 切換 `#home`（首頁＋解決方案、試用申請表單、FAQ）與 `#tutorial`（使用教學）
- 表單尚未串接，送出只顯示提示訊息

## 本地預覽

```bash
cd docs/prototypes/lighthouse-v2 && python3 -m http.server 8899
# 開 http://localhost:8899/
```

## 後續

正式實作時依 `.claude/skills/implement-from-prototype/SKILL.md`，從渲染結果萃取數值轉成 `apps/website` 的 React + Tailwind 頁面。
