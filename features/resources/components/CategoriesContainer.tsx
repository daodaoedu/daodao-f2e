import { CATEGORIES, SEARCH_TAGS } from '@/constants/category';
import { cn } from '@/utils/cn';
import CategoryCard from './CategoryCard';
import SectionTitle from './SectionTitle';

interface CategoriesContainerProps {
  className?: string;
  size?: 'sm' | 'md';
  length?: number;
  selectedCategories?: (keyof typeof SEARCH_TAGS)[] | null;
}

export default function CategoriesContainer({
  className,
  size = 'md',
  length = CATEGORIES.length,
  selectedCategories,
}: CategoriesContainerProps) {
  const columnsClassNames = {
    sm: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
    md: 'grid-cols-3 md:grid-cols-3 lg:grid-cols-4',
  };

  const getCategories = () => {
    if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) {
      return CATEGORIES;
    }
    if (selectedCategories.length === 1) {
      return SEARCH_TAGS[selectedCategories[0]].map((tag) => ({
        key: tag,
        value: tag,
        label: tag,
        image: '',
      }));
    }
    return null;
  };

  const hasSubCategories =
    Array.isArray(selectedCategories) &&
    SEARCH_TAGS[selectedCategories[0]].length > 1;

  const categories = getCategories();

  return (
    Array.isArray(categories) && (
      <div>
        {hasSubCategories && <SectionTitle title="子分類" />}
        <div
          className={cn(
            'grid gap-6 lg:gap-[1rem_1.5rem]',
            columnsClassNames[size],
            className
          )}
        >
          {categories.slice(0, length).map((category) => (
            <CategoryCard key={category.key} category={category} size={size} />
          ))}
        </div>
      </div>
    )
  );
}
