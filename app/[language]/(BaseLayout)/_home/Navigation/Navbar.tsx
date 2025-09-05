'use client';

import Link from 'next/link';
import { Image } from '@/components/ui/image';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar d-flex align-items-center revealable is-visible"> 
    {/* 先加上is-visible強制打開，之後要移除 */}
      <div className="logo">
        <Link href="#top">
          <Image src="/assets/landing-page/logo.svg" alt="回到首頁" width={120} height={40} />
        </Link>
      </div>
      <div className="button-group">
        <div className="navbar-item">
          <Link href="#feature" className="scroll-link">解決困境</Link>
        </div>
        <div className="navbar-item">
          <Link href="#functions" className="scroll-link">功能生態</Link>
        </div>
        <div className="navbar-item">
          <Link href="#plans" className="scroll-link">方案</Link>
        </div>
        <button type="button" className="btn btn-orange btn-small">立即加入</button>
      </div>
    </nav>
  );
}

