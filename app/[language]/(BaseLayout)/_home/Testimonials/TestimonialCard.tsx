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
    <article className={cn('marquee-card', className)}>
      <figure className="avatar">
        <Image 
          src={avatar} 
          alt={`${name} 的頭像`} 
          width={48} 
          height={48} 
        />
        <figcaption className="name">{name}</figcaption>
      </figure>
      
      <div className="content">
        <p className="quote">{content}</p>
        <div className="meta">{role}</div>
      </div>
    </article>
  );
}
