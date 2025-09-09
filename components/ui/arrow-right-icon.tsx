import { cn } from '@/utils/cn';

interface ArrowRightIconProps {
  className?: string;
}

export function ArrowRightIcon({ className }: ArrowRightIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={cn("w-5 h-5", className)}
    >
      <path d="M5 12h14" strokeWidth="2" />
      <path d="M12 5l7 7-7 7" strokeWidth="2" />
    </svg>
  );
}
