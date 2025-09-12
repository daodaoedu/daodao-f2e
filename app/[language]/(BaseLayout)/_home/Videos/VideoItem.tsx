'use client';

import { cn } from '@/utils/cn';

interface VideoItemProps {
  title: string;
  subtitle: string;
  tags: string[];
  className?: string;
}

export function VideoItem({ title, subtitle, tags, className }: VideoItemProps) {
  return (
    <div className={cn(
      'py-6 mb-6 w-full md:w-1/2',
      className
    )}>
      <video 
        controls 
        className="aspect-video w-full rounded-[20px]"
        data-preload
      >
        <source />
        <track kind="captions" srcLang="zh-TW" label="繁體中文" />
      </video>
      
      <div className="
        bg-mascot-aqua rounded-[20px] text-primary-darker 
        px-4 py-2 text-center mt-2 mb-5
      ">
        <p className="text-xl font-semibold">
          {title}
          <span className="text-sm pl-2">{subtitle}</span>
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center">
        {tags.map((tag) => (
          <p 
            key={tag} 
            className="
              relative py-1.5 px-3 pl-[30px] bg-basic-white text-primary-darker 
              rounded-[20px] m-1 text-sm
              before:content-[url('/assets/landing-page/icon-check.svg')]
              before:absolute before:top-1/2 before:left-2 before:w-4 before:h-4 before:-translate-y-1/2
            "
          >
            {tag}
          </p>
        ))}
      </div>
    </div>
  );
}
