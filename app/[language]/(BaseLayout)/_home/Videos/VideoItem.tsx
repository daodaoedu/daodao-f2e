'use client';

import { cn } from '@/utils/cn';

interface VideoItemProps {
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  videoSrc: string;
  className?: string;
}

export function VideoItem({ title, subtitle, description, tags, videoSrc, className }: VideoItemProps) {
  return (
    <div className={cn('bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow', className)}>
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <div className="text-4xl">🎥</div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2 text-lg">
          {title}
        </h3>
        <p className="text-primary font-medium mb-3">
          {subtitle}
        </p>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {description}
        </p>
        
        <div className="space-y-2">
          {tags.map((tag, index) => (
            <div key={index} className="text-xs text-gray-500">
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
