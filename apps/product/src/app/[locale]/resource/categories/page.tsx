import { getResources } from "@daodao/api";
import type { Metadata } from "next";
import { CategoriesContainer, ResourceContainer, SectionTitle } from "@/components/resource";

export const metadata: Metadata = {
  title: "所有分類｜島島阿學",
};

export default async function ResourceCategoriesPage() {
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
    <div className="container py-8">
      <SectionTitle as="h1" title="所有分類" />

      <section className="mb-12">
        <CategoriesContainer size="md" />
      </section>

      <section>
        <SectionTitle title="最新資源" />
        <ResourceContainer data={resources} />
      </section>
    </div>
  );
}
