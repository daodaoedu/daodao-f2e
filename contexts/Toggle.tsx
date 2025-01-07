import { createContext, useContext, useState } from "react";

interface ToggleContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ToggleContext = createContext<ToggleContextType | null>(null);

interface UseToggleProps {
  errorMessage?: string;
}

export const useToggle = ({ errorMessage }: UseToggleProps = {}) => {
  const context = useContext(ToggleContext);
  if (!context) {
    throw new Error(
      errorMessage || "useToggle must be used within an ToggleProvider"
    );
  }
  return context;
};

interface ToggleProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const ToggleProvider = ({
  children,
  defaultOpen = false,
}: ToggleProviderProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <ToggleContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </ToggleContext.Provider>
  );
};
