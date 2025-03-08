import { forwardRef, useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { isServer } from '@/utils/helper';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from '../Image';

const MobileMenu = dynamic(() => import('./MobileMenu'));
const DesktopMenu = dynamic(() => import('./DesktopMenu'));

enum BREAKPOINT {
  EMPTY,
  MOBILE,
  DESKTOP,
}

const calculateBreakpoint = () => {
  if (isServer) {
    return BREAKPOINT.EMPTY;
  }
  return window.innerWidth < 1024 ? BREAKPOINT.MOBILE : BREAKPOINT.DESKTOP;
};

function Header(
  { children }: React.PropsWithChildren,
  ref: React.Ref<HTMLDivElement>
) {
  const [breakpoint, setBreakpoint] = useState<BREAKPOINT>(calculateBreakpoint);

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(calculateBreakpoint);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-0 inset-x-0 z-30 shadow-md shadow-basic-black/25"
    >
      {children}
      <header
        className={cn(
          'relative flex items-center justify-between w-full px-4 body-md bg-primary-base',
          breakpoint === BREAKPOINT.MOBILE && 'pr-2'
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
        {breakpoint === BREAKPOINT.MOBILE && <MobileMenu />}
        {breakpoint === BREAKPOINT.DESKTOP && <DesktopMenu />}
      </header>
    </div>
  );
}

export default forwardRef(Header);
