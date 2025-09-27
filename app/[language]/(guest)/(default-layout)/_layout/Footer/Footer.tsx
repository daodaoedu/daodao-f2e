import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export default function Footer() {
  return (
    <footer className="bg-basic-600 pb-20 pt-12 text-white md:pb-12">
      <div className="container">
        <div className="mb-8">
          <Image
            src="/assets/landing-page/logo-simple-white.svg"
            alt="島島阿學 Logo"
            width={142}
            height={24}
            className="mb-2"
          />
          <p className="text-white/80">
            Where personal growth meets collective wisdom!
          </p>
        </div>
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <p className="text-lg text-primary-lighter">關於我們</p>
            <div className="space-y-2">
              <div>
                <Link
                  href="/about"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  關於島島
                </Link>
              </div>
              <div>
                <Link
                  href="/about#vision"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  願景
                </Link>
              </div>
              <div>
                <Link
                  href="/about#mission"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  使命
                </Link>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-primary-lighter">資源</p>
            <div className="space-y-2">
              <div>
                <Link
                  href="/events"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  活動
                </Link>
              </div>
              <div>
                <Link
                  href="/terms/privacy_policy"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  隱私政策
                </Link>
              </div>
              <div>
                <Link
                  href="/terms/service"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  服務條款
                </Link>
              </div>
              <div>
                <Link
                  href="/terms/ipr"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  智慧財產權
                </Link>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-primary-lighter">訂閱電子報</p>
            <form className="space-y-3">
              <input
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-base"
                type="email"
                placeholder="輸入您的Email"
              />
              <Button
                type="submit"
                variant="ctaPrimary"
                size="huge"
                className="w-full"
              >
                訂閱
                <Icon name="arrow-right" />
              </Button>
            </form>
          </div>
        </div>
        <div className="mb-8 space-y-4">
          <p className="text-lg text-primary-lighter">追蹤島島</p>
          <div className="flex gap-4">
            <Link
              href="https://www.instagram.com/daodao_learning"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/assets/landing-page/icon-Instagram.svg"
                alt="Instagram"
                width={36}
                height={36}
              />
            </Link>
            <Link
              href="https://www.facebook.com/daodao.learning"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/assets/landing-page/icon-Facebook.svg"
                alt="Facebook"
                width={36}
                height={36}
              />
            </Link>
          </div>
        </div>
        <p className="text-center text-basic-300">島島阿學 © 2025</p>
      </div>
    </footer>
  );
}
