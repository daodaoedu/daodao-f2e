'use client';

import { useRef } from 'react';
import { Button, type ButtonProps } from '@/shared/ui/button';

import { GACategory, logEvent } from '@/shared/lib/analytics';
import { useAuth, useAuthDispatch } from '../lib/auth';
import { Callbacks } from '../model/auth.type';

interface AuthButtonProps
  extends Omit<ButtonProps, 'asChild'>,
    Pick<Callbacks, 'registerCallback'> {}

export const AuthButton = ({
  onClick,
  registerCallback,
  ...props
}: AuthButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isLoggedIn } = useAuth();
  const { openLoginModal } = useAuthDispatch();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonText = buttonRef.current?.textContent ?? 'Unknown Button';

    if (isLoggedIn) {
      onClick?.(event);
    } else {
      logEvent(
        GACategory.User,
        'Auth Button Clicked',
        `Button Text: ${buttonText}`
      );
      openLoginModal({
        successCallback: () => {
          logEvent(
            GACategory.User,
            'Login Success',
            `Button Text: ${buttonText}`
          );
          onClick?.(event);
        },
        registerCallback: (callback) => {
          logEvent(
            GACategory.User,
            'Register Start',
            `Button Text: ${buttonText}`
          );
          if (registerCallback) {
            registerCallback(callback);
          } else {
            callback();
          }
        },
      });
    }
  };

  return <Button ref={buttonRef} onClick={handleClick} {...props} />;
};
