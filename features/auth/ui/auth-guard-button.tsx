'use client';

import { useRef } from 'react';
import { Button, type ButtonProps } from '@/shared/ui/button';

import { GACategory, logEvent } from '@/shared/lib/analytics';
import { useSession, useSessionActions } from '@/entities/session';

export const AuthGuardButton = ({ onClick, ...props }: ButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isLoggedIn } = useSession();
  const { openLoginModal } = useSessionActions();

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
      openLoginModal();
    }
  };

  return <Button ref={buttonRef} onClick={handleClick} {...props} />;
};
