import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { SWRConfig } from "swr";
import SEOConfig, { JsonLdType } from "@/shared/components/SEO";
import {
  CategoriesContainer,
  createResourceJsonLd,
  ResourceExplorer,
  SectionTitle,
} from "@/features/resources";
import JsonLdFactory from "@/utils/jsonLd";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { resourceAPI, ResourceListResponseSchema } from "@/services/resources";
import { Container } from "@/components/ui/wrapper";

export const runtime = "experimental-edge";

export const getServerSideProps = (async () => {
  const { data } = await resourceAPI.readList({ limit: 4 });

  const jsonLd = JsonLdFactory.createGraph([
    JsonLdFactory.createItemListBuilder()
      .setName("所有分類")
      .setItems(data.resources.map(createResourceJsonLd)),
  ]);

  return {
    props: { fallback: { "/resource/categories": data }, jsonLd },
  };
}) satisfies GetServerSideProps<{
  fallback: Record<string, ResourceListResponseSchema> | null;
  jsonLd: JsonLdType | null;
}>;

export default function ResourceCategoriesPage({
  fallback,
  jsonLd,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SWRConfig value={{ fallback }}>
      <SEOConfig title="所有分類｜島島阿學" jsonLd={jsonLd} />
      <Container className="pb-12 pt-12">
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/resource">找資源</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>所有分類</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SectionTitle as="h1" title="所有分類" />
      </Container>

      <Container className="pb-12">
        <CategoriesContainer size="sm" />
      </Container>

      <Container className="pb-12 relative px-0 md:px-0">
        <SectionTitle title="所有資源" className="pb-0 px-5 md:pb-0 md:px-24" />

        <ResourceExplorer />
      </Container>
    </SWRConfig>
  );
}
