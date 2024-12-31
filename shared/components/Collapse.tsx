import { cn } from "@/utils/cn";
import { useState } from "react";

interface CollapseProps {
  rootElement?: React.ElementType;
  wrapperElement?: React.ElementType;
  className?: string;
  wrapperClassName?: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  withIcon?: boolean;
}

function Collapse({
  rootElement: Root = "div",
  wrapperElement: Wrapper = "div",
  className,
  wrapperClassName,
  trigger,
  children,
  withIcon = false,
}: CollapseProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Root className="relative">
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
          "group transition-opacity",
          "*:grid *:transition-[grid-template-rows]",
          "*:grid-rows-[0fr] *:aria-expanded:grid-rows-[1fr] [&>*>*]:overflow-hidden",
          wrapperClassName,
          isOpen ? "opacity-100" : "opacity-0"
        )}
        aria-expanded={isOpen}
      >
        {children}
      </Wrapper>
    </Root>
  );
}

export default Collapse;
