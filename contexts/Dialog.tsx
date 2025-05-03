import { createContext, useContext, useState } from 'react';
import Button, { ButtonProps } from '@/shared/components/Button';
import Modal, { ModalProps } from '@/shared/components/Modal';
import { cn } from '@/utils/cn';

interface DialogProps
  extends Omit<ModalProps, 'isOpen' | 'onClose' | 'children'> {
  content: React.ReactNode;
  cancelText?: string;
  cancelBtnProps?: Omit<ButtonProps, 'onClick'>;
  confirmText?: string;
  confirmBtnProps?: Omit<ButtonProps, 'onClick'>;
  onCancel?: () => void;
  onConfirm?: () => void;
}

interface DialogContextType {
  openDialog: (props: DialogProps) => Promise<boolean>;
}

export const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
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
    className,
    ...restDialogProps
  } = currentDialog || {};

  const handleCloseDialog = () => {
    setIsOpen(false);
  };

  const handleToggleDialog = () => {
    if (Array.isArray(dialogs) && dialogs.length > 0) {
      setIsOpen(true);
      setCurrentDialog(dialogs[0]);
      setDialogs(dialogs.slice(1));
    }
  };

  const openDialog = async (props: DialogProps) => {
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
  };

  return (
    <DialogContext.Provider value={{ openDialog }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseDialog}
        onRemovedDOM={handleToggleDialog}
        {...restDialogProps}
        className={cn('text-center', className)}
      >
        {content}
        <div className="flex w-full gap-2 mt-6">
          <Button
            variant="solid"
            color="white"
            {...cancelBtnProps}
            className={cn('flex-1', cancelBtnProps?.className)}
            onClick={onCancel}
          >
            {cancelText ?? '關閉'}
          </Button>
          <Button
            variant="solid"
            color="primary"
            {...confirmBtnProps}
            className={cn('flex-1', confirmBtnProps?.className)}
            onClick={onConfirm}
          >
            {confirmText ?? '確認'}
          </Button>
        </div>
      </Modal>
    </DialogContext.Provider>
  );
};
