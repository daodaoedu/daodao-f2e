import { CustomLink } from '@/shared/ui/custom-link';
import { DropdownMenuItem } from '@/shared/ui/dropdown-menu';
import { Separator } from '@/shared/ui/separator';
import { cn } from '@/shared/lib/cn';

export const StyledText = ({ children, className, lineClamp = '1', color = '#536166', fontSize = '14px', ...props }) => (
  <div
    className={cn(
      'overflow-hidden break-words',
      lineClamp === '1' && 'line-clamp-1',
      lineClamp === '2' && 'line-clamp-2',
      lineClamp === '3' && 'line-clamp-3',
      className
    )}
    style={{
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: lineClamp,
      color,
      fontSize,
    }}
    {...props}
  >
    {children}
  </div>
);

export const StyledTitle = ({ children, className, ...props }) => (
  <h2
    className={cn(
      'text-base font-bold leading-[1.6] mb-1 overflow-hidden text-[#293a3d] line-clamp-1',
      className
    )}
    style={{
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 1,
    }}
    {...props}
  >
    {children}
  </h2>
);

export const StyledFooter = ({ children, className, ...props }) => (
  <footer
    className={cn(
      'flex justify-between items-center',
      className
    )}
    {...props}
  >
    {children}
  </footer>
);

export const StyledTime = ({ children, className, ...props }) => (
  <time
    className={cn(
      'text-xs font-light text-[#92989a]',
      className
    )}
    {...props}
  >
    {children}
  </time>
);

export const StyledFlex = ({ children, className, ...props }) => (
  <div
    className={cn(
      'flex items-center gap-2',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledStatus = ({ children, className, ...props }) => (
  <div
    className={cn(
      'flex items-center w-max text-xs py-1 px-2.5 h-6 bg-[#def5f5] text-[#16b9b3] rounded font-medium gap-1',
      'before:content-[""] before:block before:w-2 before:h-2 before:bg-[#16b9b3] before:rounded-full',
      'finished:bg-[#f3f3f3] finished:text-[#92989a] finished:before:bg-[#92989a]',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledContainer = ({ children, className, ...props }) => (
  <div
    className={cn(
      'flex flex-col justify-around flex-1 px-2.5',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledAreas = ({ children, className, ...props }) => (
  <div
    className={cn(
      'py-1 flex items-center',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledGroupCard = ({ children, className, href, ...props }) => (
  <CustomLink
    href={href}
    className={cn(
      'w-full flex relative bg-white rounded gap-4 max-md:flex-col',
      className
    )}
    {...props}
  >
    {children}
  </CustomLink>
);

export const StyledImageWrapper = ({ children, className, ...props }) => (
  <div
    className={cn(
      'flex-1 overflow-hidden [&>img]:align-middle',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const StyledMenuItem = ({ children, className, ...props }) => (
  <DropdownMenuItem
    className={cn(
      'min-w-[146px]',
      className
    )}
    {...props}
  >
    {children}
  </DropdownMenuItem>
);

export const StyledDivider = ({ className, ...props }) => (
  <Separator
    className={cn(
      'w-full text-black my-[30px] h-0.5',
      className
    )}
    {...props}
  />
);
