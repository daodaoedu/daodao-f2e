import React from 'react';
import { cn } from '@/shared/lib/cn';

interface CelebrationMessageProps {
  message: string;
  isVisible: boolean;
}

const CelebrationMessage: React.FC<CelebrationMessageProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
        'py-5 px-8 rounded-xl shadow-2xl text-center max-w-md',
        'bg-white border border-basic-200',
        'animate-fade-in animate-duration-500'
      )}
    >
      <h3 className="text-lg font-semibold text-basic-black">
        {message}
      </h3>
    </div>
  );
};

export default CelebrationMessage;
