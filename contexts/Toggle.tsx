import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';

const ToggleContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>] | null
>(null);

interface UseToggleProps {
  errorMessage?: string;
}

export const useToggle = ({ errorMessage }: UseToggleProps = {}) => {
  const context = useContext(ToggleContext);
  if (!context) {
    throw new Error(
      errorMessage || 'useToggle must be used within an ToggleProvider'
    );
  }
  return context;
};

interface ToggleProviderProps {
  children: React.ReactNode;
  defaultEnabled?: boolean;
}

export const ToggleProvider = ({
  children,
  defaultEnabled = false,
}: ToggleProviderProps) => {
  const state = useState(defaultEnabled);

  return (
    <ToggleContext.Provider value={state}>{children}</ToggleContext.Provider>
  );
};
