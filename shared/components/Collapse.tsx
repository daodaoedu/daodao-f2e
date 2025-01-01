import { createContext, useContext, useState } from "react";
import { cn } from "@/utils/cn";

interface CollapseContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CollapseContext = createContext<CollapseContextType | null>(null);

const useCollapseContext = (errorMessage: string) => {
  const context = useContext(CollapseContext);
  if (!context) {
    throw new Error(errorMessage);
  }
  return context;
};

interface CollapseProps {
  as?: React.ElementType;
  children: React.ReactNode;
}

function Collapse({ as: Root = "div", children }: CollapseProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CollapseContext.Provider value={{ isOpen, setIsOpen }}>
      <Root className="relative">{children}</Root>
    </CollapseContext.Provider>
  );
}

interface CollapseToggleProps {
  children: React.ReactNode;
  className?: string;
  withIcon?: boolean;
}

Collapse.Toggle = ({
  children,
  className,
  withIcon,
}: CollapseToggleProps) => {
  const { isOpen, setIsOpen } = useCollapseContext(
    "Collapse.Toggle must be used within a Collapse component"
  );

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
};

interface CollapseListProps {
  children: React.ReactNode;
  className?: string;
}

Collapse.List = ({ children, className }: CollapseListProps) => {
  const { isOpen } = useCollapseContext(
    "Collapse.List must be used within a Collapse component"
  );

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
};

interface CollapseItemProps {
  children: React.ReactNode;
  className?: string;
}

Collapse.Item = ({ children, className }: CollapseItemProps) => {
  return (
    <li>
      <div className={cn("overflow-hidden", className)}>{children}</div>
    </li>
  );
};

export default Collapse;
