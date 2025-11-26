'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import type { CommentSectionProps } from './CommentSection';

const LoadingComponent = () => (
  <div className="flex items-center justify-center py-8 text-basic-400">
    <div className="flex items-center gap-2">
      <div className="size-4 animate-spin rounded-full border-2 border-basic-300 border-t-basic-600" />
      <span className="animate-pulse">載入留言中...</span>
    </div>
  </div>
);

const DynamicCommentSection = dynamic(() => import('./CommentSection'), {
  ssr: false,
  loading: LoadingComponent,
});

export const LazyCommentSection = (props: CommentSectionProps) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting && !shouldLoad) {
        setShouldLoad(true);
        observer.disconnect();
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? <DynamicCommentSection {...props} /> : <LoadingComponent />}
    </div>
  );
};
