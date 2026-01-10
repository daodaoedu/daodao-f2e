"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { useIsMobile } from "@daodao/shared";
import type { DialogFlipDirection } from "../../primitives/radix/dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { Button, ButtonProps } from "../../../button";
import { cn } from "../../../../lib/utils";

export interface DialogAction extends Omit<ButtonProps, "children"> {
  /** 按鈕文字 */
  label: string;
  /** 點擊回調 */
  onClick: () => void | Promise<void>;
}

export interface DialogConfig {
  /** 標題 */
  title: React.ReactNode;
  /** 描述文字 */
  description?: React.ReactNode;
  /** 自訂內容 */
  content?: React.ReactNode;
  /** 按鈕配置 */
  actions?: DialogAction[];
  /** 動畫方向 */
  from?: DialogFlipDirection;
  /** 是否顯示關閉按鈕 */
  showCloseButton?: boolean;
  /** 是否允許點擊外部關閉 */
  dismissible?: boolean;
  /** 是否允許按 ESC 關閉 */
  closeOnEscape?: boolean;
  /** 關閉時的回調 */
  onClose?: () => void;
}

interface DialogManagerContextType {
  open: (config: DialogConfig) => void;
  close: () => void;
}

const DialogManagerContext = createContext<
  DialogManagerContextType | undefined
>(undefined);

export function DialogManagerProvider({ children }: React.PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<DialogConfig | null>(null);
  const configRef = useRef<DialogConfig | null>(null);
  const isMobile = useIsMobile();

  const open = useCallback((newConfig: DialogConfig) => {
    configRef.current = newConfig;
    setConfig(newConfig);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    const currentConfig = configRef.current;
    currentConfig?.onClose?.();
    // 延遲清除配置，確保動畫完成
    setTimeout(() => {
      configRef.current = null;
      setConfig(null);
    }, 300);
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        close();
      }
    },
    [close]
  );

  const handleActionClick = useCallback(
    async (action: DialogAction) => {
      await action.onClick();
      close();
    },
    [close]
  );

  const renderContent = () => {
    if (!config) return null;

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

    if (isMobile) {
      return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
          <SheetContent
            side="bottom"
            className="h-auto max-h-[calc(100vh-64px)] overflow-y-auto gap-0"
            {...commonProps}
          >
            <SheetHeader showCloseButton={config.showCloseButton ?? false}>
              <SheetTitle>{config.title}</SheetTitle>
              {config.description && (
                <SheetDescription>{config.description}</SheetDescription>
              )}
            </SheetHeader>

            <div className="px-5 text-text-dark">{config.content}</div>

            {config.actions && config.actions.length > 0 && (
              <SheetFooter className="flex-row gap-6 p-6 border-t border-light-gray">
                {config.actions.map((action, index) => {
                  const {
                    onClick: _onClick,
                    label,
                    variant,
                    className,
                    ...restProps
                  } = action;
                  return (
                    <Button
                      key={`${action.label}-${index}`}
                      type="button"
                      variant={variant}
                      onClick={() => handleActionClick(action)}
                      className={cn("flex-1", className)}
                      {...restProps}
                    >
                      {label}
                    </Button>
                  );
                })}
              </SheetFooter>
            )}
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          from={config.from ?? "bottom"}
          showCloseButton={config.showCloseButton ?? false}
          {...commonProps}
        >
          <DialogHeader>
            <DialogTitle>{config.title}</DialogTitle>
            {config.description && (
              <DialogDescription>{config.description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="px-5 text-text-dark">{config.content}</div>

          {config.actions && config.actions.length > 0 && (
            <DialogFooter className="flex-row gap-6 p-6">
              {config.actions.map((action, index) => {
                const {
                  onClick: _onClick,
                  label,
                  variant,
                  className,
                  ...restProps
                } = action;
                return (
                  <Button
                    key={`${action.label}-${index}`}
                    type="button"
                    variant={variant ?? "orange"}
                    onClick={() => handleActionClick(action)}
                    className={cn("flex-1", className)}
                    {...restProps}
                  >
                    {label}
                  </Button>
                );
              })}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <DialogManagerContext.Provider value={{ open, close }}>
      {children}
      {config && renderContent()}
    </DialogManagerContext.Provider>
  );
}

export function useDialogManager() {
  const context = useContext(DialogManagerContext);
  if (!context) {
    throw new Error(
      "useDialogManager must be used within a DialogManagerProvider"
    );
  }
  return context;
}
