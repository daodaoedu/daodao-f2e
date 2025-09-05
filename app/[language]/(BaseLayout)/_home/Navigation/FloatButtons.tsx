'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';

interface FloatButtonsProps {
  className?: string;
}

export function FloatButtons({ className }: FloatButtonsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const buttons = [
    { label: '客服', icon: '💬', href: '#support' },
    { label: '意見回饋', icon: '📝', href: '#feedback' },
    { label: '回到頂部', icon: '⬆️', href: '#top' },
  ];

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      <div className="flex flex-col items-end space-y-2">
        {isExpanded && (
          <>
            {buttons.map((button) => (
              <a
                key={button.href}
                href={button.href}
                className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <span className="text-lg">{button.icon}</span>
                <span className="text-sm font-medium text-gray-700">{button.label}</span>
              </a>
            ))}
          </>
        )}
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 bg-primary rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
        >
          <span className="text-white text-2xl">
            {isExpanded ? '✕' : '➕'}
          </span>
        </button>
      </div>
    </div>
  );
}
