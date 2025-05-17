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
  const [dialogElement, setDialogElement] = useState<HTMLDialogElement | null>(
    null
  );
  const modalId = `modal-${id}`;
  const [removeDOM, setRemoveDOM] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleKeyUp: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Enter') {
      onClose?.();
    }
  };

  useEffect(() => {
    const bodyClassNames = [
      'fixed',
      'inset-x-0',
      'min-h-svh',
      'overflow-y-hidden',
      'pointer-events-none',
    ];
    const rootClassNames = [
      'scale-[var(--scale)]',
      'translate-y-4',
      'rounded-lg',
      'overflow-hidden',
    ];
    const { scrollY, innerWidth } = window;
    const { scrollHeight } = document.body;
    const rootElement = document.getElementById('__next');
    let timer: NodeJS.Timeout;

    const checkIsDrawer = () => {
      const windowWidth = window.innerWidth;

      switch (size) {
        case ModalSize.Small:
          return windowWidth < 640;
        case ModalSize.Medium:
          return windowWidth < 768;
        case ModalSize.Large:
          return windowWidth < 1024;
        default:
          return false;
      }
    };

    if (isOpen) {
      document.body.style.setProperty('top', `${scrollY * -1}px`);
      document.body.style.setProperty(
        '--scale',
        `${(innerWidth - 32) / innerWidth}`
      );
      document.body.style.setProperty(
        '--origin',
        `50% ${(scrollY / scrollHeight) * 100}%`
      );
      document.body.classList.add('!bg-basic-black', ...bodyClassNames);
      if (checkIsDrawer()) {
        rootElement?.classList.add(
          'bg-basic-white',
          'transition-[transform,border-radius]',
          'origin-[var(--origin)]',
          'duration-500',
          ...rootClassNames
        );
      }
      setRemoveDOM(false);
      setIsInitialized(true);
    } else {
      timer = setTimeout(() => {
        setRemoveDOM(true);
        onRemovedDOM?.();
        document.body.classList.remove('!bg-basic-black');
        rootElement?.classList.remove('bg-basic-white');
      }, 500);
    }

    return () => {
      document.body.style.removeProperty('top');
      document.body.style.removeProperty('--scale');
      document.body.classList.remove(...bodyClassNames);
      rootElement?.classList.remove(...rootClassNames);

      /**
       * 關閉彈窗後，恢復滾動位置
       */
      if (isOpen) {
        document.documentElement.scrollTo({
          top: scrollY,
          behavior: 'instant',
        });
      }
      clearTimeout(timer);
    };
  }, [isOpen, size]);

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
    const mobileSpacing = 56;
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { height } = entry.contentRect;

        dialogElement?.style.setProperty(
          '--dialog-top',
          `max(calc(100dvh - ${height + mobileSpacing}px), 20dvh)`
        );
      });
    });

    if (dialogElement) {
      observer.observe(dialogElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [dialogElement]);

  return (
    (!removeDOM || keepMounted) && (
      <Portal rootId={modalId}>
        <div
          className={cn(
            'fixed inset-0 z-[99] flex overflow-y-auto pointer-events-none',
            isInitialized && isOpen && 'pointer-events-auto'
          )}
        >
          <button
            type="button"
            className={cn(
              'fixed inset-0 pointer-events-none border-none cursor-default',
              isInitialized && [
                'bg-black/60 duration-500',
                isOpen
                  ? 'pointer-events-auto animate-fade-in'
                  : 'animate-fade-out',
              ]
            )}
            onClick={hasCloseButton ? undefined : onClose}
            onKeyUp={hasCloseButton ? undefined : handleKeyUp}
            tabIndex={hasCloseButton ? -1 : undefined}
          />
          <dialog
            ref={setDialogElement}
            open={!removeDOM}
            className={cn(
              'relative top-[var(--dialog-top)] my-0 p-5 w-full rounded-lg bg-white',
              'pointer-events-auto animate-distance-100dvh duration-500 transition-opacity',
              size === ModalSize.Small &&
                'sm:relative sm:top-12 sm:m-auto sm:p-10 sm:max-w-96',
              size === ModalSize.Medium &&
                'md:relative md:top-12 md:m-auto md:p-10 md:max-w-screen-md',
              size === ModalSize.Large &&
                'lg:relative lg:top-12 lg:m-auto lg:p-10 lg:max-w-screen-lg',
              isOpen
                ? 'animate-slide-y-in opacity-100 pointer-events-auto'
                : 'animate-slide-y-out opacity-0 pointer-events-none',
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
                'absolute -bottom-4 left-0 right-0 h-6 bg-white',
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
