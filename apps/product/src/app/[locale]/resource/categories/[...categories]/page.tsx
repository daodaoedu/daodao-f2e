import bannerImage from "@daodao/assets/images/resource/banner.webp";
import { getTranslations, setRequestLocale } from "@daodao/i18n/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@daodao/ui/components/breadcrumb";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CategoriesContainer,
  parseCategoryHierarchy,
  ResourceBanner,
  ResourceInfiniteContainer,
} from "@/components/resource";
import { getResourceCategoryLabelKey } from "@/constants/resource";

function parseToArray<T>(source: unknown): T[] {
  if (Array.isArray(source)) return source as T[];
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; categories?: string[] }>;
}): Promise<Metadata> {
  const { locale, categories } = await params;
  const t = await getTranslations({ locale, namespace: "app_product" });
  const [majorCategory, subCategory = null] = parseCategoryHierarchy(parseToArray(categories));

  if (!majorCategory) {
    return {
      title: t("resource_meta_category_title"),
    };
  }

  const title = t(getResourceCategoryLabelKey((subCategory ?? majorCategory).value));

  return {
    title: t("resource_meta_category_list_title", { title }),
  };
}

export default async function ResourceCategoriesDetailPage({
  params,
}: {
  params: Promise<{ locale: string; categories?: string[] }>;
}) {
  const { locale, categories } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "app_product" });
  const categoryHierarchy = parseCategoryHierarchy(parseToArray(categories));
  const [majorCategory, subCategory = null] = categoryHierarchy;

  if (!majorCategory) {
    notFound();
  }

  const title = t(getResourceCategoryLabelKey((subCategory ?? majorCategory).value));
  const majorCategoryLabel = t(getResourceCategoryLabelKey(majorCategory.value));
  const subCategoryLabel = subCategory ? t(getResourceCategoryLabelKey(subCategory.value)) : null;

  const baseCategoriesUrl = "/resource/categories";

  return (
    <div>
      <ResourceBanner
        size="md"
        title={title}
        content={t("resource_related_content", { title })}
        image={bannerImage}
      />

      <div className="container py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/resource">{t("resource_find")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {subCategory ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`${baseCategoriesUrl}/${majorCategory.value}`}>
                    {majorCategoryLabel}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{subCategoryLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{majorCategoryLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {!subCategory && (
          <section className="mb-12">
            <CategoriesContainer size="sm" selectedCategories={categoryHierarchy} />
          </section>
        )}

        <section>
          <ResourceInfiniteContainer
            params={{
              majorCategory: majorCategory.value,
              subCategory: subCategory?.value,
              limit: "20",
            }}
          />
        </section>
      </div>
    </div>
  );
}
