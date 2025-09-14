'use client';

import Image from 'next/image';
import { cn } from '@/utils/cn';

interface FunctionCardProps {
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  action: string;
  className?: string;
}

export function FunctionCard({ tag, title, description, imageUrl, action, className }: FunctionCardProps) {
  return (
    <div 
      className={cn(
        'relative bg-white rounded-2xl p-4 flex flex-col gap-4 box-border',
        'flex-shrink-0 h-full w-[280px] min-w-[280px]', // 防止卡片被壓縮，並撐滿高度
        className
      )}
    >
      {/* 標籤 */}
      <div className="absolute top-4 left-4 px-2 py-2 w-21 text-center  rounded-tl-lg rounded-br-lg bg-orange-400 text-white text-xs font-semibold z-10">
        {tag}
      </div>
      
      {/* 圖片 */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100">
        <Image 
          src={imageUrl} 
          alt={title}
          fill
          className="object-cover pointer-events-none select-none"
          draggable={false}
          style={{ WebkitUserDrag: 'none' } as React.CSSProperties}
        />
      </div>
      
      {/* 標題 */}
      <p className="w-full text-teal-800 text-center font-semibold text-xl">
        {title}
      </p>
      
      {/* 描述 */}
      <p className="text-teal-800 m-0 mb-3 leading-relaxed">
        {description}
      </p>
      
      {/* 行動按鈕區域 */}
      <div className="mt-auto flex items-center justify-end gap-2">
        <p className="text-primary-base font-medium">
          {action}
        </p>
        
        <Image 
          src="/assets/landing-page/icon-arrow-right.svg" 
          alt="前往"
          width={16}
          height={16}
          className="pointer-events-none select-none"
          draggable={false}
          style={{ WebkitUserDrag: 'none' } as React.CSSProperties}
          data-preload
        />
      </div>
    </div>
  );
}
