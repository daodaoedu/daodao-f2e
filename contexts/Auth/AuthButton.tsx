import { useEffect, useRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

import { useAuth, useAuthDispatch } from "./AuthContext";

type AuthButtonProps = ButtonProps;

export const AuthButton = ({ onClick, ...props }: AuthButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isClickedRef = useRef(false);
  const { isLoggedIn } = useAuth();
  const { openLoginModal } = useAuthDispatch();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLoggedIn) {
      event.preventDefault();
      openLoginModal();
      isClickedRef.current = true;
      return;
    }

    onClick?.(event);
  };

  useEffect(() => {
    if (isClickedRef.current && isLoggedIn) {
      buttonRef.current?.click();
      isClickedRef.current = false;
    }
  }, [isLoggedIn]);

  return <Button ref={buttonRef} onClick={handleClick} {...props} />;
};
