import type { InferGetStaticPropsType, GetStaticProps } from 'next';
import { forwardRef, useEffect, useRef, useState } from 'react';
import SEOConfig, { JsonLdType } from '@/shared/components/SEO';
import { CATEGORIES } from '@/constants/category';
import {
  CategoryCard,
  ResourceContainer,
  SectionTitle,
} from '@/features/resources';
import {
  getNotionDatabase,
  NotionDatabaseResultSchema,
} from '@/services/modules/notion';
import JsonLdFactory from '@/utils/jsonLd';
import { cn } from '@/utils/cn';
import ArrowIcon from '@/public/assets/icons/arrow.svg';
import LensIcon from '@/public/assets/icons/lens.svg';
import Button from '@/shared/components/Button';
import { usePromotion } from '@/contexts/Promotion';

type SectionProps = {
  as?: 'section' | 'div';
  className?: string;
  children: React.ReactNode;
};

const Section = forwardRef<HTMLDivElement, SectionProps>(
  ({ as: Component = 'section', className, children }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn('pb-11 px-5 md:pb-12 md:px-24', className)}
      >
        {children}
      </Component>
    );
  }
);

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
  const inputRef = useRef<HTMLInputElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const sectionTitleRef = useRef<HTMLHeadingElement>(null);

  const onClickFocus = () => {
    inputRef.current?.focus();
  };
  const [isShowNavShadow, setIsShowNavShadow] = useState(false);
  const { height, setIsShowShadow: setIsShowHeaderShadow } = usePromotion();

  useEffect(() => {
    const getHeightByRef = (ref: React.RefObject<HTMLElement | null>) => {
      return ref.current?.offsetHeight ?? 0;
    };
    const allHeight =
      getHeightByRef(section1Ref) +
      getHeightByRef(section2Ref) +
      getHeightByRef(sectionTitleRef);

    const handleScroll = () => {
      if (window.scrollY > allHeight) {
        setIsShowNavShadow(true);
        setIsShowHeaderShadow(false);
      } else {
        setIsShowNavShadow(false);
        setIsShowHeaderShadow(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [height]);

  return (
    <>
      <SEOConfig title="多元學習資源列表｜島島阿學" jsonLd={jsonLd} />
      <Section ref={section1Ref} as="div" className="pt-12">
        <div className="mb-3 flex items-center gap-2 text-basic-400">
          <span>找資源</span>
          <ArrowIcon />
          <span>所有分類</span>
        </div>
        <SectionTitle as="h1" title="所有分類" />
      </Section>

      <Section ref={section2Ref}>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6 lg:gap-[1rem_1.5rem]">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.key} category={category} size="sm" />
          ))}
        </div>
      </Section>

      {/* 熱門資源, 最新資源, 熱門分類 */}
      <Section className="px-0 md:px-0">
        <SectionTitle
          ref={sectionTitleRef}
          title="所有資源"
          className="pb-0 px-5 md:pb-0 md:px-24"
        />

        <div
          className={cn(
            'sticky z-20 flex justify-between bg-basic-white py-5 px-5 md:py-6 md:px-24',
            isShowNavShadow && 'shadow-md shadow-basic-black/10'
          )}
          style={{ top: `${height}px` }}
        >
          {/* 搜尋欄 */}
          <div className="basis-1/2 relative">
            <LensIcon
              className="absolute top-[0.625rem] left-4"
              onClick={onClickFocus}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="想找什麼資源..."
              className="h-10 w-full rounded-lg border-[#DBDBDB] border flex items-center justify-center p-[0_1rem_0_2.75rem]"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" color="primary">
              篩選
            </Button>
            <Button variant="outline" size="sm" color="primary">
              最熱門
            </Button>
          </div>
        </div>

        <ResourceContainer data={data.results} className="px-5 md:px-24" />
      </Section>
    </>
  );
}
