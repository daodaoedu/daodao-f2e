"use client";

import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { getResourceCategoryLabelKey, type ICategory } from "@/constants/resource";

type CategoryCardProps = {
  category: ICategory;
  size?: "sm" | "md";
  count?: number;
};

const CATEGORIES_BASE_PATH = "/resource/categories";

export function CategoryCard(props: CategoryCardProps) {
  const { category, size = "md", count } = props;
  const { value, image } = category;
  const t = useTranslations("app_product");
  const pathname = usePathname();
  const label = t(getResourceCategoryLabelKey(value));

  const currentPath = pathname?.includes(CATEGORIES_BASE_PATH) ? pathname : CATEGORIES_BASE_PATH;

  return (
    <CustomLink
      key={value}
      href={`${currentPath}/${value}`}
      className={cn(
        "group relative h-[3.75rem] rounded-lg overflow-hidden",
        size === "md" && "md:h-[6.25rem]"
      )}
    >
      <div className="relative h-full w-full">
        <Image
          src={image ?? ""}
          alt={label}
          fill
          className="rounded-lg object-cover transition-transform group-hover:scale-110"
        />
      </div>
      <div
        className={cn(
          "absolute inset-0 w-full p-2 bg-primary-base/50",
          "flex flex-col items-center justify-center text-white",
          "group-hover:scale-110 transition-transform text-center text-balance"
        )}
      >
        <span className="text-xl font-bold">{label}</span>
        {typeof count === "number" && (
          <span className="text-sm opacity-90">
            {t("resource_count", {
              count,
            })}
          </span>
        )}
      </div>
    </CustomLink>
  );
}
