import { cn } from '@/utils/cn';

export const StyledTabContextBox = ({ children, className, ...props }) => (
  <div
    className={cn(
      'border-b border-[#536166] text-[#536166] max-md:w-full',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledPanelBox = ({ children, className, ...props }) => (
  <div
    className={cn(
      'w-[720px] py-10 px-[30px] mt-2.5 max-md:w-full max-md:p-[30px]',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledPanelText = ({ children, className, ...props }) => (
  <div
    className={cn(
      'flex [&>p]:text-[#293a3d] [&>p]:font-medium [&>p]:whitespace-normal [&>p]:min-w-[50px] [&>span]:text-[#536166] [&>span]:text-sm [&>span]:font-normal [&>span]:leading-[140%] [&>span]:ml-3 [&>span]:flex [&>span]:text-left max-md:flex-col max-md:[&>span]:ml-0 max-md:[&>span]:text-left',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
