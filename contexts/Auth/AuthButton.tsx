import { Button, type ButtonProps } from "@/components/ui/button";

import { useAuth, useAuthDispatch } from "./AuthContext";

interface AuthButtonProps extends Omit<ButtonProps, "asChild"> {
  registerCallback?: () => void;
}

export const AuthButton = ({
  onClick,
  registerCallback,
  ...props
}: AuthButtonProps) => {
  const { isLoggedIn } = useAuth();
  const { openLoginModal } = useAuthDispatch();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoggedIn) {
      onClick?.(event);
    } else {
      openLoginModal({
        successCallback: () => onClick?.(event),
        registerCallback,
      });
    }
  };

  return <Button onClick={handleClick} {...props} />;
};
