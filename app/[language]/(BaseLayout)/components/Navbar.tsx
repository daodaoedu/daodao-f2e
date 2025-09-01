'use client';

import Logo from '@/public/assets/landing-page/logo.svg';

export default function Navbar() {
  return (
    <nav className="navbar d-flex align-items-center revealable is-visible"> 
    {/* 先加上is-visible強制打開，之後要移除 */}
      <div className="logo"><a href="#top"><img src={Logo} alt="回到首頁" /></a></div>
      <div className="button-group">
        <div className="navbar-item"><a href="#feature" className="scroll-link">解決困境</a></div>
        <div className="navbar-item"><a href="#functions" className="scroll-link">功能生態</a></div>
        <div className="navbar-item"><a href="#plans" className="scroll-link">方案</a></div>
        <button type="button" className="btn btn-orange btn-small">立即加入</button>
      </div>
    </nav>
  );
}

