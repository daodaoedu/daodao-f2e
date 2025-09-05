'use client';

import Image from 'next/image';
import { cn } from '@/utils/cn';

interface VideoItemProps {
  title: string;
  subtitle: string;
  tags: string[];
  className?: string;
}

export function VideoItem({ title, subtitle, tags, className }: VideoItemProps) {
  return (
    <div className={cn('video-items', className)}>
      <video controls>
        <source />
        <track kind="captions" srcLang="zh-TW" label="繁體中文" />
      </video>
      
      <div className="video-items-intro">
        <p>{title}<span>{subtitle}</span></p>
      </div>
      
      <div className="video-items-tag">
        {tags.map((tag) => (
          <p key={tag} className="flex items-center">
            <Image 
              src="/assets/landing-page/icon-check.svg" 
              alt="✓" 
              width={16} 
              height={16} 
              className="mr-2"
            />
            {tag}
          </p>
        ))}
      </div>
    </div>
  );
}
