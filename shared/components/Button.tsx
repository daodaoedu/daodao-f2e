import { cn } from '@/utils/cn';

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

export interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'disabled'
  > {
  variant?: ButtonVariantEnum | `${ButtonVariantEnum}`;
  color?: ButtonColorEnum | `${ButtonColorEnum}`;
  size?: ButtonSizeEnum | `${ButtonSizeEnum}`;
  isDisabled?: boolean;
  isSubmit?: boolean;
}

function Button({
  children,
  className,
  variant,
  color = ButtonColorEnum.Primary,
  size = ButtonSizeEnum.Medium,
  isDisabled = false,
  isSubmit = false,
  ...props
}: ButtonProps) {
  return (
    <button
      type={isSubmit ? 'submit' : 'button'}
      className={cn(
        variant === ButtonVariantEnum.Solid && [
          'rounded-full transition-[box-shadow,color,background-color]',
          color === ButtonColorEnum.Primary &&
            'bg-primary-base text-basic-white hover:shadow-lg hover:shadow-primary-base/20',
          color === ButtonColorEnum.Tips &&
            'bg-tips text-basic-white hover:shadow-lg hover:shadow-tips/20',
          color === ButtonColorEnum.White &&
            'bg-basic-white text-primary-darker shadow-lg shadow-basic-200/40 hover:bg-primary-lightest',
        ],
        variant === ButtonVariantEnum.Outline && [
          'rounded-full border border-solid transition-colors',
          color === ButtonColorEnum.Primary &&
            'border-primary-base text-basic-400 hover:bg-primary hover:text-basic-white',
          color === ButtonColorEnum.White &&
            'border-basic-white text-basic-white hover:bg-basic-white hover:text-primary-base',
        ],
        size === ButtonSizeEnum.Small && 'py-1.5 px-5 body-sm',
        size === ButtonSizeEnum.Medium && 'py-2 px-5 body-md',
        isDisabled && 'opacity-50 shadow-none pointer-events-none',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
