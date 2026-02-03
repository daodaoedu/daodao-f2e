import type { Metadata } from "next";
import { getResources } from "@daodao/api";
import { ResourceBanner, CategoriesContainer, ResourceContainer } from "@/components/resource";
import { HOT_TAGS } from "@/constants/resource";
import bannerImage from "@daodao/assets/images/resource/banner.webp";

export const metadata: Metadata = {
  title: "多元學習資源列表｜島島阿學",
};

export default async function ResourcePage() {
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
        title="探索多元學習資源"
        content="在這裡，你可以找到各種學習資源，包括線上課程、書籍、工具等，幫助你達成學習目標！"
        image={bannerImage}
        hotTags={HOT_TAGS}
      />

      <div className="container py-8">
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">探索分類</h2>
          <CategoriesContainer size="md" maxLength={12} disabledCollapse />
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-bold">最新資源</h2>
          <ResourceContainer data={resources} />
        </section>
      </div>
    </div>
  );
}
