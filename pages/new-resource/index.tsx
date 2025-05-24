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
import JsonLdFactory from '@/utils/jsonLd';

export const getStaticProps = (async () => {
  const data = await getNotionDatabase({
    page_size: 4,
  });

  const coursesJsonLd = data.results?.map((result) =>
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
          {data.results?.slice(2).map((resource) => (
            <ResourceCard
              key={resource.id}
              title={
                resource.properties['資源名稱']?.title[0]?.plain_text ?? ''
              }
              content={
                resource.properties['介紹']?.rich_text[0]?.plain_text ?? ''
              }
              tags={resource.properties['領域名稱']?.multi_select.map(
                (cat) => cat.name
              )}
              userName={
                resource.properties['創建者']?.multi_select[0]?.name ?? ''
              }
              coverImageUrl={resource.properties['縮圖']?.files[0].name ?? ''}
              time={resource.created_time}
              level={resource.properties['年齡層']?.multi_select[0]?.name ?? ''}
              commentCount={0}
            />
          ))}
        </CardContainer>

        <CardContainer
          childWrapperClassName="flex flex-col gap-5"
          title="最新資源"
          subtitle="探索 所有資源"
        >
          {data.results?.slice(0, 2).map((resource) => (
            <ResourceCard
              key={resource.id}
              title={
                resource.properties['資源名稱']?.title[0]?.plain_text ?? ''
              }
              content={
                resource.properties['介紹']?.rich_text[0]?.plain_text ?? ''
              }
              tags={resource.properties['領域名稱']?.multi_select.map(
                (cat) => cat.name
              )}
              userName={
                resource.properties['創建者']?.multi_select[0]?.name ?? ''
              }
              coverImageUrl={resource.properties['縮圖']?.files[0].name ?? ''}
              time={resource.created_time}
              level={resource.properties['年齡層']?.multi_select[0]?.name ?? ''}
              commentCount={0}
            />
          ))}
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
