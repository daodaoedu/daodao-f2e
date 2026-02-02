"use client";

import { useAuth } from "@daodao/auth";
import { useRef } from "react";

import { GACategory, logEvent } from "@/shared/lib/analytics";
import { Button, type ButtonProps } from "@/shared/ui/button";

export const AuthGuardButton = ({ onClick, ...props }: ButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isAuthenticated, openLoginDialog } = useAuth();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonText = buttonRef.current?.textContent ?? "Unknown Button";

    if (isAuthenticated) {
      onClick?.(event);
    } else {
      logEvent(GACategory.User, "Auth Button Clicked", `Button Text: ${buttonText}`);
      openLoginDialog();
    }
  };

  return <Button ref={buttonRef} onClick={handleClick} {...props} />;
};
