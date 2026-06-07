"use client";

import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { FlaskConical } from "lucide-react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "harness_demo_enabled";

const HarnessContext = createContext(false);

export function useHarnessEnabled() {
  return useContext(HarnessContext);
}

export function HarnessProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setEnabled(true);

    const params = new URLSearchParams(window.location.search);
    if (params.get("harness") === "1") {
      setEnabled(true);
      localStorage.setItem(STORAGE_KEY, "1");
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
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
