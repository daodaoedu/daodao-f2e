import Image from "@/shared/components/Image";

type CategoryCardProps = {
  category: { title: string; img: string };
};

export const CategoryCard = (props: CategoryCardProps) => {
  const { title, img } = props.category;

  return (
    <div className="relative h-[3.75rem] md:h-[6.25rem]" key={title}>
      <Image src={img} alt={title} borderRadius="0.5rem" height="inherit" />
      <div className="absolute inset-0 w-full rounded-lg bg-primary-base bg-opacity-50 flex items-center justify-center text-[1.25rem] leading-[1.875rem] font-bold text-white md:leading-[1.6875rem] md:font-bold">
        {title}
      </div>
    </div>
  );
};
