import type { InferGetStaticPropsType, GetStaticProps } from 'next';
import SEOConfig, { JsonLdType } from '@/shared/components/SEO';
import {
  CategoriesContainer,
  ReflectionCard,
  ResourceContainer,
  SearchHero,
  SectionTitle,
  SharerCard,
} from '@/features/resources';
import {
  getNotionDatabase,
  NotionDatabaseResultSchema,
} from '@/services/modules/notion';
import Carousel from '@/shared/components/Carousel';
import JsonLdFactory from '@/utils/jsonLd';
import { cn } from '@/utils/cn';
import Button from '@/shared/components/Button';

const Section = ({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) => {
  return (
    <section
      className={cn(
        'flex flex-col gap-11 p-[2.75rem_1.25rem] md:p-[3rem_7.5rem]',
        className
      )}
    >
      {children}
    </section>
  );
};

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

export default function ResourcePage({
  data,
  jsonLd,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const reflectionList = [1, 2, 3, 4, 5, 6, 7];
  const sharerList = [1, 2, 3, 4, 5, 6];

  return (
    <>
      <SEOConfig title="多元學習資源列表｜島島阿學" jsonLd={jsonLd} />
      {/* 找資源 banner */}
      <SearchHero />

      {/* 熱門資源, 最新資源, 熱門分類 */}
      <Section>
        <div>
          <SectionTitle title="熱門資源">
            <Button
              as="link"
              href="/new-resource/explore"
              className="body-lg font-medium text-basic-300"
              suffixIcon="Arrow"
            >
              探索 所有資源
            </Button>
          </SectionTitle>
          <ResourceContainer data={data.results?.slice(2)} />
        </div>

        <div>
          <SectionTitle title="最新資源">
            <Button
              as="link"
              href="/new-resource/explore"
              className="body-lg font-medium text-basic-300"
              suffixIcon="Arrow"
            >
              探索 所有資源
            </Button>
          </SectionTitle>
          <ResourceContainer data={data.results?.slice(0, 2)} />
        </div>

        <div>
          <SectionTitle title="熱門分類">
            <Button
              as="link"
              href="/new-resource/categories"
              className="body-lg font-medium text-basic-300"
              suffixIcon="Arrow"
            >
              探索 所有分類
            </Button>
          </SectionTitle>
          <CategoriesContainer length={8} />
        </div>
      </Section>

      {/* 熱門心得 */}
      <Section className="bg-primary-palest">
        <Carousel
          title="熱門心得"
          items={reflectionList}
          titleClassName="text-2xl"
          renderKey={(mentor) => mentor}
          renderItem={(mentor) => <ReflectionCard key={mentor} />}
        />
      </Section>

      {/* 活躍分享者 */}
      <Section>
        <Carousel
          title="活躍分享者"
          items={sharerList}
          titleClassName="text-2xl"
          renderKey={(sharer) => sharer}
          renderItem={(sharer, index) => (
            <SharerCard key={sharer} order={index + 1} />
          )}
        />
      </Section>
    </>
  );
}
