# Navigation 組件

這個目錄包含了首頁的導航組件，所有組件都實現了捲動監聽功能，只有在捲動到指定深度時才會顯示。

## 組件說明

### Navbar.tsx
- **捲動閾值**: 200px
- **功能**: 當用戶捲動超過 200px 時，導航欄會從頂部滑入
- **動畫**: 使用 CSS 動畫實現滑入滑出效果
- **樣式**: 半透明背景 + backdrop-filter 模糊效果

### MobileMenu.tsx
- **捲動閾值**: 250px
- **功能**: 當用戶捲動超過 250px 時，移動端導航菜單會從底部滑入
- **響應式規則**: 
  - 手機寬度 (≤768px): 永遠顯示（符合捲動條件時）
  - 平板寬度以上 (>768px): 完全隱藏
- **動畫**: 使用 Tailwind CSS 的 slide-in 動畫
- **位置**: 固定在底部

### FloatButtons.tsx
- **捲動閾值**: 300px
- **功能**: 當用戶捲動超過 300px 時，浮動按鈕組會顯示
- **包含**: 回到頂端按鈕 + 心理測驗徽章
- **位置**: 固定在右下角

## 技術實現

### useScrollVisibility Hook
```typescript
const isVisible = useScrollVisibility({ 
  threshold: 200,    // 捲動閾值 (px)
  debounceMs: 16     // 防抖延遲 (ms)
});
```

### 響應式檢測 Hook
```typescript
// MobileMenu 專用的響應式檢測
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  return isMobile;
}
```

### 動畫效果
- **Navbar**: 從頂部滑入 (`translateY(-100%)` → `translateY(0)`)
- **MobileMenu**: 從底部滑入 (`slide-in-from-bottom-4`)
- **FloatButtons**: 條件渲染 (`isVisible ? <Component /> : null`)

## 使用方式

```tsx
import { Navbar, MobileMenu, FloatButtons } from './_home/Navigation';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <MobileMenu />
      <FloatButtons />
      {/* 其他內容 */}
    </>
  );
}
```

## 自定義配置

每個組件都可以通過修改 `useScrollVisibility` 的參數來自定義：

```typescript
// 在組件中修改
const isVisible = useScrollVisibility({ 
  threshold: 150,     // 更早顯示
  debounceMs: 32      // 更平滑的捲動響應
});
```

## 響應式斷點

- **手機**: ≤768px (MobileMenu 顯示)
- **平板**: >768px (MobileMenu 隱藏)
- **桌面**: >1024px

## 注意事項

1. 所有組件都使用 `position: fixed` 定位
2. 動畫使用 CSS transitions 和 transforms 實現，性能優化
3. 捲動監聽使用 `passive: true` 來提升性能
4. 防抖機制避免過於頻繁的狀態更新
5. MobileMenu 的響應式邏輯與其他組件不同，專門針對移動端優化
