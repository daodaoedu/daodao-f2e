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

interface DialogItem {
  id: string;
  config: DialogConfig;
  isOpen: boolean;
}

interface DialogManagerContextType {
  open: (config: DialogConfig) => { id: string; close: () => void };
  close: (id?: string) => void;
}

const DialogManagerContext = createContext<
  DialogManagerContextType | undefined
>(undefined);

export function DialogManagerProvider({ children }: React.PropsWithChildren) {
  const [dialogs, setDialogs] = useState<DialogItem[]>([]);
  const dialogsRef = useRef<DialogItem[]>([]);
  const isMobile = useIsMobile();
  const nextIdRef = useRef(0);

  const open = useCallback((newConfig: DialogConfig) => {
    const id = `dialog-${nextIdRef.current++}`;
    const newDialog: DialogItem = { id, config: newConfig, isOpen: true };

    setDialogs((prev) => {
      const updated = [...prev, newDialog];
      dialogsRef.current = updated;
      return updated;
    });

    const close = () => {
      setDialogs((prev) => {
        const dialog = prev.find((d) => d.id === id);
        if (!dialog) return prev;

        dialog.config.onClose?.();

        const updated = prev.map((d) =>
          d.id === id ? { ...d, isOpen: false } : d
        );
        dialogsRef.current = updated;

        setTimeout(() => {
          setDialogs((current) => {
            const filtered = current.filter((d) => d.id !== id);
            dialogsRef.current = filtered;
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
      setDialogs((prev) => {
        const dialog = prev.find((d) => d.id === id);
        if (!dialog) return prev;

        dialog.config.onClose?.();

        const updated = prev.map((d) =>
          d.id === id ? { ...d, isOpen: false } : d
        );
        dialogsRef.current = updated;

        setTimeout(() => {
          setDialogs((current) => {
            const filtered = current.filter((d) => d.id !== id);
            dialogsRef.current = filtered;
            return filtered;
          });
        }, 300);

        return updated;
      });
    } else {
      setDialogs((prev) => {
        if (prev.length === 0) return prev;
        const lastDialog = prev[prev.length - 1];
        lastDialog?.config.onClose?.();

        const updated = prev.map((d, index) =>
          index === prev.length - 1 ? { ...d, isOpen: false } : d
        );
        dialogsRef.current = updated;

        setTimeout(() => {
          setDialogs((current) => {
            const filtered = current.slice(0, -1);
            dialogsRef.current = filtered;
            return filtered;
          });
        }, 300);

        return updated;
      });
    }
  }, []);

  const handleOpenChange = useCallback(
    (dialogId: string) => (open: boolean) => {
      if (!open) {
        close(dialogId);
      }
    },
    [close]
  );

  const handleActionClick = useCallback(
    (dialogId: string) => async (action: DialogAction) => {
      await action.onClick();
      close(dialogId);
    },
    [close]
  );

  const renderDialog = (dialog: DialogItem, index: number) => {
    const { id, config, isOpen } = dialog;

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
        <Sheet key={id} open={isOpen} onOpenChange={handleOpenChange(id)}>
          <SheetContent
            side="bottom"
            className="h-auto max-h-[calc(100vh-64px)] overflow-y-auto gap-0"
            style={{ zIndex: 50 + index }}
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
                {config.actions.map((action, actionIndex) => {
                  const {
                    onClick: _onClick,
                    label,
                    variant,
                    className,
                    ...restProps
                  } = action;
                  return (
                    <Button
                      key={`${action.label}-${actionIndex}`}
                      type="button"
                      variant={variant}
                      onClick={() => handleActionClick(id)(action)}
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
      <Dialog key={id} open={isOpen} onOpenChange={handleOpenChange(id)}>
        <DialogContent
          from={config.from ?? "bottom"}
          showCloseButton={config.showCloseButton ?? false}
          style={{ zIndex: 50 + index }}
          {...commonProps}
        >
          <DialogHeader>
            <DialogTitle>{config.title}</DialogTitle>
            {config.description ? (
              <DialogDescription>{config.description}</DialogDescription>
            ) : (
              <DialogDescription className="sr-only" aria-hidden="true">
                {typeof config.title === "string" ? config.title : ""}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="px-5 text-text-dark">{config.content}</div>

          {config.actions && config.actions.length > 0 && (
            <DialogFooter className="flex-row gap-6 p-6">
              {config.actions.map((action, actionIndex) => {
                const {
                  onClick: _onClick,
                  label,
                  variant,
                  className,
                  ...restProps
                } = action;
                return (
                  <Button
                    key={`${action.label}-${actionIndex}`}
                    type="button"
                    variant={variant ?? "orange"}
                    onClick={() => handleActionClick(id)(action)}
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
      {dialogs.map((dialog, index) => renderDialog(dialog, index))}
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
