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
    <div className={cn('functions-cards-item relative bg-white rounded-2xl w-70 p-4 flex flex-col gap-4 min-w-0 box-border scroll-snap-align-start', className)}>
      <div className="absolute top-4 left-4 px-2 py-2 w-21 text-center rounded-tl-lg bg-orange-400 text-white text-xs font-semibold">
        {tag}
      </div>
      
      <Image 
        src={imageUrl} 
        alt={title}
        width={248}
        height={140}
        className="w-full h-auto aspect-video rounded-2xl object-cover bg-gray-100"
      />
      
      <p className="w-full text-teal-800 text-center font-semibold text-xl">
        {title}
      </p>
      
      <p className="text-teal-800 m-0 mb-3">
        {description}
      </p>
      
      <p className="text-cyan-500 mt-auto mr-6">
        {action}
      </p>
      
      <Image 
        src="/assets/landing-page/icon-arror-right.svg" 
        alt="前往"
        width={16}
        height={16}
        className="absolute bottom-4 right-4"
      />
    </div>
  );
}
