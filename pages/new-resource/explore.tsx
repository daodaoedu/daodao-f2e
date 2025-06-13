import type { InferGetStaticPropsType, GetStaticProps } from "next";
import { SWRConfig } from "swr";
import Link from "next/link";
import SEOConfig, { JsonLdType } from "@/shared/components/SEO";
import { ChevronLeftIcon } from "lucide-react";
import {
  createResourceJsonLd,
  ResourceExplorer,
  SectionTitle,
} from "@/features/resources";
import JsonLdFactory from "@/utils/jsonLd";
import { cn } from "@/utils/cn";
import useSearchParamsManager from "@/hooks/useSearchParamsManager";
import { Button } from "@/components/ui/button";
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
  return <Component className={className}>{children}</Component>;
};

export const getStaticProps = (async () => {
  try {
    const data = await resourceAPI.readList();

    const coursesJsonLd = data.resources.slice(0, 4).map(createResourceJsonLd);

    const jsonLd = JsonLdFactory.createGraph([
      JsonLdFactory.createItemListBuilder()
        .setName("探索所有資源")
        .setItems(coursesJsonLd),
    ]);

    return {
      props: {
        fallback: {
          "/new-resource/explore": data,
        },
        jsonLd,
      },
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
  const [getSearchParams] = useSearchParamsManager();
  const searchParams = getSearchParams();
  const keyword = searchParams?.q;

  return (
    <SWRConfig value={{ fallback }}>
      <SEOConfig title="探索所有資源｜島島阿學" jsonLd={jsonLd} />
      <Section as="div" className="pt-12 px-5 md:px-24">
        <Button
          variant="link"
          className="mb-3 px-2 -mx-2 text-basic-300"
          asChild
        >
          <Link href="/new-resource">
            <ChevronLeftIcon className="w-4 h-4" />
            返回
          </Link>
        </Button>
        <SectionTitle
          as="h1"
          title="所有資源"
          className={cn(keyword && "hidden")}
        />
      </Section>

      <Section className="pb-11 md:pb-12">
        <ResourceExplorer />
      </Section>
    </SWRConfig>
  );
}
