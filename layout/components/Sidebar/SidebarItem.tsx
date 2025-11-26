import { cn } from '@/shared/lib/cn';
import { activeClass, defaultClass, disableClass } from './constant';

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
  return (
    <div
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

export default SidebarItem;
