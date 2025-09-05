'use client';

import { cn } from '@/utils/cn';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
  className?: string;
}

export function TestimonialCard({ name, role, content, avatar, rating, className }: TestimonialCardProps) {
  return (
    <div className={cn('bg-white p-6 rounded-lg shadow-sm min-w-[300px]', className)}>
      {/* 評分 */}
      <div className="flex items-center mb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              'text-lg',
              index < rating ? 'text-yellow-400' : 'text-gray-300'
            )}
          >
            ★
          </span>
        ))}
      </div>

      {/* 內容 */}
      <p className="text-gray-700 mb-6 leading-relaxed line-clamp-4">
        "{content}"
      </p>

      {/* 用戶資訊 */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
          {name.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-600">{role}</div>
        </div>
      </div>
    </div>
  );
}
