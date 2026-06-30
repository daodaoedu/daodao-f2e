import { getResources } from "@daodao/api";
import bannerImage from "@daodao/assets/images/resource/banner.webp";
import { getTranslations, setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";
import { CategoriesContainer, ResourceBanner, ResourceContainer } from "@/components/resource";
import { HOT_TAGS } from "@/constants/resource";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/resource">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app_product" });

  return {
    title: t("resource_meta_list_title"),
  };
}

export default async function ResourcePage({ params }: PageProps<"/[locale]/resource">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "app_product" });
  const { data: resourceData } = await getResources({ limit: "10" });

  const resources =
    resourceData?.data?.map((resource) => ({
      id: resource.id,
      name: resource.name,
      description: resource.description,
      tags: resource.tags,
      user: resource.user,
      imageUrl: resource.imageUrl,
      createdAt: resource.createdAt,
      level: resource.level,
      reviewCount: resource.reviewCount ?? 0,
      viewCount: resource.viewCount,
    })) ?? [];

  return (
    <div>
      <ResourceBanner
        title={t("resource_banner_title")}
        content={t("resource_banner_content")}
        image={bannerImage}
        hotTags={HOT_TAGS}
      />

      <div className="container py-8">
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">{t("resource_explore_categories")}</h2>
          <CategoriesContainer size="md" maxLength={12} disabledCollapse />
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-bold">{t("resource_latest")}</h2>
          <ResourceContainer data={resources} />
        </section>
      </div>
    </div>
  );
}
