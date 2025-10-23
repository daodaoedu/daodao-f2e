'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button, ButtonProps } from '@/shared/ui/button';
import { cn } from '@/shared/lib/cn';

interface BackButtonProps extends Omit<ButtonProps, 'children' | 'onClick'> {
  label?: string;
  onClick?: (router: ReturnType<typeof useRouter>) => void;
}

export const BackButton = ({
  label,
  className,
  onClick,
  ...props
}: BackButtonProps) => {
  const router = useRouter();
  const handleBack = typeof onClick === 'function' ? onClick : (r: ReturnType<typeof useRouter>) => r.back();

  return (
    <Button
      variant="ghost"
      onClick={() => handleBack(router)}
      className={cn('-mx-2 px-2 text-basic-400', className)}
      {...props}
    >
      <ChevronLeft className="size-7" />
      {label}
    </Button>
  );
};
