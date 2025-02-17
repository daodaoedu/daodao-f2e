import { CategoryList } from "@/constants/search";

import { SearchHero } from "@/components/new-search/SearchHero";
import { CardContainer } from "@/components/new-search/CardContainer";
import { ResourceCard } from "@/components/new-search/ResourceCard";
import { CategoryCard } from "@/components/new-search/CategoryCard";
import { ReflectionCard } from "@/components/new-search/ReflectionCard";
import { SharerCard } from "@/components/new-search/SharerCard";

export const NewSearch = () => {
  const reflectionList = [1, 2, 3, 4, 5, 6, 7];
  const sharerList = [1, 2, 3, 4, 5, 6];

  const onClickResources = () => {
    console.log("all resources");
  };

  return (
    <>
      {/* 找資源 banner */}
      <section className="relative bg-primary-palest min-h-[17.125rem] md:p-[3rem_7.5rem] md:flex">
        <SearchHero />
      </section>

      {/* 熱門資源, 最新資源, 熱門分類*/}
      <section className="flex flex-col gap-[2.75rem] p-[2.75rem_1.25rem] md:p-[3rem_7.5rem]">
        <CardContainer
          childWrapperClassName="flex flex-col gap-[1.25rem]"
          title="熱門資源"
          subtitle="探索 所有資源"
          onClickRedirect={onClickResources}
        >
          <ResourceCard />
          <ResourceCard />
        </CardContainer>

        <CardContainer
          childWrapperClassName="flex flex-col gap-[1.25rem]"
          title="最新資源"
          subtitle="探索 所有資源"
          onClickRedirect={onClickResources}
        >
          <ResourceCard />
          <ResourceCard />
        </CardContainer>

        <CardContainer
          childWrapperClassName="grid grid-cols-2 gap-[1.5rem] md:grid-cols-3 lg:grid-cols-4 lg:gap-[1rem_1.5rem]"
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
      <section className="flex flex-col gap-[2.75rem] p-[2.75rem_1.25rem] md:p-[3rem_7.5rem] bg-primary-palest">
        <CardContainer
          title="熱門心得"
          type="select"
          childWrapperClassName="flex gap-[1.4375rem] overflow-x-scroll pr-[1.25rem] mr-[-1.25rem] md:pr-0 md:mr-0"
        >
          {reflectionList.map((r, idx) => {
            return <ReflectionCard key={r} />;
          })}
        </CardContainer>
      </section>

      {/* 活躍分享者 */}
      <section className="flex flex-col gap-[2.75rem] p-[2.75rem_1.25rem] md:p-[3rem_7.5rem]">
        <CardContainer
          title="活躍分享者"
          type="select"
          childWrapperClassName="flex gap-[1.4375rem] overflow-x-scroll pr-[1.25rem] mr-[-1.25rem] md:pr-0 md:mr-0"
        >
          {sharerList.map((s, idx) => {
            return <SharerCard key={idx} order={idx + 1} />;
          })}
        </CardContainer>
      </section>
    </>
  );
};
