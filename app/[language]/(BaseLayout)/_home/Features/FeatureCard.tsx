'use client';

import Image from 'next/image';
import { cn } from '@/utils/cn';

interface FeatureCardProps {
  title: string;
  description: string;
  tag: string;
  image: string;
  details: string[];
  className?: string;
}

export function FeatureCard({ title, description, tag, image, details, className }: FeatureCardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6', className)}>
      <div className="text-center mb-4">
        <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
          {tag}
        </div>
        <div className="mb-4">
          <Image
            src={image}
            alt={title}
            width={200}
            height={300}
            className="mx-auto"
          />
        </div>
        <h4 className="text-xl font-semibold text-gray-900 mb-3">
          {title}
        </h4>
        <p className="text-gray-600 mb-4">
          {description}
        </p>
      </div>
      
      <ul className="space-y-2">
        {details.map((detail) => (
          <li key={detail} className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
            <span className="text-sm text-gray-700">{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
