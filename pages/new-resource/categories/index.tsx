import type { InferGetStaticPropsType, GetStaticProps } from "next";
import { SWRConfig } from "swr";
import SEOConfig, { JsonLdType } from "@/shared/components/SEO";
import {
  CategoriesContainer,
  createResourceJsonLd,
  ResourceExplorer,
  SectionTitle,
} from "@/features/resources";
import JsonLdFactory from "@/utils/jsonLd";
import { cn } from "@/utils/cn";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { resourceAPI, ResourceListResponseSchema } from "@/services/resources";

type SectionProps = {
  as?: "section" | "div";
  className?: string;
  children: React.ReactNode;
};

const Section = ({
  as: Component = "section",
  className,
  children,
}: SectionProps) => {
  return (
    <Component className={cn("pb-11 px-5 md:pb-12 md:px-24", className)}>
      {children}
    </Component>
  );
};

export const getStaticProps = (async () => {
  try {
    const data = await resourceAPI.readList();

    const coursesJsonLd = data.resources.slice(0, 4).map(createResourceJsonLd);

    const jsonLd = JsonLdFactory.createGraph([
      JsonLdFactory.createItemListBuilder()
        .setName("所有分類")
        .setItems(coursesJsonLd),
    ]);

    return {
      props: { fallback: { "/new-resource/categories": data }, jsonLd },
    };
  } catch {
    return { props: { fallback: undefined, jsonLd: undefined } };
  }
}) satisfies GetStaticProps<{
  fallback: Record<string, ResourceListResponseSchema> | undefined;
  jsonLd: JsonLdType | undefined;
}>;

export default function ResourceCategoriesPage({
  fallback,
  jsonLd,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const basePath = "/new-resource";

  return (
    <SWRConfig value={{ fallback }}>
      <SEOConfig title="所有分類｜島島阿學" jsonLd={jsonLd} />
      <Section as="div" className="pt-12">
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={basePath}>找資源</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>所有分類</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SectionTitle as="h1" title="所有分類" />
      </Section>

      <Section>
        <CategoriesContainer size="sm" />
      </Section>

      <Section className="relative px-0 md:px-0">
        <SectionTitle title="所有資源" className="pb-0 px-5 md:pb-0 md:px-24" />

        <ResourceExplorer />
      </Section>
    </SWRConfig>
  );
}
