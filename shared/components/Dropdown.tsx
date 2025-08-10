import { ToggleProvider, useToggle } from '@/contexts/Toggle';
import { cn } from '@/utils/cn';
import useClickOutside from '@/hooks/useClickOutside';
import Button, { ButtonProps } from '@/shared/components/Button';

interface DropdownContentProps {
  as?: React.ElementType;
  children: React.ReactNode;
  disableAutoClose?: boolean;
}

function DropdownContent({
  as: Component = 'div',
  children,
  disableAutoClose = false,
}: DropdownContentProps) {
  const { isOpen, setIsOpen } = useToggle();
  const { ref } = useClickOutside({ setState: setIsOpen });

  const handleClick = () => {
    if (disableAutoClose) return;
    if (!isOpen) return;
    setIsOpen(false);
  };

  return (
    <Component ref={ref} className="relative" onClick={handleClick}>
      {children}
    </Component>
  );
}

interface DropdownProps extends Omit<DropdownContentProps, 'disableAutoClose'> {
  isOpen?: boolean;
  onChange?: (isEnabled: boolean) => void;
}

function Dropdown({
  as, children, isOpen, onChange,
}: DropdownProps) {
  return (
    <ToggleProvider isEnabled={isOpen} onChange={onChange}>
      <DropdownContent as={as} disableAutoClose={!!onChange}>
        {children}
      </DropdownContent>
    </ToggleProvider>
  );
}

interface DropdownToggleProps extends Omit<ButtonProps, 'as'> {
  className?: string;
  children?: React.ReactNode;
  withIcon?: boolean;
}

function Toggle({
  className,
  children,
  withIcon,
  onClick,
  ...props
}: DropdownToggleProps) {
  const { isOpen, setIsOpen, setTriggerDom } = useToggle({
    errorMessage: 'Dropdown.Toggle must be used within an Dropdown',
  });

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    setIsOpen(!isOpen);
    onClick?.(e as React.MouseEvent<HTMLButtonElement>);
  };

  return (
    <Button
      ref={(el) => setTriggerDom(el)}
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
          <div className="size-2 -translate-y-0.5 rotate-45 border-b-2 border-r-2 border-solid border-current" />
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
  const { isOpen, anchorPoint, setWrapperDom } = useToggle({
    errorMessage: 'Dropdown.List must be used within an Dropdown',
  });
  const isOnTop = anchorPoint?.top;

  return (
    <ul
      ref={(el) => setWrapperDom(el)}
      className={cn(
        'group fixed p-2 z-30 rounded-lg shadow-lg bg-white transition-[transform,opacity]',
        className,
        isOnTop ? 'origin-top' : 'origin-bottom',
        isOpen ? 'opacity-100 scale-y-100' : 'opacity-30 scale-y-0'
      )}
      style={anchorPoint}
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
