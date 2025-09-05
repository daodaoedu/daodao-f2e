'use client';

import { cn } from '@/utils/cn';

interface FunctionCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  action: string;
  className?: string;
}

export function FunctionCard({ title, description, icon, color, action, className }: FunctionCardProps) {
  return (
    <div className={cn('bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1', className)}>
      <div className="p-6">
        <div className="text-center mb-4">
          <div className={`w-16 h-16 rounded-lg ${color} flex items-center justify-center mb-4 mx-auto`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-3">
            {title}
          </div>
        </div>
        
        <div className="text-center mb-6">
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {description}
          </p>
          <div className="flex items-center justify-center text-primary font-medium text-sm">
            {action}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
