import { cn } from '@/shared/lib/cn';

export const StyledProfileWrapper = ({ children, className, ...props }) => (
  <div
    className={cn(
      'w-full p-[30px] bg-white rounded-[20px] max-md:w-full max-md:p-4',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledProfileBaseInfo = ({ children, className, ...props }) => (
  <div
    className={cn(
      'flex justify-start items-center',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledProfileTitle = ({ children, className, ...props }) => (
  <div
    className={cn(
      '[&>div]:flex [&>div]:items-center [&>h2]:text-[#536166] [&>h2]:text-lg [&>h2]:font-bold [&>h2]:leading-[120%] [&>h2]:mr-2.5 [&>span]:rounded [&>span]:bg-[#f3f3f3] [&>span]:py-[3px] [&>span]:px-2.5 [&>p]:text-[#92989a] [&>p]:text-sm [&>p]:font-normal [&>p]:leading-[140%]',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledProfileLocation = ({ children, className, ...props }) => (
  <p
    className={cn(
      'mt-3 flex justify-start items-center text-[#536166] text-xs font-medium leading-[140%]',
      className
    )}
    {...props}
  >
    {children}
  </p>
);

export const StyledProfileTag = ({ children, className, ...props }) => (
  <div
    className={cn(
      'mt-6 flex flex-wrap',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledProfileOther = ({ children, className, ...props }) => (
  <div
    className={cn(
      'mt-6 flex justify-between items-end max-md:flex-col max-md:items-start',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledProfileSocial = ({ children, className, ...props }) => (
  <ul
    className={cn(
      'flex items-center flex-col items-start [&>li]:items-center [&>li]:flex [&>li]:mr-4 [&>li]:mb-2 [&>li:last-of-type]:mb-0 [&>li>svg]:text-[#16b9b3] [&>li>p]:ml-1.5 [&>li>p]:text-[#293a3d] [&>li>p]:text-xs [&>li>p]:font-normal [&>li>p]:leading-[140%] [&>li>a]:ml-1.5 [&>li>a]:text-[#293a3d] [&>li>a]:text-xs [&>li>a]:font-normal [&>li>a]:leading-[140%] [&>li>a]:text-[#16b9b3] [&>li>a]:cursor-pointer [&>li>a]:underline',
      className
    )}
    {...props}
  >
    {children}
  </ul>
);

export const StyledProfileDate = ({ children, className, ...props }) => (
  <p
    className={cn(
      'text-xs text-[#92989a] font-normal leading-[140%] max-md:w-full max-md:text-right',
      className
    )}
    {...props}
  >
    {children}
  </p>
);
