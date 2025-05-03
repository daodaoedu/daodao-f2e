import Link from 'next/link';
import { cn } from '@/utils/cn';
import useSmoothIntoView from '@/hooks/useSmoothIntoView';
import { activeClass, defaultClass, disableClass } from './constant';

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

export default SidebarLink;
