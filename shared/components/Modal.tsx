import { useState, useEffect, useId } from 'react';
import { cn } from '@/utils/cn';
import Portal from './Portal';
import { AiOutlineClose } from 'react-icons/ai';
import Button from './Button';

enum ModalSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

interface ModalProps {
  isOpen: boolean;
  title?: string;
  size?: ModalSize | `${ModalSize}`;
  hasCloseButton?: boolean;
  children: React.ReactNode;
  describedby?: string;
  className?: string;
  keepMounted?: boolean;
  onClose: () => void;
  onRemovedDOM?: () => void;
}

function Modal({
  isOpen,
  title,
  size = ModalSize.Small,
  hasCloseButton,
  children,
  describedby,
  className,
  keepMounted = false,
  onClose,
  onRemovedDOM,
}: ModalProps) {
  const id = useId();
  const modalId = `modal-${id}`;
  const [removeDOM, setRemoveDOM] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleKeyUp: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Enter') {
      onClose?.();
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen) {
      document.body.classList.add('overflow-y-hidden');
      setRemoveDOM(false);
      setIsInitialized(true);
    } else {
      timer = setTimeout(() => {
        setRemoveDOM(true);
        onRemovedDOM?.();
      }, 200);
    }

    return () => {
      document.body.classList.remove('overflow-y-hidden');
      clearTimeout(timer);
    };
  }, [isOpen, onRemovedDOM]);

  useEffect(() => {
    const handleWindowKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keyup', handleWindowKeyUp);

    return () => window.removeEventListener('keyup', handleWindowKeyUp);
  }, [onClose]);

  return (
    (!removeDOM || keepMounted) && (
      <Portal rootId={modalId}>
        <div
          className={cn(
            'fixed inset-0 z-[9999] flex items-center justify-center',
            'transition-opacity opacity-0 pointer-events-none ease-in duration-200',
            isInitialized && [
              isOpen
                ? 'pointer-events-auto animate-fade-in'
                : 'animate-fade-out',
            ]
          )}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 border-none cursor-default"
            onClick={hasCloseButton ? undefined : onClose}
            onKeyUp={hasCloseButton ? undefined : handleKeyUp}
            tabIndex={hasCloseButton ? -1 : undefined}
          />
          <dialog
            open={!removeDOM}
            className={cn(
              'fixed -bottom-4 p-10 w-full rounded-lg bg-white',
              'transition-transform translate-y-full ease-in duration-200',
              size === ModalSize.Small && 'sm:bottom-auto sm:max-w-96',
              size === ModalSize.Medium && 'md:bottom-auto md:max-w-screen-md',
              size === ModalSize.Large && 'lg:bottom-auto lg:max-w-screen-lg',
              isOpen ? 'animate-slide-y-in' : 'animate-slide-y-out',
              className
            )}
            aria-labelledby={title ? modalId : undefined}
            aria-describedby={describedby}
          >
            {title && (
              <header
                id={modalId}
                className="text-center heading-md text-basic-400"
              >
                {title}
              </header>
            )}
            {hasCloseButton && (
              <Button
                className="absolute top-2 right-3 px-3 py-2"
                onClick={onClose}
                onKeyUp={handleKeyUp}
              >
                <AiOutlineClose className="size-6" />
              </Button>
            )}
            {children}
          </dialog>
        </div>
      </Portal>
    )
  );
}

export default Modal;
