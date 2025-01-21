import { cn } from '@/utils/cn';
import Link from 'next/link';

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

function Sidebar({ children, className }: SidebarProps) {
  return (
    <div className={cn('flex flex-col gap-2 p-2 w-full bg-white rounded-lg', className)}>
      {children}
    </div>
  );
}

const defaultClass = cn(
  'block p-2 px-10 rounded-lg transition-colors cursor-pointer',
  'text-left text-basic-400 body-lg',
  'hover:text-primary-base hover:bg-primary-lightest hover:font-bold'
);
const activeClass = 'text-primary-base bg-primary-lightest font-bold cursor-default';
const disableClass = 'text-basic-300 bg-transparent font-medium cursor-not-allowed';

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
  return (
    <button
      type="button"
      disabled={isDisabled}
      className={cn(
        defaultClass,
        isActive && activeClass,
        isDisabled && disableClass,
        className
      )}
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
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };
  return (
    <Link
      href={href}
      className={cn(
        defaultClass,
        isActive && activeClass,
        isDisabled && disableClass,
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}

Sidebar.Button = SidebarButton;
Sidebar.Link = SidebarLink;

export default Sidebar;
