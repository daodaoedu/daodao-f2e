import Image from '@/shared/components/Image';

type CategoryCardProps = {
  category: { key: string; value: string; label: string; image: string };
};

export default function CategoryCard(props: CategoryCardProps) {
  const { category } = props;
  const { key, label, image } = category;

  return (
    <div className="relative h-[3.75rem] md:h-[6.25rem]" key={key}>
      <Image src={image} alt={label} borderRadius="0.5rem" height="inherit" />
      <div className="absolute inset-0 w-full rounded-lg bg-primary-base bg-opacity-50 flex items-center justify-center text-xl leading-[1.875rem] font-bold text-white md:leading-[1.6875rem] md:font-bold">
        {label}
      </div>
    </div>
  );
}
