import { CSSProperties, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

const useSmoothIntoView = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ref.current || window.innerWidth > 1023) return;
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timeout);
  }, []);
  return ref;
};

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

function Sidebar({ children, className }: SidebarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (!wrapperRef.current) {
        return;
      }
      if (window.innerWidth > 1023) {
        setContentWidth(0);
        return;
      }
      const widths = Array.from(wrapperRef.current.children).map(
        (el) => el.clientWidth
      );
      setContentWidth(Math.max(...widths));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [wrapperRef]);

  return (
    <div
      className={cn(
        'p-0 whitespace-nowrap overflow-x-auto h-max',
        'bg-white rounded-lg shadow-lg shadow-basic-400/10',
        'lg:p-2 lg:shadow-none',
        className
      )}
    >
      <div
        ref={wrapperRef}
        className={cn(
          'flex gap-px lg:flex-col lg:gap-2 lg:w-full',
          '*:grow *:shrink-0 *:basis-[var(--content-width)]'
        )}
        style={{ '--content-width': `${contentWidth}px` } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

const defaultClass = cn(
  'relative block p-2 px-10 rounded-lg transition-colors cursor-pointer',
  'text-center lg:text-left text-basic-400 body-lg',
  'lg:hover:text-primary-base lg:hover:bg-primary-lightest lg:hover:font-bold',
  'vertical-separator-left first:before:hidden data-[active=true]:before:hidden',
  '[&[data-active="true"]_+_*]:before:hidden lg:before:hidden'
);
const activeClass =
  'text-primary-base bg-primary-lightest font-bold cursor-default';
const disableClass =
  'text-basic-300 bg-transparent font-medium cursor-not-allowed';

interface SidebarButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  isActive?: boolean;
  isDisabled?: boolean;
}

function SidebarButton({
  children,
  className,
  isActive,
  isDisabled,
  ...props
}: SidebarButtonProps) {
  const ref = useSmoothIntoView<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type="button"
      disabled={isDisabled}
      className={cn(
        defaultClass,
        isActive && activeClass,
        isDisabled && disableClass,
        className
      )}
      data-active={isActive}
      {...props}
    >
      {children}
    </button>
  );
}

interface SidebarLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  isActive?: boolean;
  isDisabled?: boolean;
}

function SidebarLink({
  children,
  href,
  className,
  isActive,
  isDisabled,
  onClick,
  ...props
}: SidebarLinkProps) {
  const ref = useSmoothIntoView<HTMLAnchorElement>();
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };
  return (
    <Link
      ref={ref}
      href={href}
      className={cn(
        defaultClass,
        isActive && activeClass,
        isDisabled && disableClass,
        className
      )}
      data-active={isActive}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}

interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
  isDisabled?: boolean;
}

function SidebarItem({
  children,
  className,
  isActive,
  isDisabled,
  ...props
}: SidebarItemProps) {
  const ref = useSmoothIntoView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        defaultClass,
        isActive && activeClass,
        isDisabled && disableClass,
        'w-full p-0',
        className
      )}
      data-active={isActive}
      {...props}
    >
      {children}
    </div>
  );
}

Sidebar.Button = SidebarButton;
Sidebar.Link = SidebarLink;
Sidebar.Item = SidebarItem;

export default Sidebar;
