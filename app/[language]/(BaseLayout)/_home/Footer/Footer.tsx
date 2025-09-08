'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <section className="bg-basic-600 text-white py-12">
      <div className="container">
        <div className="mb-8">
          <Image 
            src="/assets/landing-page/logo-simple-white.svg" 
            alt="" 
            width={142}
            height={24}
            className="mb-2" 
          />
          <p className="text-white/80">Where personal growth meets collective wisdom!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <p className="text-primary-lighter font-semibold text-lg">關於我們</p>
            <div className="space-y-2">
              <div><Link href="/about" className="text-white/70 hover:text-primary-base transition-colors">關於島島</Link></div>
              <div><Link href="/about#vision" className="text-white/70 hover:text-primary-base transition-colors">願景</Link></div>
              <div><Link href="/about#mission" className="text-white/70 hover:text-primary-base transition-colors">使命</Link></div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-primary-lighter font-semibold text-lg">資源</p>
            <div className="space-y-2">
              <div><Link href="/events" className="text-white/70 hover:text-primary-base transition-colors">活動</Link></div>
              <div><Link href="/privacy-policy" className="text-white/70 hover:text-primary-base transition-colors">隱私政策</Link></div>
              <div><Link href="/terms-of-service" className="text-white/70 hover:text-primary-base transition-colors">服務條款</Link></div>
              <div><Link href="/intellectual-property" className="text-white/70 hover:text-primary-base transition-colors">智慧財產權</Link></div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-primary-lighter font-semibold text-lg">訂閱電子報</p>
            <form className="space-y-3">
              <input 
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent" 
                type="email" 
                placeholder="輸入您的Email" 
              />
              <button 
                type="submit" 
                className="w-full bg-primary-base hover:bg-primary-darker text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                訂閱
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>
        <div className="space-y-4 mb-8">
          <p className="text-primary-lighter font-semibold text-lg">追蹤島島</p>
          <div className="flex gap-4">
            <Link href="https://www.instagram.com/daodao_learning" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Image 
                src="/assets/landing-page/icon-Instagram.svg" 
                alt="Instagram" 
                width={32}
                height={32}
                className="w-8 h-8" 
              />
            </Link>
            <Link href="https://www.facebook.com/daodao.learning" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Image 
                src="/assets/landing-page/icon-Facebook.svg" 
                alt="Facebook" 
                width={32}
                height={32}
                className="w-8 h-8" 
              />
            </Link>
          </div>
        </div>
        <p className="text-white/60 text-center">島島阿學 © 2025</p>
      </div>
    </section>
  );
}

