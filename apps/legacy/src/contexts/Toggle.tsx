"use client";

import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";

interface ToggleContextValue {
  isOpen: boolean;
  isOpened: boolean;
  setIsOpen: (value: boolean) => void;
}

const ToggleContext = createContext<ToggleContextValue | null>(null);

interface ToggleProviderProps {
  children: ReactNode;
  defaultEnabled?: boolean;
}

export const ToggleProvider = ({ children, defaultEnabled = false }: ToggleProviderProps) => {
  const [isOpen, setIsOpen] = useState(defaultEnabled);
  const isOpenedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isOpenedRef.current = true;
    }
  }, [isOpen]);

  return (
    <ToggleContext.Provider
      value={{
        isOpen,
        isOpened: isOpenedRef.current,
        setIsOpen,
      }}
    >
      {children}
    </ToggleContext.Provider>
  );
};

interface UseToggleOptions {
  errorMessage?: string;
}

export const useToggle = ({
  errorMessage = "useToggle must be used within a ToggleProvider",
}: UseToggleOptions = {}) => {
  const context = useContext(ToggleContext);
  if (!context) {
    throw new Error(errorMessage);
  }
  return context;
};
