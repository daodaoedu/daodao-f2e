import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import Portal from "./Portal";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
  keepMounted?: boolean;
  onClose: () => void;
  onRemovedDOM?: () => void;
}

function Modal({
  isOpen,
  title,
  children,
  className,
  keepMounted = false,
  onClose,
  onRemovedDOM,
}: ModalProps) {
  const [removeDOM, setRemoveDOM] = useState(true);

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
      <Portal>
        <div
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center",
            "transition-opacity opacity-0 pointer-events-none ease-in duration-200",
            isOpen && "opacity-100 pointer-events-auto animate-fade-in"
          )}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 border-none cursor-default"
            onClick={onClose}
            onKeyUp={handleKeyUp}
          />
          <div
            className={cn(
              "fixed -bottom-4 sm:bottom-auto p-10 w-full sm:max-w-96 rounded-lg bg-white",
              "transition-transform translate-y-full ease-in duration-200",
              isOpen && "translate-y-0 animate-slide-y-in",
              className
            )}
          >
            <header className="text-center text-2xl font-bold text-basic-400">
              {title}
            </header>
            {children}
          </div>
        </div>
      </Portal>
    )
  );
}

export default Modal;
