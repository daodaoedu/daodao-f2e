'use client';
import LottieHero from './LottieHero';
import DecoComma from '@/public/assets/landing-page/deco-comma.svg';
import DecoFlowerOrange from '@/public/assets/landing-page/deco-flower-orange.svg';
import DecoArrow from '@/public/assets/landing-page/deco-arrow.svg';
import Logo from '@/public/assets/landing-page/logo.svg';


export default function KeyVision() {
  return (
  <div className="section-block key-vision">

            <div className="title" id="top">
                <img src={DecoComma} />
                <img src={DecoFlowerOrange} />
                <img src={DecoArrow} />
                <img className="" src={Logo} style={{marginBottom: 42}} />
                <h2>讓學習成為充滿<br /><span>自我掌握、互助支持<br />和看得見進步的美好日常</span></h2>

                <button className="btn btn-orange btn-large" style={{marginBottom: 20}}>立即加入
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        className="icon">
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                    </svg>
                </button>
            </div>
            <LottieHero
        className="lottie-animation"           // 直接沿用你原本的 class
        desktopSrc="../../public/assets/landing-page/key-vision-desktop.json"
        mobileSrc="../../public/assets/landing-page/key-vision-mobile.json"
        breakpoint={768}
        preserveAspectRatio="xMidYMid meet"
      />
        </div>
  );
}

