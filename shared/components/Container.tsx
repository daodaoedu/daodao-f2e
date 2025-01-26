import { cn } from '@/utils/cn';

export enum ContainerBackgroundColor {
  PRIMARY_PALEST = 'bg-primary-palest',
  WHITE = 'bg-basic-white',
}

interface ContainerProps {
  className?: string;
  backgroundColor?: ContainerBackgroundColor | `${ContainerBackgroundColor}`;
  autoMinHeight?: boolean;
  children: React.ReactNode;
}

function Container({
  children,
  className,
  backgroundColor = 'bg-primary-palest',
  autoMinHeight = false,
}: ContainerProps) {
  return (
    <div
      className={cn(
        'pt-5 lg:pt-12',
        autoMinHeight && 'min-h-screen-without-padding-top',
        backgroundColor,
        className
      )}
    >
      {children}
    </div>
  );
}

export default Container;
