"use client";

import { getStorage, StorageEnum } from "@daodao/shared";
import { cn } from "@daodao/ui/lib/utils";
import { FlaskConical } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const HarnessContext = createContext(false);
const harnessDemoStorage = getStorage<boolean>(StorageEnum.HarnessDemoEnabled);

export function useHarnessEnabled() {
  return useContext(HarnessContext);
}

export function HarnessProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  return (
    <HarnessContext.Provider value={enabled}>
      {children}
      <Suspense fallback={null}>
        <HarnessToggle enabled={enabled} setEnabled={setEnabled} />
      </Suspense>
    </HarnessContext.Provider>
  );
}

function HarnessToggle({
  enabled,
  setEnabled,
}: {
  enabled: boolean;
  setEnabled: Dispatch<SetStateAction<boolean>>;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const stored = harnessDemoStorage.get();
    if (stored) setEnabled(true);

    if (searchParams.get("harness") === "1") {
      setEnabled(true);
      harnessDemoStorage.set(true);
    }
  }, [searchParams, setEnabled]);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      harnessDemoStorage.set(next);
      return next;
    });
  }, [setEnabled]);

  return (
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
  );
}

export function HarnessGate({ children }: { children: ReactNode }) {
  const enabled = useHarnessEnabled();
  if (!enabled) return null;
  return <>{children}</>;
}
