'use client';

import { useParams } from 'next/navigation';
import { createContext, useState, useContext, useMemo, useEffect } from 'react';
import getEnv from '@/shared/config/env';

interface NavigationBlockerContextType {
  isBlocked: boolean;
  setIsBlocked: (isBlocked: boolean) => void;
}

export const NavigationBlockerContext =
  createContext<NavigationBlockerContextType>({
    isBlocked: false,
    setIsBlocked: () => {},
  });

export const NavigationBlockerProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [isBlocked, setIsBlocked] = useState(false);

  const value = useMemo(() => ({ isBlocked, setIsBlocked }), [isBlocked]);

  return (
    <NavigationBlockerContext.Provider value={value}>
      {children}
    </NavigationBlockerContext.Provider>
  );
};

export const useNavigationBlocker = () => {
  return useContext(NavigationBlockerContext);
};

const getHash = () =>
  getEnv().isClientSide ? window.location.hash : undefined;

export const useHash = () => {
  const [isClient, setIsClient] = useState(false);
  const [hash, setHash] = useState(getHash());
  const params = useParams();

  useEffect(() => {
    setIsClient(true);
    setHash(getHash());
  }, [params]);

  return isClient ? hash : null;
};
