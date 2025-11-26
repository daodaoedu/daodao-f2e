import { cn } from '@/shared/lib/cn';

export const defaultClass = cn(
  'relative block p-2 px-10 rounded-lg transition-colors cursor-pointer',
  'text-center lg:text-left text-basic-400 body-lg',
  'lg:hover:text-primary-base lg:hover:bg-primary-lightest lg:hover:font-bold',
  'vertical-separator-left first:before:hidden data-[active=true]:before:hidden',
  '[&[data-active="true"]_+_*]:before:hidden lg:before:hidden'
);

export const activeClass = 'text-primary-base bg-primary-lightest font-bold cursor-default';

export const disableClass = 'text-basic-300 bg-transparent font-medium cursor-not-allowed';
