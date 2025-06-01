import Modal from '@/shared/components/Modal';
import { Button } from '@/components/atoms/button';

interface ConfirmModalProps {
  title: string;
  isLoading: boolean;
  isOpen: boolean;
  children?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  confirmColor?: "default" | "alert";
  onClose: () => void;
  onConfirm?: () => void;
}

export default function ConfirmModal({
  title,
  isLoading,
  isOpen,
  children,
  cancelText = '取消',
  confirmText = '確認',
  confirmColor = 'default',
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      size="sm"
      className="rounded-2xl"
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
    >
      {children}
      <div className="mt-8 flex justify-center gap-4">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onClose}
        >
          {cancelText}
        </Button>
        {onConfirm && (
          <Button
            variant={confirmColor}
            className="flex-1"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        )}
      </div>
    </Modal>
  );
}
