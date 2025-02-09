import Modal from '@/shared/components/Modal';
import Button, { ButtonProps } from '@/shared/components/Button';

interface ConfirmModalProps {
  title: string;
  isLoading: boolean;
  isOpen: boolean;
  children?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  confirmColor?: ButtonProps['color'];
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
  confirmColor = 'primary',
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
          variant="solid"
          color="white"
          className="flex-1"
          onClick={onClose}
        >
          {cancelText}
        </Button>
        {onConfirm && (
          <Button
            variant="solid"
            color={confirmColor}
            className="flex-1"
            onClick={onConfirm}
            isDisabled={isLoading}
          >
            {confirmText}
          </Button>
        )}
      </div>
    </Modal>
  );
}
