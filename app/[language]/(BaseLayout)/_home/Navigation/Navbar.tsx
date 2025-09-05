'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import { Image } from '@/components/ui/image';
import './Navbar.css';

export default function Navbar() {
  const { scrollToElement, scrollToTop } = useSmoothScroll();
  const isVisible = useScrollVisibility({ threshold: 200 }); // 捲動超過 200px 時顯示

  const handleNavClick = (targetId: string) => {
    // 為導航欄添加適當的偏移量，避免被固定導航欄遮擋
    const navbarHeight = 80; // 根據實際導航欄高度調整
    scrollToElement(targetId, navbarHeight);
  };

  const handleLogoClick = () => {
    scrollToTop();
  };

  return (
    <nav className={`navbar d-flex align-items-center revealable ${isVisible ? 'is-visible' : ''}`}>
      <div className="logo">
        <button 
          type="button"
          onClick={handleLogoClick}
          className="logo-button"
          aria-label="回到首頁"
        >
          <Image src="/assets/landing-page/logo.svg" alt="回到首頁" width={120} height={40} />
        </button>
      </div>
      <div className="button-group">
        <div className="navbar-item">
          <button 
            type="button"
            onClick={() => handleNavClick('feature')} 
            className="nav-link"
          >
            解決困境
          </button>
        </div>
        <div className="navbar-item">
          <button 
            type="button"
            onClick={() => handleNavClick('functions')} 
            className="nav-link"
          >
            功能生態
          </button>
        </div>
        <div className="navbar-item">
          <button 
            type="button"
            onClick={() => handleNavClick('plans')} 
            className="nav-link"
          >
            方案
          </button>
        </div>
        <button type="button" className="btn btn-orange btn-small">立即加入</button>
      </div>
    </nav>
  );
}

