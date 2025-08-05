import { forwardRef, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';

enum ButtonColorEnum {
  Primary = 'primary',
  Secondary = 'secondary',
  Tips = 'tips',
  Alert = 'alert',
  Gray = 'gray',
  White = 'white',
}

enum ButtonVariantEnum {
  Solid = 'solid',
  Outline = 'outline',
}

enum ButtonSizeEnum {
  Small = 'sm',
  Medium = 'md',
  Icon = 'icon',
}

enum ButtonAnimationEnum {
  Ripple = 'ripple',
  None = 'none',
}

interface BaseButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: ButtonVariantEnum | `${ButtonVariantEnum}`;
  color?: ButtonColorEnum | `${ButtonColorEnum}`;
  size?: ButtonSizeEnum | `${ButtonSizeEnum}`;
  animation?: ButtonAnimationEnum | `${ButtonAnimationEnum}`;
  isDisabled?: boolean;
  checkLogin?: boolean;
  onCheckLoginFailed?: () => void;
}

export interface ButtonProps<AS extends 'button' | 'link' = 'button'>
  extends BaseButtonProps,
    Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      'type' | 'disabled' | 'color' | 'onClick'
    > {
  as?: AS;
  href?: AS extends 'link' ? string : never;
  isSubmit?: AS extends 'button' ? boolean : never;
  onClick?: (
    e: AS extends 'button'
      ? React.MouseEvent<HTMLButtonElement>
      : React.MouseEvent<HTMLAnchorElement>
  ) => void;
}

function Button<AS extends 'button' | 'link' = 'button'>(
  {
    as,
    children,
    className,
    variant,
    color,
    size = ButtonSizeEnum.Medium,
    animation = ButtonAnimationEnum.Ripple,
    isDisabled = false,
    isSubmit,
    onClick,
    href,
    checkLogin = false,
    ...nativeButtonProps
  }: ButtonProps<AS>,
  ref: React.Ref<HTMLButtonElement>
) {
  const { isLoggedIn } = useAuth();
  const { openLoginModal } = useAuthDispatch();
  const rippleRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isDisabled) {
      return;
    }

    if (checkLogin && !isLoggedIn) {
      openLoginModal();
      return;
    }

    onClick?.(
      e as AS extends 'button'
        ? React.MouseEvent<HTMLButtonElement>
        : React.MouseEvent<HTMLAnchorElement>
    );

    if (animation === ButtonAnimationEnum.None) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = cn(
      'absolute size-10 rounded-full bg-basic-black/10 animate-button-ripple',
      variant === ButtonVariantEnum.Solid &&
        color !== ButtonColorEnum.White &&
        'bg-basic-white/40'
    );
    ripple.style.top = `${((e.clientY - rect.top) / rect.height) * 100}%`;
    ripple.style.left = `${((e.clientX - rect.left) / rect.width) * 100}%`;
    rippleRef.current?.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
  };

  const sharedProps = {
    className: cn(
      'relative overflow-hidden rounded-md text-nowrap text-basic-400 hover:text-primary-base',
      variant === ButtonVariantEnum.Solid && [
        'rounded-full border border-solid transition-colors transition-[box-shadow,color,background-color]',
        color === ButtonColorEnum.Primary &&
          'bg-primary-base border-primary-base text-basic-white hover:shadow-lg hover:shadow-primary-base/20 hover:text-basic-white',
        color === ButtonColorEnum.Secondary &&
          'bg-primary-lightest border-primary-lightest text-primary-base hover:shadow-lg hover:shadow-primary-lightest/40 hover:text-primary-base',
        color === ButtonColorEnum.Tips &&
          'bg-tips border-tips text-basic-white hover:shadow-lg hover:shadow-tips/20 hover:text-basic-white',
        color === ButtonColorEnum.Alert &&
          'bg-alert border-alert text-basic-white hover:shadow-lg hover:shadow-alert/20 hover:text-basic-white',
        color === ButtonColorEnum.Gray &&
          'bg-basic-200 border-basic-200 text-basic-300 shadow-lg hover:bg-primary-base hover:border-primary-base hover:text-white',
        color === ButtonColorEnum.White &&
          'bg-basic-white border-basic-white text-primary-darker shadow-lg shadow-basic-200/40 hover:bg-primary-lightest hover:text-primary-darker',
      ],
      variant === ButtonVariantEnum.Outline && [
        'rounded-full border border-solid transition-colors',
        color === ButtonColorEnum.Primary &&
          'border-primary-base text-primary-base hover:bg-primary-base hover:text-basic-white',
      ],
      size === ButtonSizeEnum.Small && 'py-1.5 px-5 body-sm',
      size === ButtonSizeEnum.Medium && 'py-2 px-5 body-md',
      size === ButtonSizeEnum.Icon && 'size-6 flex items-center justify-center',
      isDisabled && 'opacity-50 shadow-none pointer-events-none',
      className
    ),
    onClick: handleClick,
  };

  const content = (
    <>
      {children}
      {animation !== ButtonAnimationEnum.None && (
        <div ref={rippleRef} className="absolute inset-0 pointer-events-none" />
      )}
    </>
  );

  if (as === 'link' && href) {
    return (
      <Link href={href} {...sharedProps}>
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={isSubmit ? 'submit' : 'button'}
      disabled={isDisabled}
      {...sharedProps}
      {...nativeButtonProps}
    >
      {content}
    </button>
  );
}

export default forwardRef(Button);
