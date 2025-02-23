import { cn } from '@/utils/cn';

interface FeatureOverlayProps {
  message?: string;
  className?: string;
  children: React.ReactNode;
}

const FeatureOverlay = ({
  message = '功能尚未開放',
  className,
  children,
}: FeatureOverlayProps) => {
  return (
    <div className="group relative -m-4 p-4 rounded-lg overflow-hidden">
      {children}
      <div
        className={cn(
          'opacity-0 group-hover:opacity-80 transition-opacity duration-300',
          'absolute inset-0 flex items-center justify-center',
          'bg-black/20 text-white heading-lg',
          className
        )}
      >
        {message}
      </div>
    </div>
  );
};

export default FeatureOverlay;
