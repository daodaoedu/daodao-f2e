import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from '@/shared/components/Image';
import { cn } from '@/utils/cn';

export interface ICategory {
  key: string;
  value: string;
  label: string;
  image: string;
}

type CategoryCardProps = {
  category: ICategory;
  size?: 'sm' | 'md';
};

const CATEGORIES_BASE_PATH = '/new-resource/categories';

export default function CategoryCard(props: CategoryCardProps) {
  const { category, size = 'md' } = props;
  const { key, label, image } = category;
  const pathname = usePathname();

  const currentPath = pathname.includes(CATEGORIES_BASE_PATH)
    ? pathname
    : CATEGORIES_BASE_PATH;

  return (
    <Link
      key={key}
      href={`${currentPath}/${label}`}
      className={cn(
        'group relative h-[3.75rem] rounded-lg overflow-hidden',
        size === 'md' && 'md:h-[6.25rem]'
      )}
    >
      <Image
        src={image}
        alt={label}
        borderRadius="0.5rem"
        height="inherit"
        className="group-hover:scale-110 transition-transform"
      />
      <div
        className={cn(
          'absolute inset-0 w-full bg-primary-base bg-opacity-50',
          'flex items-center justify-center text-xl font-bold text-white',
          'group-hover:scale-110 transition-transform'
        )}
      >
        {label}
      </div>
    </Link>
  );
}
