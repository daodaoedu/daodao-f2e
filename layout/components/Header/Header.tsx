import { useRouter } from 'next/router';
import { forwardRef } from 'react';
import Link from 'next/link';
import newLogo from '@/public/new-logo.png';
import { usePromotion } from '@/contexts/Promotion';
import { cn } from '@/utils/cn';
import { Image } from '@/components/ui/image';
import MobileMenu from './MobileMenu';
import DesktopMenu from './DesktopMenu';

function Header(
  { children }: React.PropsWithChildren,
  ref: React.Ref<HTMLDivElement>
) {
  const { isShowShadow } = usePromotion();
  const { pathname } = useRouter();
  const isFixed = pathname === '/';

  return (
    <div
      ref={ref}
      className={cn(
        'sticky top-0 inset-x-0 z-30',
        isShowShadow && 'shadow-md shadow-basic-black/25',
        isFixed && 'fixed'
      )}
    >
      {children}
      <header className="relative flex items-center justify-between w-full px-4 body-md bg-primary-base">
        <div className="flex-1">
          <Link href="/" className="block py-6">
            <Image
              src={newLogo}
              alt="島島阿學"
              width={152}
              height={22}
              priority
            />
          </Link>
        </div>
        <div className="hidden lg:flex items-center justify-between flex-[3] xl:flex-[2]">
          <DesktopMenu />
        </div>
        <div className="lg:hidden">
          <MobileMenu />
        </div>
      </header>
    </div>
  );
}

export default forwardRef(Header);
