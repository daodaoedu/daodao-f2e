import { useState, useEffect, useId } from "react";
import { cn } from "@/utils/cn";
import Portal from "./Portal";

interface ModalProps {
  isOpen: boolean;
  title: string;
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
    if (e.key === "Enter") {
      onClose?.();
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen) {
      document.body.classList.add("overflow-y-hidden");
      setRemoveDOM(false);
      setIsInitialized(true);
    } else {
      timer = setTimeout(() => {
        setRemoveDOM(true);
        onRemovedDOM?.();
      }, 200);
    }

    return () => {
      document.body.classList.remove("overflow-y-hidden");
      clearTimeout(timer);
    };
  }, [isOpen, onRemovedDOM]);

  useEffect(() => {
    const handleWindowKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keyup", handleWindowKeyUp);

    return () => window.removeEventListener("keyup", handleWindowKeyUp);
  }, [onClose]);

  return (
    (!removeDOM || keepMounted) && (
      <Portal rootId={modalId}>
        <div
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center",
            "transition-opacity opacity-0 pointer-events-none ease-in duration-200",
            isInitialized && [
              isOpen
                ? "pointer-events-auto animate-fade-in"
                : "animate-fade-out",
            ]
          )}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 border-none cursor-default"
            onClick={onClose}
            onKeyUp={handleKeyUp}
          />
          <dialog
            open={!removeDOM}
            className={cn(
              "fixed -bottom-4 sm:bottom-auto p-10 w-full sm:max-w-96 rounded-lg bg-white",
              "transition-transform translate-y-full ease-in duration-200",
              isOpen ? "animate-slide-y-in" : "animate-slide-y-out",
              className
            )}
            aria-labelledby={modalId}
            aria-describedby={describedby}
          >
            <header
              id={modalId}
              className="text-center heading-md text-basic-400"
            >
              {title}
            </header>
            {children}
          </dialog>
        </div>
      </Portal>
    )
  );
}

export default Modal;
