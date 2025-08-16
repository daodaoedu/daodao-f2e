import { Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export const FormWrapper = ({ children, ...props }) => (
  <form
    {...props}
    style={{
      '--section-height': 'calc(100vh - 80px)',
      '--section-height-offset': '80px',
    }}
  >
    {children}
  </form>
);

export const ContentWrapper = ({ children, className, ...props }) => (
  <div
    className={cn(
      'flex flex-col justify-center items-center rounded-2xl mx-auto w-[672px] max-md:w-full',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledTitleWrap = ({ children, className, ...props }) => (
  <div
    className={cn(
      'bg-white p-[5%] flex flex-col justify-center items-center w-full rounded-2xl',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledSection = ({ children, className, ...props }) => (
  <div
    className={cn(
      'bg-white p-10 mt-4 w-full rounded-2xl max-md:px-4 max-md:py-8',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledGroup = ({ children, className, mt = '20', ...props }) => (
  <div
    className={cn(
      'flex flex-col justify-center items-start',
      className
    )}
    style={{ marginTop: `${mt}px` }}
    {...props}
  >
    {children}
  </div>
);

export const StyledSelectWrapper = ({ children, className, ...props }) => (
  <div
    className={cn(
      'flex flex-wrap justify-between items-center w-full mt-2.5',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledSelectText = ({ children, className, isselected, ...props }) => (
  <Text
    className={cn(
      'mx-auto',
      isselected === 'true' ? 'font-bold' : 'font-normal',
      className
    )}
    {...props}
  >
    {children}
  </Text>
);

export const StyledSelectBox = ({ children, className, col = '3', isselected, onClick, ...props }) => (
  <button
    type="button"
    className={cn(
      'border rounded-lg p-2.5 flex justify-center items-center cursor-pointer mb-3',
      isselected === 'true'
        ? 'bg-[#DEF5F5] border-[#16B9B3]'
        : 'bg-white border-[#DBDBDB]',
      className
    )}
    style={{ width: `calc(calc(100% - 16px) / ${col})` }}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

export const StyledToggleWrapper = ({ children, className, ...props }) => (
  <div
    className={cn(
      'border border-[#DBDBDB] rounded-lg flex justify-between items-center py-3 px-4',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledToggleText = ({ children, className, ...props }) => (
  <Text
    className={cn(
      'font-medium text-base leading-[140%] text-[#293a3d]',
      className
    )}
    {...props}
  >
    {children}
  </Text>
);

export const StyledButtonGroup = ({ children, className, ...props }) => (
  <div
    className={cn(
      'mt-6 w-full flex',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledButton = ({ children, className, variant = 'contained', ...props }) => (
  <Button
    className={cn(
      'w-full h-10 rounded-[20px] mr-2',
      variant === 'contained' && 'text-white bg-[#16b9b3] hover:bg-[#16b9b3]',
      className
    )}
    {...props}
  >
    {children}
  </Button>
);
