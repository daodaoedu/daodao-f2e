"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef } from "react";

type PortalScopeValue = {
  suspended: boolean;
  feedback: ReactNode;
  label: string;
};

const PortalScopeContext = createContext<PortalScopeValue | null>(null);

/** Keep page-owned floating surfaces in the same access boundary as their forms. */
export function PortalScopeProvider({
  children,
  suspended,
  feedback,
  label,
}: {
  children: ReactNode;
  suspended: boolean;
  feedback: ReactNode;
  label: string;
}) {
  const value = useMemo(() => ({ suspended, feedback, label }), [suspended, feedback, label]);
  return <PortalScopeContext.Provider value={value}>{children}</PortalScopeContext.Provider>;
}

export function usePortalScope() {
  return useContext(PortalScopeContext);
}

/** Retain draft DOM while placing recovery controls inside the modal's focus scope. */
export function PortalScopeContent({ children }: { children: ReactNode }) {
  const scope = usePortalScope();
  const feedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scope?.suspended) feedbackRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [scope?.suspended]);
  if (!scope) return <>{children}</>;
  return (
    <>
      {scope.suspended && <div ref={feedbackRef}>{scope.feedback}</div>}
      <div
        data-portal-scope-draft=""
        style={{ display: scope.suspended ? "none" : "contents" }}
        inert={scope.suspended}
      >
        {children}
      </div>
    </>
  );
}
