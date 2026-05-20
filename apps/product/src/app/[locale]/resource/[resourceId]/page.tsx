import { getResourceById } from "@daodao/api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@daodao/ui/components/breadcrumb";
import { getTranslations, setRequestLocale } from "@daodao/i18n/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  parseCategoryHierarchy,
  ResourceDetail,
  ResourceDetailClient,
} from "@/components/resource";

interface ResourceDetailPageProps {
  params: Promise<{
    locale: string;
    resourceId: string;
  }>;
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const { locale, resourceId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "resource" });

  const { data: response, error } = await getResourceById(resourceId);

  if (error || !response?.data) {
    notFound();
  }

  const resource = response.data;

  const [majorCategory, subCategory] = parseCategoryHierarchy([
    resource.majorCategory ?? "",
    resource.subCategory ?? "",
  ]);

  const baseCategoriesUrl = "/resource/categories";

  return (
    <div className="min-h-screen bg-primary-palest">
      <div className="container py-12">
        <Breadcrumb className="mb-5 md:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/resource">{t("find_resources")}</BreadcrumbLink>
            </BreadcrumbItem>
            {majorCategory && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`${baseCategoriesUrl}/${majorCategory.value}`}>
                    {majorCategory.label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {subCategory && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={`${baseCategoriesUrl}/${majorCategory?.value}/${subCategory.value}`}
                  >
                    {subCategory.label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{resource.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ResourceDetail resource={resource} />

        <div className="rounded-xl bg-white shadow">
          <Suspense fallback={null}>
            <ResourceDetailClient resource={resource} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
