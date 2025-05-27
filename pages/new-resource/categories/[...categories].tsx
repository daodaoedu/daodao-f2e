import type { InferGetStaticPropsType, GetStaticProps } from 'next';
import SEOConfig, { JsonLdType } from '@/shared/components/SEO';
import {
  CategoriesContainer,
  ResourceContainer,
  ResourceBanner,
  SearchForm,
} from '@/features/resources';
import {
  getNotionDatabase,
  NotionDatabaseResultSchema,
} from '@/services/modules/notion';
import JsonLdFactory from '@/utils/jsonLd';
import { cn } from '@/utils/cn';
import ArrowIcon from '@/public/assets/icons/arrow.svg';
import Button from '@/shared/components/Button';
import { CATEGORIES, SEARCH_TAGS } from '@/constants/category';
import { parseToArray } from '@/services/core';

type SectionProps = {
  as?: 'section' | 'div';
  className?: string;
  children: React.ReactNode;
};

const Section = ({
  as: Component = 'section',
  className,
  children,
}: SectionProps) => {
  return (
    <Component className={cn('px-5 md:px-24', className)}>{children}</Component>
  );
};

export const getStaticPaths = async () => {
  const paths = CATEGORIES.flatMap((category) => [
    {
      params: {
        categories: [category.label],
      },
    },
    ...SEARCH_TAGS[category.label].map((tag) => ({
      params: {
        categories: [category.label, tag],
      },
    })),
  ]);

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = (async (context) => {
  const categories = parseToArray<keyof typeof SEARCH_TAGS>(
    context.params?.categories
  );

  const data = await getNotionDatabase({
    page_size: 16,
  });

  const coursesJsonLd = data.results?.slice(0, 4).map((result) =>
    JsonLdFactory.createCourseBuilder()
      .setId(result.id)
      .setName(result.properties['資源名稱']?.title[0]?.plain_text ?? '')
      .setDescription(result.properties['介紹']?.rich_text[0]?.plain_text ?? '')
      .setUrl(`https://www.daoedu.tw/resource/${result.id}`)
      .setImage(result.properties['縮圖']?.files[0]?.external?.url ?? '')
      .setEducationalLevel(
        result.properties['年齡層']?.multi_select.map((age) => age.name)
      )
      .setEducationalUse(
        result.properties['領域名稱']?.multi_select.map((cat) => cat.name)
      )
      .setProvider(
        'Person',
        result.properties['創建者']?.multi_select[0]?.name ?? '島島阿學'
      )
      .setOffers({
        category: result.properties['費用']?.select?.name ?? '',
        price: result.properties['費用']?.select?.name ?? '',
        priceCurrency: 'TWD',
      })
      .setHasCourseInstance({
        courseMode: 'Online',
        courseWorkload: 'PT30M',
      })
      .build()
  );

  const jsonLd = JsonLdFactory.createGraph([
    JsonLdFactory.createItemListBuilder()
      .setName('學習資源列表')
      .setDescription(
        '「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。'
      )
      .setItems(coursesJsonLd),
  ]);

  return { props: { data, jsonLd, categories } };
}) satisfies GetStaticProps<{
  data: NotionDatabaseResultSchema;
  jsonLd: JsonLdType;
  categories: string[] | null;
}>;

export default function ResourceCategoriesPage({
  data,
  jsonLd,
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <SEOConfig title="多元學習資源列表｜島島阿學" jsonLd={jsonLd} />
      <Section as="div" className="pt-8 mb-3 md:pt-12 md:mb-6">
        <div className="flex items-center gap-2 text-basic-400">
          <Button as="link" href="/new-resource" className="px-2 -mx-2">
            找資源
          </Button>
          <ArrowIcon />
          <Button
            as="link"
            href="/new-resource/categories"
            className="px-2 -mx-2"
          >
            所有分類
          </Button>
          <ArrowIcon />
          {categories?.length === 1 && <span>{categories[0]}</span>}
          {categories?.length === 2 && (
            <>
              <Button
                as="link"
                href={`/new-resource/categories/${categories[0]}`}
                className="px-2 -mx-2"
              >
                {categories[0]}
              </Button>
              <ArrowIcon />
              <span>{categories[1]}</span>
            </>
          )}
        </div>
      </Section>

      <Section className="pb-10">
        <ResourceBanner
          size="md"
          title={categories?.[categories?.length - 1] ?? ''}
          content="測試資料"
          image=""
          length={data.results?.length}
        />
      </Section>

      <Section>
        <CategoriesContainer size="sm" selectedCategories={categories} />
      </Section>

      <Section className="px-0 md:px-0">
        <SearchForm />

        <ResourceContainer data={data.results} className="px-5 md:px-24" />

        <div className="flex justify-center px-5 py-6 md:px-24">
          <Button variant="solid" color="primary" size="sm">
            查看更多
          </Button>
        </div>
      </Section>
    </>
  );
}
