"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface NavigationBlockerContextType {
  isBlocked: boolean;
  setIsBlocked: (isBlocked: boolean) => void;
}

export const NavigationBlockerContext = createContext<NavigationBlockerContextType>({
  isBlocked: false,
  setIsBlocked: () => {},
});

export const NavigationBlockerProvider = ({ children }: React.PropsWithChildren) => {
  const [isBlocked, setIsBlocked] = useState(false);

  const value = useMemo(() => ({ isBlocked, setIsBlocked }), [isBlocked]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isBlocked) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isBlocked]);

  return (
    <NavigationBlockerContext.Provider value={value}>{children}</NavigationBlockerContext.Provider>
  );
};

export const useNavigationBlocker = () => {
  const context = useContext(NavigationBlockerContext);
  if (!context) {
    throw new Error("useNavigationBlocker must be used within a NavigationBlockerProvider");
  }
  return context;
};

export const useNavigationBlockerEffect = (shouldBlock: boolean) => {
  const { setIsBlocked } = useNavigationBlocker();

  useEffect(() => {
    setIsBlocked(shouldBlock);
    return () => {
      setIsBlocked(false);
    };
  }, [shouldBlock, setIsBlocked]);
};

const getHash = () => (window === undefined ? undefined : window.location.hash);

export const useHash = () => {
  const [isClient, setIsClient] = useState(false);
  const [hash, setHash] = useState(getHash());

  useEffect(() => {
    setIsClient(true);
    setHash(getHash());
  }, []);

  return isClient ? hash : null;
};
