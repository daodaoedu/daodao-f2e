import Image from '@/shared/components/Image';
import { cn } from '@/utils/cn';

type CategoryCardProps = {
  category: { key: string; value: string; label: string; image: string };
  size?: 'sm' | 'md';
};

export default function CategoryCard(props: CategoryCardProps) {
  const { category, size = 'md' } = props;
  const { key, label, image } = category;

  return (
    <div
      key={key}
      className={cn('relative h-[3.75rem]', size === 'md' && 'md:h-[6.25rem]')}
    >
      <Image src={image} alt={label} borderRadius="0.5rem" height="inherit" />
      <div className="absolute inset-0 w-full rounded-lg bg-primary-base bg-opacity-50 flex items-center justify-center text-xl leading-[1.875rem] font-bold text-white md:leading-[1.6875rem] md:font-bold">
        {label}
      </div>
    </div>
  );
}
