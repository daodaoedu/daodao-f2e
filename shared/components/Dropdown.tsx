import { useEffect, useRef } from "react";
import { ToggleProvider, useToggle } from "@/contexts/Toggle";
import { cn } from "@/utils/cn";

interface DropdownProps {
  as?: React.ElementType;
  children: React.ReactNode;
}

function DropdownContent({ as: Component = "div", children }: DropdownProps) {
  const { isOpen, setIsOpen } = useToggle();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        e.target instanceof HTMLElement &&
        ref.current?.contains?.(e.target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("click", handleClick);
    }
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [isOpen]);

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

interface DropdownToggleProps {
  className?: string;
  children: React.ReactNode;
  withIcon?: boolean;
}

function Toggle({ className, children, withIcon }: DropdownToggleProps) {
  const { isOpen, setIsOpen } = useToggle({
    errorMessage: "Dropdown.Toggle must be used within an Dropdown",
  });

  return (
    <button
      type="button"
      className={cn("flex items-center", className)}
      aria-pressed={isOpen}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      {withIcon && (
        <div
          className={cn(
            "transition-transform p-2",
            isOpen ? "-rotate-180" : "rotate-0"
          )}
        >
          <div className="w-2 h-2 rotate-45 -translate-y-0.5 border-b-2 border-r-2 border-solid border-current" />
        </div>
      )}
    </button>
  );
}

interface DropdownListProps {
  children: React.ReactNode;
  className?: string;
}

function List({ children, className }: DropdownListProps) {
  const { isOpen } = useToggle({
    errorMessage: "Dropdown.List must be used within an Dropdown",
  });

  return (
    <ul
      className={cn(
        "group absolute p-2 rounded-lg shadow-lg bg-white transition-[transform,opacity] origin-top",
        className,
        isOpen ? "opacity-100 scale-y-100" : "opacity-30 scale-y-0"
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
