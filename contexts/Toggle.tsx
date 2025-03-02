import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  useMemo,
  useLayoutEffect,
} from 'react';

interface AnchorPoint {
  left: string | undefined;
  right: string | undefined;
  top: string | undefined;
  bottom: string | undefined;
}

interface ToggleContextType {
  isOpen: boolean;
  isOpened: boolean;
  anchorPoint: AnchorPoint | undefined;
  setIsOpen: (isEnabled: boolean) => void;
  setWrapperDom: Dispatch<SetStateAction<HTMLElement | null>>;
  setTriggerDom: Dispatch<SetStateAction<HTMLElement | null>>;
}

const ToggleContext = createContext<ToggleContextType | null>(null);

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
  isEnabled?: boolean;
  onChange?: (isEnabled: boolean) => void;
}

export const ToggleProvider = ({
  children,
  defaultEnabled = false,
  isEnabled,
  onChange,
}: ToggleProviderProps) => {
  const [isOpen, setIsOpen] = useState(defaultEnabled);
  const [isOpened, setIsOpened] = useState(!defaultEnabled);
  const [wrapperDom, setWrapperDom] = useState<HTMLElement | null>(null);
  const [triggerDom, setTriggerDom] = useState<HTMLElement | null>(null);
  const [anchorPoint, setAnchorPoint] = useState<AnchorPoint | undefined>(
    undefined
  );

  const value = useMemo(
    () => ({
      isOpen: isEnabled ?? isOpen,
      isOpened,
      anchorPoint,
      setIsOpen: onChange ?? setIsOpen,
      setWrapperDom,
      setTriggerDom,
    }),
    [isOpen, isOpened, isEnabled, anchorPoint, onChange]
  );

  useLayoutEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen) {
      timer = setTimeout(() => {
        setIsOpened(true);
      }, 300);
    } else {
      setIsOpened(false);
    }

    return () => clearTimeout(timer);
  }, [isOpen]);

  useLayoutEffect(() => {
    const handleScroll = () => {
      if (!wrapperDom || !triggerDom) {
        return;
      }

      const wrapperBox = wrapperDom.getBoundingClientRect();
      const triggerBox = triggerDom.getBoundingClientRect();

      if (!wrapperBox || !triggerBox) {
        return;
      }

      const { clientWidth, clientHeight } = wrapperDom;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const anchorX = triggerBox.left;
      const anchorY = triggerBox.top + triggerBox.height;

      const isOnLeft = anchorX + clientWidth < screenWidth;
      const isOnTop = anchorY + clientHeight < screenHeight;

      const calcPX = (v: number | false) =>
        typeof v === 'number' ? `${v}px` : undefined;

      setAnchorPoint({
        left: calcPX(isOnLeft && anchorX),
        right: calcPX(!isOnLeft && screenWidth - anchorX - triggerBox.width),
        top: calcPX(isOnTop && anchorY),
        bottom: calcPX(!isOnTop && screenHeight - triggerBox.top),
      });
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [wrapperDom, triggerDom]);

  return (
    <ToggleContext.Provider value={value}>{children}</ToggleContext.Provider>
  );
};
