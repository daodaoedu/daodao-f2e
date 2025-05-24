import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePromotion } from '@/contexts/Promotion';
import useBreakpoint from '@/hooks/useBreakpoint';
import Image from '../../../shared/components/Image';

const MobileMenu = dynamic(() => import('./MobileMenu'));
const DesktopMenu = dynamic(() => import('./DesktopMenu'));

function Header(
  { children }: React.PropsWithChildren,
  ref: React.Ref<HTMLDivElement>
) {
  const { isDesktop, isMobile } = useBreakpoint();
  const { isShowShadow } = usePromotion();

  return (
    <div
      ref={ref}
      className={cn(
        'fixed top-0 inset-x-0 z-30',
        isShowShadow && 'shadow-md shadow-basic-black/25'
      )}
    >
      {children}
      <header
        className={cn(
          'relative flex items-center justify-between w-full px-4 body-md bg-primary-base',
          isMobile && 'pr-2'
        )}
      >
        <Link href="/" className="block pt-6 pb-4">
          <Image
            src="/new-logo.png"
            alt="島島阿學"
            width="152"
            height="22"
            className="max-h-[22px]"
          />
        </Link>
        {isMobile && <MobileMenu />}
        {isDesktop && <DesktopMenu />}
      </header>
    </div>
  );
}

export default forwardRef(Header);
