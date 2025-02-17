import { useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { cn } from '@/utils/cn';

const FaAngleLeft = dynamic(() =>
  import('react-icons/fa6').then((mod) => mod.FaAngleLeft)
);

const FaArrowRight = dynamic(() =>
  import('react-icons/fa6').then((mod) => mod.FaArrowRight)
);

const MdOutlineEdit = dynamic(() =>
  import('react-icons/md').then((mod) => mod.MdOutlineEdit)
);

const AiOutlineMore = dynamic(() =>
  import('react-icons/ai').then((mod) => mod.AiOutlineMore)
);

const AiOutlineClose = dynamic(() =>
  import('react-icons/ai').then((mod) => mod.AiOutlineClose)
);

const Shell = dynamic(() => import('@/public/assets/icons/shell.svg'));

const Comment = dynamic(() => import('@/public/assets/icons/comment.svg'));

const icons = {
  Comment,
  FaAngleLeft,
  FaArrowRight,
  Shell,
  MdOutlineEdit,
  AiOutlineMore,
  AiOutlineClose,
};

enum ButtonColorEnum {
  Primary = 'primary',
  Secondary = 'secondary',
  Tips = 'tips',
  Alert = 'alert',
  White = 'white',
}

enum ButtonVariantEnum {
  Solid = 'solid',
  Outline = 'outline',
}

enum ButtonSizeEnum {
  Small = 'sm',
  Medium = 'md',
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
  prefixIcon?: keyof typeof icons;
  suffixIcon?: keyof typeof icons;
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

function Button<AS extends 'button' | 'link' = 'button'>({
  as,
  children,
  className,
  variant,
  color = ButtonColorEnum.Primary,
  size = ButtonSizeEnum.Medium,
  animation = ButtonAnimationEnum.Ripple,
  isDisabled = false,
  isSubmit,
  onClick,
  prefixIcon,
  suffixIcon,
  href,
  ...nativeButtonProps
}: ButtonProps<AS>) {
  const rippleRef = useRef<HTMLDivElement>(null);
  const PrefixIcon = prefixIcon && icons[prefixIcon];
  const SuffixIcon = suffixIcon && icons[suffixIcon];

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isDisabled) {
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
      'relative overflow-hidden rounded-md text-basic-400 hover:text-primary-base',
      (prefixIcon || suffixIcon) && 'flex items-center gap-0.5',
      variant === ButtonVariantEnum.Solid && [
        'rounded-full transition-[box-shadow,color,background-color]',
        color === ButtonColorEnum.Primary &&
          'bg-primary-base text-basic-white hover:shadow-lg hover:shadow-primary-base/20 hover:text-basic-white',
        color === ButtonColorEnum.Secondary &&
          'bg-primary-lightest text-primary-base hover:shadow-lg hover:shadow-primary-lightest/40 hover:text-primary-base',
        color === ButtonColorEnum.Tips &&
          'bg-tips text-basic-white hover:shadow-lg hover:shadow-tips/20 hover:text-basic-white',
        color === ButtonColorEnum.Alert &&
          'bg-alert text-basic-white hover:shadow-lg hover:shadow-alert/20 hover:text-basic-white',
        color === ButtonColorEnum.White &&
          'bg-basic-white text-primary-darker shadow-lg shadow-basic-200/40 hover:bg-primary-lightest hover:text-primary-darker',
      ],
      variant === ButtonVariantEnum.Outline && [
        'rounded-full border border-solid transition-colors',
        color === ButtonColorEnum.Primary &&
          'border-primary-base text-primary-base hover:bg-primary-base hover:text-basic-white',
        color === ButtonColorEnum.White &&
          'border-basic-white text-basic-white hover:bg-basic-white hover:text-primary-base',
      ],
      size === ButtonSizeEnum.Small && 'py-1.5 px-5 body-sm',
      size === ButtonSizeEnum.Medium && 'py-2 px-5 body-md',
      isDisabled && 'opacity-50 shadow-none pointer-events-none',
      className
    ),
    onClick: handleClick,
  };

  const iconSize = size === ButtonSizeEnum.Small ? 'size-4' : 'size-5';
  const iconClassName = cn('pointer-events-none', iconSize);

  const content = (
    <>
      {PrefixIcon && (
        <div className={iconClassName}>
          <PrefixIcon className={iconClassName} />
        </div>
      )}
      {children}
      {SuffixIcon && (
        <div className={iconClassName}>
          <SuffixIcon className={iconClassName} />
        </div>
      )}
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
      type={isSubmit ? 'submit' : 'button'}
      disabled={isDisabled}
      {...sharedProps}
      {...nativeButtonProps}
    >
      {content}
    </button>
  );
}

export default Button;
