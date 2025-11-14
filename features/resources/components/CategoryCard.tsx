import { CustomLink } from '@/shared/ui/custom-link';
import { usePathname } from '@/shared/i18n/navigation';
import { ICategory } from '@/constants/category';
import { Image } from '@/shared/ui/image';
import { cn } from '@/shared/lib/cn';

type CategoryCardProps = {
  category: ICategory;
  size?: 'sm' | 'md';
};

const CATEGORIES_BASE_PATH = '/resource/categories';

export default function CategoryCard(props: CategoryCardProps) {
  const { category, size = 'md' } = props;
  const { value, label, image } = category;
  const pathname = usePathname();

  const currentPath = pathname?.includes(CATEGORIES_BASE_PATH)
    ? pathname
    : CATEGORIES_BASE_PATH;

  return (
    <CustomLink
      key={value}
      href={`${currentPath}/${value}`}
      className={cn(
        'group relative h-[3.75rem] rounded-lg overflow-hidden',
        size === 'md' && 'md:h-[6.25rem]'
      )}
    >
      <div className="relative h-full w-full">
        <Image
          src={image ?? ''}
          alt={label}
          fill
          className="rounded-lg object-cover transition-transform group-hover:scale-110"
        />
      </div>
      <div
        className={cn(
          'absolute inset-0 w-full p-2 bg-primary-base/50',
          'flex items-center justify-center text-xl font-bold text-white',
          'group-hover:scale-110 transition-transform text-center text-balance'
        )}
      >
        {label}
      </div>
    </CustomLink>
  );
}
