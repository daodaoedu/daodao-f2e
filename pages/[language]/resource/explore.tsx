import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import z from "zod";
import { SWRConfig } from "swr";
import Link from "next/link";
import SEOConfig, { JsonLdType } from "@/components/SEOConfig";
import { ChevronLeftIcon } from "lucide-react";
import {
  createResourceJsonLd,
  ResourceExplorer,
  SectionTitle,
} from "@/features/resources";
import JsonLdFactory from "@/utils/jsonLd";
import { cn } from "@/utils/cn";
import { Button } from "@/shared/ui/button";
import { resourceAPI, ResourceListResponseSchema } from "@/services/resources";
import { Container } from "@/shared/ui/wrapper";
import useQueryState from "@/hooks/useQueryState";

// export const runtime = "experimental-edge";

export const getServerSideProps = (async () => {
  try {
    const { data } = await resourceAPI.readList({ limit: 4 });

    const jsonLd = JsonLdFactory.createGraph([
      JsonLdFactory.createItemListBuilder()
        .setName("探索所有資源")
        .setItems(data.resources.map(createResourceJsonLd)),
    ]);

    return {
      props: {
        fallback: {
          "/resource/explore": data,
        },
        jsonLd,
      },
    };
  } catch {
    return { props: {} };
  }
}) satisfies GetServerSideProps<{
  fallback?: Record<string, ResourceListResponseSchema["data"]>;
  jsonLd?: JsonLdType;
}>;

export default function ResourceCategoriesPage({
  fallback,
  jsonLd,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [filters] = useQueryState(z.object({
    query: z.string(),
  }));
  const keyword = filters.query;

  return (
    <SWRConfig value={{ fallback }}>
      <SEOConfig title="探索所有資源｜島島阿學" jsonLd={jsonLd} />
      <Container className="pt-12">
        <Button
          variant="link"
          className="mb-3 px-2 -mx-2 text-basic-300"
          asChild
        >
          <Link href="/resource">
            <ChevronLeftIcon className="w-4 h-4" />
            返回
          </Link>
        </Button>
        <SectionTitle
          as="h1"
          title="所有資源"
          className={cn(keyword && "hidden")}
        />
      </Container>

      <ResourceExplorer />
    </SWRConfig>
  );
}
