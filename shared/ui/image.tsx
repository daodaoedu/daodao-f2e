'use client';

import NextImage, { ImageProps as NextImageProps } from 'next/image';
import emptyCoverPng from '@/public/assets/images/empty-cover.png';

export interface ImageProps extends NextImageProps {
  fallbackSrc?: string;
}

export function Image({
  src,
  alt,
  onError,
  fallbackSrc = emptyCoverPng.src,
  ...props
}: ImageProps) {
  return (
    <NextImage
      src={src}
      alt={alt}
      onError={(event) => {
        const target = event.currentTarget;
        target.src = fallbackSrc;
        onError?.(event);
      }}
      {...props}
    />
  );
}
