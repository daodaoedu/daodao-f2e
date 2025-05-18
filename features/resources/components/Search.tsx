import { CategoryList } from '@/constants/search';

import CardContainer from './CardContainer';
import CategoryCard from './CategoryCard';
import ResourceCard from './ResourceCard';
import ReflectionCard from './ReflectionCard';
import SharerCard from './SharerCard';
import SearchHero from './SearchHero';

export default function Search() {
  const reflectionList = [1, 2, 3, 4, 5, 6, 7];
  const sharerList = [1, 2, 3, 4, 5, 6];

  const onClickResources = () => {
    console.log('all resources');
  };

  return (
    <>
      {/* 找資源 banner */}
      <section className="relative bg-primary-palest min-h-[17.125rem] md:p-[3rem_7.5rem] md:flex">
        <SearchHero />
      </section>

      {/* 熱門資源, 最新資源, 熱門分類 */}
      <section className="flex flex-col gap-11 p-[2.75rem_1.25rem] md:p-[3rem_7.5rem]">
        <CardContainer
          childWrapperClassName="flex flex-col gap-5"
          title="熱門資源"
          subtitle="探索 所有資源"
          onClickRedirect={onClickResources}
        >
          <ResourceCard />
          <ResourceCard />
        </CardContainer>

        <CardContainer
          childWrapperClassName="flex flex-col gap-5"
          title="最新資源"
          subtitle="探索 所有資源"
          onClickRedirect={onClickResources}
        >
          <ResourceCard />
          <ResourceCard />
        </CardContainer>

        <CardContainer
          childWrapperClassName="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-[1rem_1.5rem]"
          title="熱門分類"
          subtitle="探索 所有分類"
          onClickRedirect={onClickResources}
        >
          {CategoryList.filter((_, idx) => idx < 8).map((category) => (
            <CategoryCard key={category.title} category={category} />
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
}
