import type { InferGetStaticPropsType, GetStaticProps } from 'next';
import SEOConfig, { JsonLdType } from '@/shared/components/SEO';
import { CATEGORIES } from '@/constants/category';
import {
  CardContainer,
  CategoryCard,
  ReflectionCard,
  ResourceCard,
  SearchHero,
  SharerCard,
} from '@/features/resources';
import {
  getNotionDatabase,
  NotionDatabaseResultSchema,
} from '@/services/modules/notion';

export const getStaticProps = (async () => {
  const data = await getNotionDatabase({
    page_size: 4,
  });

  const jsonLd: JsonLdType = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: `學習資源列表`,
        description:
          '「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
        itemListElement: data.results?.map((result, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Course',
            '@id': result.id,
            name: result.properties['資源名稱']?.title[0]?.plain_text ?? '',
            description:
              result.properties['介紹']?.rich_text[0]?.plain_text ?? '',
            url: `https://www.daoedu.tw/resource/${result.id}`,
            image: result.properties['縮圖']?.files[0]?.external?.url ?? '',
            educationalLevel: result.properties['年齡層']?.multi_select.map(
              (age) => age.name
            ),
            educationalUse: result.properties['領域名稱']?.multi_select.map(
              (cat) => cat.name
            ),
            provider: {
              '@type': 'Person',
              name:
                result.properties['創建者']?.multi_select[0]?.name ??
                '島島阿學',
            },
            offers: {
              '@type': 'Offer',
              category: result.properties['費用']?.select?.name ?? '',
              price: result.properties['費用']?.select?.name ?? '',
              priceCurrency: 'TWD',
            },
            hasCourseInstance: {
              '@type': 'CourseInstance',
              courseMode: 'Online',
              courseWorkload: 'PT30M',
            },
          },
        })),
      },
    ],
  };

  return { props: { data, jsonLd } };
}) satisfies GetStaticProps<{
  data: NotionDatabaseResultSchema;
  jsonLd: JsonLdType;
}>;

const SearchPage = ({
  data,
  jsonLd,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  console.log('data', data);
  const reflectionList = [1, 2, 3, 4, 5, 6, 7];
  const sharerList = [1, 2, 3, 4, 5, 6];

  return (
    <>
      <SEOConfig title="多元學習資源列表｜島島阿學" jsonLd={jsonLd} />
      {/* 找資源 banner */}
      <SearchHero />

      {/* 熱門資源, 最新資源, 熱門分類 */}
      <section className="flex flex-col gap-11 p-[2.75rem_1.25rem] md:p-[3rem_7.5rem]">
        <CardContainer
          childWrapperClassName="flex flex-col gap-5"
          title="熱門資源"
          subtitle="探索 所有資源"
        >
          <ResourceCard />
          <ResourceCard />
        </CardContainer>

        <CardContainer
          childWrapperClassName="flex flex-col gap-5"
          title="最新資源"
          subtitle="探索 所有資源"
        >
          <ResourceCard />
          <ResourceCard />
        </CardContainer>

        <CardContainer
          childWrapperClassName="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-[1rem_1.5rem]"
          title="熱門分類"
          subtitle="探索 所有分類"
        >
          {CATEGORIES.slice(0, 8).map((category) => (
            <CategoryCard key={category.key} category={category} />
          ))}
        </CardContainer>
      </section>

      {/* 熱門心得 */}
      <section className="flex flex-col gap-11 p-[2.75rem_1.25rem] md:p-[3rem_7.5rem] bg-primary-palest">
        <CardContainer
          title="熱門心得"
          type="select"
          childWrapperClassName="flex gap-[1.4375rem] overflow-x-scroll pr-5 mr-[-1.25rem] md:pr-0 md:mr-0"
        >
          {reflectionList.map((r) => (
            <ReflectionCard key={r} />
          ))}
        </CardContainer>
      </section>

      {/* 活躍分享者 */}
      <section className="flex flex-col gap-11 p-[2.75rem_1.25rem] md:p-[3rem_7.5rem]">
        <CardContainer
          title="活躍分享者"
          type="select"
          childWrapperClassName="flex gap-[1.4375rem] overflow-x-scroll pr-5 mr-[-1.25rem] md:pr-0 md:mr-0"
        >
          {sharerList.map((s, idx) => (
            <SharerCard key={s} order={idx + 1} />
          ))}
        </CardContainer>
      </section>
    </>
  );
};

export default SearchPage;
