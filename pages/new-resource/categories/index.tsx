import type { InferGetStaticPropsType, GetStaticProps } from "next";
import SEOConfig, { JsonLdType } from "@/shared/components/SEO";
import {
  CategoriesContainer,
  createResourceJsonLd,
  ResourceContainer,
  SearchForm,
  SectionTitle,
} from "@/features/resources";
import {
  getNotionDatabase,
  NotionDatabaseResultSchema,
} from "@/services/notion";
import JsonLdFactory from "@/utils/jsonLd";
import { cn } from "@/utils/cn";
import { Button } from "@/components/atoms/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/atoms/breadcrumb";

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
  const data = await getNotionDatabase({
    page_size: 16,
  });

  const coursesJsonLd = data.results?.slice(0, 4).map(createResourceJsonLd);

  const jsonLd = JsonLdFactory.createGraph([
    JsonLdFactory.createItemListBuilder()
      .setName("所有分類")
      .setItems(coursesJsonLd),
  ]);

  return { props: { data, jsonLd } };
}) satisfies GetStaticProps<{
  data: NotionDatabaseResultSchema;
  jsonLd: JsonLdType;
}>;

export default function ResourceCategoriesPage({
  data,
  jsonLd,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const basePath = "/new-resource";

  return (
    <>
      <SEOConfig title="所有分類｜島島阿學" jsonLd={jsonLd} />
      <Section as="div" className="pt-12">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={basePath}>找資源</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`${basePath}/categories`}>
                所有分類
              </BreadcrumbLink>
            </BreadcrumbItem>
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

        <SearchForm />

        <ResourceContainer data={data.results} className="px-5 md:px-24" />

        <div className="flex justify-center px-5 pt-6 md:px-24">
          <Button size="sm">查看更多</Button>
        </div>
      </Section>
    </>
  );
}
