'use client';

import LogoWhite from '@/public/assets/landing-page/logo-simple-white.svg';


export default function Footer() {
  return (
    <section className="footer">
      <div className="logo">
        <img src={LogoWhite} alt="Logo" />
        <p>Where personal growth meets collective wisdom!</p>
      </div>
      <div className="desktop-row">
        <div className="link-group">
          <p className="group-title">關於我們</p>
          <div className="link"><a href="/about">關於島島</a></div>
          <div className="link"><a href="/vision">願景</a></div>
          <div className="link"><a href="/mission">使命</a></div>
        </div>
        <div className="link-group">
          <p className="group-title">資源</p>
          <div className="link"><a href="/events">活動</a></div>
          <div className="link"><a href="/privacy">隱私政策</a></div>
          <div className="link"><a href="/terms">服務條款</a></div>
          <div className="link"><a href="/ipr">智慧財產權</a></div>
        </div>
        <div className="link-group">
          <p className="group-title">訂閱電子報</p>
          <form className="email-form">
            <input className="w-100" type="email" placeholder="輸入您的Email" />
            <button type="submit" className="btn btn-large btn-green w-100">訂閱
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="icon">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      <div className="link-group">
        <p className="group-title">追蹤島島</p>
        <div className="d-flex gap-s">
          <a href="https://instagram.com/daodao" target="_blank" rel="noopener noreferrer">
            <img src="./img/icon-Instagram.svg" alt="Instagram" />
          </a>
          <a href="https://facebook.com/daodao" target="_blank" rel="noopener noreferrer">
            <img src="./img/icon-Facebook.svg" alt="Facebook" />
          </a>
        </div>
      </div>
      <p className="text-white">島島阿學 © 2025</p>
    </section>
  );
}

