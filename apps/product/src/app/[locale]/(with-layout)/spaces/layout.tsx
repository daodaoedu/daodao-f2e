"use client";

import { defaultSwrConfig, SwrConfigProvider } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useRouter } from "@daodao/i18n/navigation";
import { type ReactNode, useEffect, useMemo } from "react";

/** Hide private children immediately on logout and isolate every account's space queries. */
export default function PrivateSpacesLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading, isTemporary, authCheckUnavailable } = useAuth();
  const router = useRouter();
  const config = useMemo(
    () => ({ ...defaultSwrConfig, keepPreviousData: false, provider: () => new Map() }),
    []
  );
  useEffect(() => {
    if (isLoading || (isAuthenticated && !authCheckUnavailable)) return;
    const destination = `${window.location.pathname}${window.location.search}`;
    const path = authCheckUnavailable ? "/auth/access-unavailable" : "/auth/login";
    router.replace(`${path}?redirect=${encodeURIComponent(destination)}`);
  }, [isLoading, isAuthenticated, authCheckUnavailable, router]);
  if (isLoading || authCheckUnavailable || !isAuthenticated || !user || isTemporary) return null;
  return (
    <SwrConfigProvider key={user.id} value={config}>
      {children}
    </SwrConfigProvider>
  );
}
