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
}: FeatureOverlayProps) => (
  <div className="group relative -m-4 overflow-hidden rounded-lg p-4">
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

export default FeatureOverlay;
