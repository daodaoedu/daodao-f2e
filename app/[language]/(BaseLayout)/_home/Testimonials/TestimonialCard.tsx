'use client';

import Image from 'next/image';
import { cn } from '@/utils/cn';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatar: string;
  className?: string;
}

export function TestimonialCard({ name, role, content, avatar, className }: TestimonialCardProps) {
  return (
    <article 
      className={cn(
        'w-80 min-h-[120px] p-4 rounded-[20px] bg-[#F3FDFF]',
        'grid grid-cols-[72px_1fr] gap-3 items-start',
        'sm:w-[260px] sm:grid-cols-[60px_1fr]',
        className
      )}
    >
      <figure className="m-0 grid justify-items-center">
        <Image 
          src={avatar} 
          alt={`${name} 的頭像`} 
          width={64} 
          height={64} 
          className="w-16 h-16 rounded-full block sm:w-[52px] sm:h-[52px]"
        />
        <figcaption className="mt-1.5 text-[13px] leading-none text-[#225a62] text-center">{name}</figcaption>
      </figure>
      
      <div>
        <p className="m-0 mb-2 text-[15px] leading-[1.5] text-[#13333b]">{content}</p>
        <div className="text-[13px] text-[#3b6b72]">{role}</div>
      </div>
    </article>
  );
}
