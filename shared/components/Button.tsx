import { useRef } from 'react';
import { cn } from '@/utils/cn';
import dynamic from 'next/dynamic';

const FaAngleLeft = dynamic(() =>
  import('react-icons/fa6').then((mod) => mod.FaAngleLeft)
);

const FaArrowRight = dynamic(() =>
  import('react-icons/fa6').then((mod) => mod.FaArrowRight)
);

const icons = {
  FaAngleLeft,
  FaArrowRight,
};

export enum ButtonColorEnum {
  Primary = 'primary',
  Tips = 'tips',
  White = 'white',
}

export enum ButtonVariantEnum {
  Solid = 'solid',
  Outline = 'outline',
}

export enum ButtonSizeEnum {
  Small = 'sm',
  Medium = 'md',
}

export enum ButtonAnimationEnum {
  Ripple = 'ripple',
  None = 'none',
}

export interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'disabled'
  > {
  variant?: ButtonVariantEnum | `${ButtonVariantEnum}`;
  color?: ButtonColorEnum | `${ButtonColorEnum}`;
  size?: ButtonSizeEnum | `${ButtonSizeEnum}`;
  animation?: ButtonAnimationEnum | `${ButtonAnimationEnum}`;
  isDisabled?: boolean;
  isSubmit?: boolean;
  prefixIcon?: keyof typeof icons;
  suffixIcon?: keyof typeof icons;
}

function Button({
  children,
  className,
  variant,
  color = ButtonColorEnum.Primary,
  size = ButtonSizeEnum.Medium,
  animation = ButtonAnimationEnum.Ripple,
  isDisabled = false,
  isSubmit = false,
  onClick,
  prefixIcon,
  suffixIcon,
  ...props
}: ButtonProps) {
  const rippleRef = useRef<HTMLDivElement>(null);
  const PrefixIcon = prefixIcon && icons[prefixIcon];
  const SuffixIcon = suffixIcon && icons[suffixIcon];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animation === ButtonAnimationEnum.None) {
      onClick?.(e);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const ripple = document.createElement('span');
    onClick?.(e);
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

  return (
    <button
      type={isSubmit ? 'submit' : 'button'}
      className={cn(
        'relative overflow-hidden rounded-md text-basic-400 hover:text-primary-base',
        (prefixIcon || suffixIcon) && 'flex items-center gap-0.5',
        variant === ButtonVariantEnum.Solid && [
          'rounded-full transition-[box-shadow,color,background-color]',
          color === ButtonColorEnum.Primary &&
            'bg-primary-base text-basic-white hover:shadow-lg hover:shadow-primary-base/20 hover:text-basic-white',
          color === ButtonColorEnum.Tips &&
            'bg-tips text-basic-white hover:shadow-lg hover:shadow-tips/20 hover:text-basic-white',
          color === ButtonColorEnum.White &&
            'bg-basic-white text-primary-darker shadow-lg shadow-basic-200/40 hover:bg-primary-lightest hover:text-basic-white',
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
      )}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {PrefixIcon && (
        <div className={cn(size === ButtonSizeEnum.Small && 'size-4')}>
          <PrefixIcon className={cn(size === ButtonSizeEnum.Small && 'size-4')} />
        </div>
      )}
      {children}
      {SuffixIcon && (
        <div className={cn(size === ButtonSizeEnum.Small && 'size-4')}>
          <SuffixIcon className={cn(size === ButtonSizeEnum.Small && 'size-4')} />
        </div>
      )}
      {animation !== ButtonAnimationEnum.None && (
        <div ref={rippleRef} className="absolute inset-0 pointer-events-none" />
      )}
    </button>
  );
}

export default Button;
