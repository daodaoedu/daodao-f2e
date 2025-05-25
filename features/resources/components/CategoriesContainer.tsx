import { CATEGORIES } from '@/constants/category';
import { cn } from '@/utils/cn';
import CategoryCard from './CategoryCard';

interface CategoriesContainerProps {
  className?: string;
  size?: 'sm' | 'md';
  length?: number;
}

export default function CategoriesContainer({
  className,
  size = 'md',
  length = CATEGORIES.length,
}: CategoriesContainerProps) {
  const columnsClassNames = {
    sm: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
    md: 'grid-cols-3 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid gap-6 lg:gap-[1rem_1.5rem]',
        columnsClassNames[size],
        className
      )}
    >
      {CATEGORIES.slice(0, length).map((category) => (
        <CategoryCard key={category.key} category={category} size={size} />
      ))}
    </div>
  );
}
