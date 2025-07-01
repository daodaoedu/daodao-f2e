import { useRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

import { GACategory, logEvent } from "@/utils/analytics";
import { useAuth, useAuthDispatch } from "./AuthContext";

interface AuthButtonProps extends Omit<ButtonProps, "asChild"> {
  registerCallback?: () => void;
}

export const AuthButton = ({
  onClick,
  registerCallback,
  ...props
}: AuthButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isLoggedIn } = useAuth();
  const { openLoginModal } = useAuthDispatch();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonText = buttonRef.current?.textContent ?? "Unknown Button";

    if (isLoggedIn) {
      onClick?.(event);
    } else {
      logEvent(
        GACategory.User,
        "Auth Button Clicked",
        `Button Text: ${buttonText}`
      );
      openLoginModal({
        successCallback: () => {
          logEvent(
            GACategory.User,
            "Login Success",
            `Button Text: ${buttonText}`
          );
          onClick?.(event);
        },
        registerCallback: () => {
          logEvent(
            GACategory.User,
            "Register Start",
            `Button Text: ${buttonText}`
          );
          registerCallback?.();
        },
      });
    }
  };

  return <Button ref={buttonRef} onClick={handleClick} {...props} />;
};
