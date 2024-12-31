import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";

interface DropdownProps {
  rootElement?: React.ElementType;
  wrapperElement?: React.ElementType;
  className?: string;
  wrapperClassName?: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  withIcon?: boolean;
}

function Dropdown({
  rootElement: Root = "div",
  wrapperElement: Wrapper = "div",
  className,
  wrapperClassName,
  trigger,
  children,
  withIcon = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains?.(e.target as HTMLElement)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("click", handleClick);
    }
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [isOpen]);

  return (
    <Root ref={ref} className="relative">
      <button
        type="button"
        className={cn("flex items-center", className)}
        aria-pressed={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
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
      <Wrapper
        className={cn(
          "group absolute p-2 rounded-lg shadow-lg bg-white transition-[transform,opacity] origin-top",
          wrapperClassName,
          isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
        )}
        aria-expanded={isOpen}
      >
        {children}
      </Wrapper>
    </Root>
  );
}

export default Dropdown;
