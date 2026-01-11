"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { useIsMobile } from "@daodao/shared";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { cn } from "../../../../lib/utils";

export interface SheetConfig {
  /** 標題 */
  title: React.ReactNode;
  /** 描述文字 */
  description?: React.ReactNode;
  /** 自訂內容 */
  content: React.ReactNode;
  /** Sheet 出現的位置 */
  side?: "top" | "right" | "bottom" | "left";
  /** 是否顯示關閉按鈕 */
  showCloseButton?: boolean;
  /** 是否允許點擊外部關閉 */
  dismissible?: boolean;
  /** 是否允許按 ESC 關閉 */
  closeOnEscape?: boolean;
  /** 關閉時的回調 */
  onClose?: () => void;
  /** 自訂 className */
  className?: string;
  /** 自訂 content className */
  contentClassName?: string;
}

interface SheetItem {
  id: string;
  config: SheetConfig;
  isOpen: boolean;
}

interface SheetManagerContextType {
  open: (config: SheetConfig) => { id: string; close: () => void };
  close: (id?: string) => void;
}

const SheetManagerContext = createContext<SheetManagerContextType | undefined>(
  undefined
);

export function SheetManagerProvider({ children }: React.PropsWithChildren) {
  const [sheets, setSheets] = useState<SheetItem[]>([]);
  const sheetsRef = useRef<SheetItem[]>([]);
  const isMobile = useIsMobile();
  const nextIdRef = useRef(0);

  const open = useCallback((newConfig: SheetConfig) => {
    const id = `sheet-${nextIdRef.current++}`;
    const newSheet: SheetItem = { id, config: newConfig, isOpen: true };

    setSheets((prev) => {
      const updated = [...prev, newSheet];
      sheetsRef.current = updated;
      return updated;
    });

    const close = () => {
      setSheets((prev) => {
        const sheet = prev.find((s) => s.id === id);
        if (!sheet) return prev;

        sheet.config.onClose?.();

        const updated = prev.map((s) =>
          s.id === id ? { ...s, isOpen: false } : s
        );
        sheetsRef.current = updated;

        setTimeout(() => {
          setSheets((current) => {
            const filtered = current.filter((s) => s.id !== id);
            sheetsRef.current = filtered;
            return filtered;
          });
        }, 300);

        return updated;
      });
    };

    return { id, close };
  }, []);

  const close = useCallback((id?: string) => {
    if (id) {
      setSheets((prev) => {
        const sheet = prev.find((s) => s.id === id);
        if (!sheet) return prev;

        sheet.config.onClose?.();

        const updated = prev.map((s) =>
          s.id === id ? { ...s, isOpen: false } : s
        );
        sheetsRef.current = updated;

        setTimeout(() => {
          setSheets((current) => {
            const filtered = current.filter((s) => s.id !== id);
            sheetsRef.current = filtered;
            return filtered;
          });
        }, 300);

        return updated;
      });
    } else {
      setSheets((prev) => {
        if (prev.length === 0) return prev;
        const lastSheet = prev[prev.length - 1];
        lastSheet?.config.onClose?.();

        const updated = prev.map((s, index) =>
          index === prev.length - 1 ? { ...s, isOpen: false } : s
        );
        sheetsRef.current = updated;

        setTimeout(() => {
          setSheets((current) => {
            const filtered = current.slice(0, -1);
            sheetsRef.current = filtered;
            return filtered;
          });
        }, 300);

        return updated;
      });
    }
  }, []);

  const handleOpenChange = useCallback(
    (sheetId: string) => (open: boolean) => {
      if (!open) {
        close(sheetId);
      }
    },
    [close]
  );

  const renderSheet = (sheet: SheetItem, index: number) => {
    const { id, config, isOpen } = sheet;
    const side = config.side ?? (isMobile ? "bottom" : "right");

    const commonProps = {
      onPointerDownOutside: (e: { preventDefault: () => void }) => {
        if (!config.dismissible) {
          e.preventDefault();
        }
      },
      onInteractOutside: (e: { preventDefault: () => void }) => {
        if (!config.dismissible) {
          e.preventDefault();
        }
      },
      onEscapeKeyDown: (e: { preventDefault: () => void }) => {
        if (!config.closeOnEscape) {
          e.preventDefault();
        }
      },
    };

    return (
      <Sheet key={id} open={isOpen} onOpenChange={handleOpenChange(id)}>
        <SheetContent
          side={side}
          className={cn("overflow-y-auto", config.className)}
          style={{ zIndex: 50 + index }}
          {...commonProps}
        >
          <SheetHeader showCloseButton={config.showCloseButton ?? true}>
            <SheetTitle>{config.title}</SheetTitle>
            <SheetDescription className="sr-only" aria-hidden="true">
              {config.description ??
                (typeof config.title === "string" ? config.title : "")}
            </SheetDescription>
          </SheetHeader>

          <div className={cn("flex-1", config.contentClassName)}>
            {config.content}
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <SheetManagerContext.Provider value={{ open, close }}>
      {children}
      {sheets.map((sheet, index) => renderSheet(sheet, index))}
    </SheetManagerContext.Provider>
  );
}

export function useSheetManager() {
  const context = useContext(SheetManagerContext);
  if (!context) {
    throw new Error(
      "useSheetManager must be used within a SheetManagerProvider"
    );
  }
  return context;
}
