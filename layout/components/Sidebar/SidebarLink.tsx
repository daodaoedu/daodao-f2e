import { CustomLink } from '@/shared/ui/custom-link';
import { cn } from '@/shared/lib/cn';
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
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };
  return (
    <CustomLink
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
    </CustomLink>
  );
}

export default SidebarLink;
