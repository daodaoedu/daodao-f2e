"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogContentSize,
} from "@/components/atoms/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/atoms/drawer";
import useMediaQuery from "@/hooks/useMediaQuery";

export interface ResponsiveModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hasCloseButton?: boolean;
  size?: DialogContentSize | `${DialogContentSize}`;
  className?: string;
  titleClassName?: string;
}

export const ResponsiveModalSize = DialogContentSize;

export const ResponsiveModal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  hasCloseButton,
  size = DialogContentSize.Small,
  className,
  titleClassName,
}: ResponsiveModalProps) => {
  const { screens } = useMediaQuery();
  const isDialog =
    (size === DialogContentSize.Large && screens.lg) ||
    (size === DialogContentSize.Medium && screens.md) ||
    (size === DialogContentSize.Small && screens.sm);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  if (isDialog) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          hasCloseButton={hasCloseButton}
          size={size}
          className={className}
        >
          {title && (
            <DialogHeader>
              <DialogTitle className={titleClassName}>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}
          {children}
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className={className}>
        {title && (
          <DrawerHeader>
            <DrawerTitle className={titleClassName}>{title}</DrawerTitle>
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
        )}
        {children}
        {footer && <DrawerFooter>{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  );
};

export default ResponsiveModal;
