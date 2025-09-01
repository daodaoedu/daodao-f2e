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
          <div className="link"><a href="">關於島島</a></div>
          <div className="link"><a href="">願景</a></div>
          <div className="link"><a href="">使命</a></div>
        </div>
        <div className="link-group">
          <p className="group-title">資源</p>
          <div className="link"><a href="">活動</a></div>
          <div className="link"><a href="">隱私政策</a></div>
          <div className="link"><a href="">服務條款</a></div>
          <div className="link"><a href="">智慧財產權</a></div>
        </div>
        <div className="link-group">
          <p className="group-title">訂閱電子報</p>
          <form className="email-form">
            <input className="w-100" type="email" placeholder="輸入您的Email" />
            <button className="btn btn-large btn-green w-100">訂閱
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                className="icon">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </button>
          </form>
        </div>
      </div>
      <div className="link-group">
        <p className="group-title">追蹤島島</p>
        <div className="d-flex gap-s">
          <a href="">
            <img src="./img/icon-Instagram.svg" alt="Facebook" />
          </a>
          <a href="">
            <img src="./img/icon-Facebook.svg" alt="Instagram" />
          </a>
        </div>
      </div>
      <p className="text-white">島島阿學 © 2025</p>
    </section>
  );
}

