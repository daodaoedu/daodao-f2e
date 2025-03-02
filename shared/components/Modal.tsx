import { useState, useEffect, useId } from 'react';
import { cn } from '@/utils/cn';
import { AiOutlineClose } from 'react-icons/ai';
import Portal from './Portal';
import Button from './Button';

enum ModalSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

export interface ModalProps {
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

    if (isOpen) {
      window.addEventListener('keyup', handleWindowKeyUp);
    }

    return () => window.removeEventListener('keyup', handleWindowKeyUp);
  }, [isOpen, onClose]);

  return (
    (!removeDOM || keepMounted) && (
      <Portal rootId={modalId}>
        <button
          type="button"
          className={cn(
            'fixed inset-0 z-[98] pointer-events-none border-none cursor-default',
            isInitialized && [
              isOpen
                ? 'pointer-events-auto animate-fade-in bg-black/50'
                : 'animate-fade-out',
            ]
          )}
          onClick={hasCloseButton ? undefined : onClose}
          onKeyUp={hasCloseButton ? undefined : handleKeyUp}
          tabIndex={hasCloseButton ? -1 : undefined}
        />
        <div
          className={cn(
            'fixed inset-0 z-[99] flex overflow-y-auto pointer-events-none',
            'transition-opacity opacity-0 ease-in duration-200',
            isInitialized && [
              isOpen
                ? 'animate-fade-in'
                : 'animate-fade-out',
            ]
          )}
        >
          <dialog
            open={!removeDOM}
            className={cn(
              'fixed -bottom-4 p-10 w-full max-h-[80%] pointer-events-auto',
              'rounded-lg bg-white overflow-x-hidden',
              'transition-transform translate-y-full ease-in duration-200',
              size === ModalSize.Small &&
                'sm:relative sm:bottom-auto sm:top-12 sm:max-w-96 sm:max-h-none',
              size === ModalSize.Medium &&
                'md:relative md:bottom-auto md:top-12 md:max-w-screen-md md:max-h-none',
              size === ModalSize.Large &&
                'lg:relative lg:bottom-auto lg:top-12 lg:max-w-screen-lg lg:max-h-none',
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
