import { CSSProperties, useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';

interface SidebarWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function SidebarWrapper({ children, className, style }: SidebarWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const wrapperElement = wrapperRef.current;
      if (!wrapperElement) {
        return;
      }
      if (window.innerWidth > 1023) {
        setContentWidth(0);
        return;
      }
      const widths = Array.from(wrapperElement.children).map(
        (el) => el.clientWidth
      );
      setContentWidth(Math.max(...widths));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={cn(
        'p-0 whitespace-nowrap overflow-x-auto h-max',
        'bg-white rounded-lg shadow-lg shadow-basic-400/10',
        'lg:p-2 lg:shadow-none',
        className
      )}
      style={style}
    >
      <div
        ref={wrapperRef}
        className={cn(
          'flex gap-px lg:flex-col lg:gap-2 lg:w-full',
          '*:grow *:shrink-0 *:basis-[var(--content-width)]'
        )}
        style={{ '--content-width': `${contentWidth}px` } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

export default SidebarWrapper;
