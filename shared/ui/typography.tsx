import { cn } from '@/utils/cn';

interface TypographyProps<Size = string>
  extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  size?: Size;
}

const titleVariants = {
  xl: 'heading-xl',
  lg: 'heading-lg',
  md: 'heading-md',
  sm: 'heading-sm',
};

export const Title = ({
  children,
  as = 'h2',
  size = 'lg',
  className,
  ...props
}: TypographyProps<keyof typeof titleVariants>) => {
  const Comp = as;
  return (
    <Comp className={cn(titleVariants[size], className)} {...props}>
      {children}
    </Comp>
  );
};

const textVariants = {
  lg: 'body-lg',
  md: 'body-md',
  sm: 'body-sm',
};

export const Text = ({
  children,
  as = 'p',
  size = 'md',
  className,
  ...props
}: TypographyProps<keyof typeof textVariants>) => {
  const Comp = as;
  return (
    <Comp className={cn(textVariants[size], className)} {...props}>
      {children}
    </Comp>
  );
};
