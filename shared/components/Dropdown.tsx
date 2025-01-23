import { ToggleProvider, useToggle } from '@/contexts/Toggle';
import { cn } from '@/utils/cn';
import useClickOutside from '@/hooks/useClickOutside';
import Button, { ButtonProps } from './Button';

interface DropdownProps {
  as?: React.ElementType;
  children: React.ReactNode;
}

function DropdownContent({ as: Component = 'div', children }: DropdownProps) {
  const { setIsOpen } = useToggle();
  const { ref } = useClickOutside({ setState: setIsOpen });

  return (
    <Component ref={ref} className="relative">
      {children}
    </Component>
  );
}

function Dropdown({ as, children }: DropdownProps) {
  return (
    <ToggleProvider>
      <DropdownContent as={as}>{children}</DropdownContent>
    </ToggleProvider>
  );
}

interface DropdownToggleProps extends ButtonProps {
  className?: string;
  children: React.ReactNode;
  withIcon?: boolean;
}

function Toggle({
  className,
  children,
  withIcon,
  onClick,
  ...props
}: DropdownToggleProps) {
  const { isOpen, setIsOpen } = useToggle({
    errorMessage: 'Dropdown.Toggle must be used within an Dropdown',
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(!isOpen);
    onClick?.(e);
  };

  return (
    <Button
      className={cn('flex items-center', withIcon && 'pl-6 pr-4', className)}
      aria-pressed={isOpen}
      onClick={handleClick}
      {...props}
    >
      {children}
      {withIcon && (
        <div
          className={cn(
            'transition-transform p-2',
            isOpen ? '-rotate-180' : 'rotate-0'
          )}
        >
          <div className="w-2 h-2 rotate-45 -translate-y-0.5 border-b-2 border-r-2 border-solid border-current" />
        </div>
      )}
    </Button>
  );
}

interface DropdownListProps {
  children: React.ReactNode;
  className?: string;
}

function List({ children, className }: DropdownListProps) {
  const { isOpen } = useToggle({
    errorMessage: 'Dropdown.List must be used within an Dropdown',
  });

  return (
    <ul
      className={cn(
        'group absolute p-2 rounded-lg shadow-lg bg-white transition-[transform,opacity] origin-top',
        className,
        isOpen ? 'opacity-100 scale-y-100' : 'opacity-30 scale-y-0'
      )}
      aria-hidden={!isOpen}
    >
      {children}
    </ul>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  className?: string;
}

function Item({ children, className }: DropdownItemProps) {
  return <li className={className}>{children}</li>;
}

Dropdown.Toggle = Toggle;
Dropdown.List = List;
Dropdown.Item = Item;

export default Dropdown;
