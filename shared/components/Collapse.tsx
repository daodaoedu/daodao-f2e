import { ToggleProvider, useToggle } from "@/contexts/Toggle";
import { cn } from "@/utils/cn";

interface CollapseProps {
  as?: React.ElementType;
  children: React.ReactNode;
}

function Collapse({ as: Root = "div", children }: CollapseProps) {
  return (
    <ToggleProvider>
      <Root className="relative">{children}</Root>
    </ToggleProvider>
  );
}

interface CollapseToggleProps {
  children: React.ReactNode;
  className?: string;
  withIcon?: boolean;
}

function Toggle({ children, className, withIcon }: CollapseToggleProps) {
  const { isOpen, setIsOpen } = useToggle({
    errorMessage: "Collapse.Toggle must be used within a Collapse",
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

interface CollapseListProps {
  children: React.ReactNode;
  className?: string;
}

function List({ children, className }: CollapseListProps) {
  const { isOpen } = useToggle({
    errorMessage: "Collapse.List must be used within a Collapse",
  });

  return (
    <ul
      className={cn(
        "group transition-opacity",
        "*:grid *:transition-[grid-template-rows]",
        "*:grid-rows-[1fr] *:aria-hidden:grid-rows-[0fr] [&>*>*]:overflow-hidden",
        className,
        isOpen ? "opacity-100" : "opacity-0"
      )}
      aria-hidden={!isOpen}
    >
      {children}
    </ul>
  );
}

interface CollapseItemProps {
  children: React.ReactNode;
  className?: string;
}

function Item({ children, className }: CollapseItemProps) {
  return (
    <li>
      <div className={cn("overflow-hidden", className)}>{children}</div>
    </li>
  );
}

Collapse.Toggle = Toggle;
Collapse.List = List;
Collapse.Item = Item;

export default Collapse;
