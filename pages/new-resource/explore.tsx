import type { InferGetStaticPropsType, GetStaticProps } from 'next';
import { useCallback } from 'react';
import SEOConfig, { JsonLdType } from '@/shared/components/SEO';
import {
  ResourceContainer,
  SearchInput,
  SectionTitle,
} from '@/features/resources';
import {
  getNotionDatabase,
  NotionDatabaseResultSchema,
} from '@/services/modules/notion';
import JsonLdFactory from '@/utils/jsonLd';
import { cn } from '@/utils/cn';
import Button from '@/shared/components/Button';
import useSearchParamsManager from '@/hooks/useSearchParamsManager';
import useDebounce from '@/hooks/useDebounce';
import useShadowToggleOnScroll from '@/hooks/useShadowToggleOnScroll';

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
  return <Component className={className}>{children}</Component>;
};

export const getStaticProps = (async () => {
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

  return { props: { data, jsonLd } };
}) satisfies GetStaticProps<{
  data: NotionDatabaseResultSchema;
  jsonLd: JsonLdType;
}>;

export default function ResourceCategoriesPage({
  data,
  jsonLd,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { height, isShowShadow, TriggerElement } = useShadowToggleOnScroll();
  const [getSearchParams, pushState] = useSearchParamsManager();
  const searchParams = getSearchParams();
  const keyword = searchParams?.q;

  const updateSearchQuery = useCallback(
    (value: string) => {
      pushState('q', value);
    },
    [pushState]
  );

  const debouncedUpdateSearch = useDebounce(updateSearchQuery, 500);

  return (
    <>
      <SEOConfig title="多元學習資源列表｜島島阿學" jsonLd={jsonLd} />
      <Section as="div" className="pt-12 px-5 md:px-24">
        <Button
          as="link"
          href="/new-resource"
          prefixIcon="Arrow"
          prefixIconClassName="rotate-180"
          className="mb-3 px-2 -mx-2"
        >
          返回
        </Button>
        <SectionTitle
          as="h1"
          title="所有資源"
          className={cn(keyword && 'hidden')}
        />
      </Section>

      <Section className="pb-11 md:pb-12">
        <TriggerElement />
        <div
          className={cn(
            'sticky z-20 flex justify-between bg-basic-white py-5 px-5 md:py-6 md:px-24',
            isShowShadow && 'shadow-md shadow-basic-black/10'
          )}
          style={{ top: `${height}px` }}
        >
          <SearchInput onChange={debouncedUpdateSearch} />
          <div className="flex gap-3">
            <Button variant="outline" size="sm" color="primary">
              篩選
            </Button>
            <Button variant="outline" size="sm" color="primary">
              最熱門
            </Button>
          </div>
        </div>

        {keyword && (
          <div className="text-basic-500 body-sm px-5 pb-6 md:px-24">
            "{keyword}" 共搜尋到{' '}
            <span className="text-primary-base font-bold">
              {data.results?.length}
            </span>{' '}
            筆
          </div>
        )}

        <ResourceContainer data={data.results} className="px-5 md:px-24" />

        <div className="flex justify-center px-5 pt-6 md:px-24">
          <Button variant="solid" color="primary" size="sm">
            查看更多
          </Button>
        </div>
      </Section>
    </>
  );
}
