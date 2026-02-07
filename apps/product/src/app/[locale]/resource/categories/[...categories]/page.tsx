import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@daodao/ui/components/breadcrumb";
import {
  CategoriesContainer,
  ResourceBanner,
  ResourceInfiniteContainer,
  parseCategoryHierarchy,
} from "@/components/resource";
import bannerImage from "@daodao/assets/images/resource/banner.webp";

function parseToArray<T>(source: unknown): T[] {
  if (Array.isArray(source)) return source as T[];
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categories?: string[] }>;
}): Promise<Metadata> {
  const { categories } = await params;
  const [majorCategory, subCategory = null] = parseCategoryHierarchy(parseToArray(categories));

  if (!majorCategory) {
    return {
      title: "分類頁面｜島島阿學",
    };
  }

  const title = subCategory?.label ?? majorCategory.label;

  return {
    title: `${title}學習資源列表｜島島阿學`,
  };
}

export default async function ResourceCategoriesDetailPage({
  params,
}: {
  params: Promise<{ categories?: string[] }>;
}) {
  const { categories } = await params;
  const categoryHierarchy = parseCategoryHierarchy(parseToArray(categories));
  const [majorCategory, subCategory = null] = categoryHierarchy;

  if (!majorCategory) {
    notFound();
  }

  const title = subCategory?.label ?? majorCategory.label;

  const baseCategoriesUrl = "/resource/categories";

  return (
    <div>
      <ResourceBanner
        size="md"
        title={title}
        content={`探索 ${title} 相關的學習資源`}
        image={bannerImage}
      />

      <div className="container py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/resource">找資源</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {subCategory ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`${baseCategoriesUrl}/${majorCategory.value}`}>
                    {majorCategory.label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{subCategory.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{majorCategory.label}</BreadcrumbPage>
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
