"use client";

import { getStorage, StorageEnum } from "@daodao/shared";
import { cn } from "@daodao/ui/lib/utils";
import { FlaskConical } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

const HarnessContext = createContext(false);
const harnessDemoStorage = getStorage<boolean>(StorageEnum.HarnessDemoEnabled);

export function useHarnessEnabled() {
  return useContext(HarnessContext);
}

export function HarnessProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = harnessDemoStorage.get();
    if (stored) setEnabled(true);

    if (searchParams.get("harness") === "1") {
      setEnabled(true);
      harnessDemoStorage.set(true);
    }
  }, [searchParams]);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      harnessDemoStorage.set(next);
      return next;
    });
  }, []);

  return (
    <HarnessContext.Provider value={enabled}>
      {children}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "fixed bottom-20 left-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full shadow-lg transition-all text-xs font-medium",
          enabled ? "bg-logo-cyan text-white" : "bg-white text-light-gray border border-light-gray"
        )}
      >
        <FlaskConical className="size-4" />
        {enabled ? "Harness ON" : "Harness"}
      </button>
    </HarnessContext.Provider>
  );
}

export function HarnessGate({ children }: { children: ReactNode }) {
  const enabled = useHarnessEnabled();
  if (!enabled) return null;
  return <>{children}</>;
}
