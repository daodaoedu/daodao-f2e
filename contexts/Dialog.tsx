import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import ResponsiveModal, {
  ResponsiveModalProps,
} from "@/components/ui/responsive-modal";
import { cn } from "@/utils/cn";

export interface DialogContentProps {
  close: () => void;
}

export type RenderDialogContent = (
  props: DialogContentProps
) => React.ReactNode;

interface DialogProps
  extends Omit<
    ResponsiveModalProps,
    "children" | "open" | "onClose" | "footer"
  > {
  content: React.ReactNode | RenderDialogContent;
  cancelText?: string;
  cancelBtnProps?: Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "onClick"
  >;
  confirmText?: string;
  confirmBtnProps?: Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "onClick"
  >;
  disableFooter?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  className?: string;
}

interface DialogContextType {
  /**
   * 開啟對話框
   * @param props 對話框的屬性
   * @returns 對話框是否被確認
   */
  openDialog: (props: DialogProps) => Promise<boolean>;
}

export const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [dialogs, setDialogs] = useState<DialogProps[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<DialogProps | null>(null);
  const {
    content,
    cancelText,
    cancelBtnProps,
    confirmText,
    confirmBtnProps,
    onCancel,
    onConfirm,
    disableFooter,
    className,
    ...restDialogProps
  } = currentDialog || {};

  const handleCloseDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen && dialogs.length > 0) {
      setIsOpen(true);
      setCurrentDialog(dialogs[0]);
      setDialogs(dialogs.slice(1));
    }
  }, [isOpen, dialogs]);

  const openDialog = useCallback(
    async (props: DialogProps) => {
      return new Promise<boolean>((resolve) => {
        const proxyOnConfirm = () => {
          resolve(true);
          handleCloseDialog();
          props.onConfirm?.();
        };
        const proxyOnCancel = () => {
          resolve(false);
          handleCloseDialog();
          props.onCancel?.();
        };
        const newDialog = {
          ...props,
          onConfirm: proxyOnConfirm,
          onCancel: proxyOnCancel,
        };

        if (Array.isArray(dialogs) && dialogs.length > 0) {
          setDialogs((prev) => [...prev, newDialog]);
        } else {
          setIsOpen(true);
          setCurrentDialog(newDialog);
        }
      });
    },
    [dialogs, handleCloseDialog]
  );

  const footer = disableFooter ? null : (
    <div className="flex w-full gap-4">
      <Button
        variant="secondary"
        {...cancelBtnProps}
        className={cn("flex-1", cancelBtnProps?.className)}
        onClick={onCancel}
      >
        {cancelText ?? "關閉"}
      </Button>
      <Button
        variant="default"
        {...confirmBtnProps}
        className={cn("flex-1", confirmBtnProps?.className)}
        onClick={onConfirm}
      >
        {confirmText ?? "確認"}
      </Button>
    </div>
  );

  return (
    <DialogContext.Provider value={{ openDialog }}>
      {children}
      <ResponsiveModal
        open={isOpen}
        onClose={handleCloseDialog}
        footer={footer}
        {...restDialogProps}
      >
        <div className={cn("text-center p-4 pb-0", className)}>
          {typeof content === "function"
            ? content({ close: handleCloseDialog })
            : content}
        </div>
      </ResponsiveModal>
    </DialogContext.Provider>
  );
};
