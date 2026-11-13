import { serializeBlogJsonLd } from "./seo";
export function BlogJsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeBlogJsonLd(data) }}
    />
  );
}
