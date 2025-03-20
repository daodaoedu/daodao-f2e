import { useState, useEffect, useId, useRef } from 'react';
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
  title?: React.ReactNode;
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
  const dialogRef = useRef<HTMLDialogElement>(null);
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

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen) {
      timer = setTimeout(() => {
        if (dialogRef.current) {
          dialogRef.current.style.setProperty(
            '--dialog-top',
            `max(calc(100dvh - ${dialogRef.current.clientHeight}px), 20dvh)`
          );
        }
      }, 0);
    }

    return () => clearTimeout(timer);
  }, [isOpen]);

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
            isInitialized && [isOpen ? 'animate-fade-in' : 'animate-fade-out']
          )}
        >
          <dialog
            ref={dialogRef}
            open={!removeDOM}
            className={cn(
              'relative top-[var(--dialog-top)] my-0 p-5 w-full',
              'bg-white rounded-lg pointer-events-auto',
              size === ModalSize.Small &&
                'sm:relative sm:top-12 sm:m-auto sm:p-10 sm:max-w-96',
              size === ModalSize.Medium &&
                'md:relative md:top-12 md:m-auto md:p-10 md:max-w-screen-md',
              size === ModalSize.Large &&
                'lg:relative lg:top-12 lg:m-auto lg:p-10 lg:max-w-screen-lg',
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
            <div
              className={cn(
                'absolute -bottom-1 left-0 right-0 h-3 bg-white',
                size === ModalSize.Small && 'sm:hidden',
                size === ModalSize.Medium && 'md:hidden',
                size === ModalSize.Large && 'lg:hidden'
              )}
            />
          </dialog>
        </div>
      </Portal>
    )
  );
}

export default Modal;
