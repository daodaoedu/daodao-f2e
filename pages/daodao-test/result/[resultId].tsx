import type { InferGetStaticPropsType, GetStaticProps } from "next";
import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import SEOConfig from "@/shared/components/SEO";
import { Button } from "@/components/ui/button";
import HorizontalLogoSvg from "@/public/horizontal-logo.svg";
import {
  getDaodaoTestLayout,
  resultDetailMap,
  themeMap,
  useDaodaoTest,
  Title,
  ResultChart,
  useResultStyles,
  Slogan,
  List,
} from "@/features/daodao-test";
import { parseToString } from "@/utils/helper";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { ProtectedComponent } from "@/contexts/Auth";
import { BackButton } from "@/components/ui/back-button";

export const getStaticPaths = async () => {
  const paths = ["a", "c", "d", "l", "o"].map((resultId) => ({
    params: { resultId },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = (async (context) => {
  const resultId = parseToString(context.params?.resultId);

  return {
    props: { resultId },
  };
}) satisfies GetStaticProps<{
  resultId?: string | null;
}>;

export default function DaodaoTestResultDetailPage({
  resultId,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { analysis, hasAnalysis, detail } = useDaodaoTest();
  const resultDetail = resultDetailMap.get(resultId ?? "");
  const theme = themeMap.get(resultId ?? "");
  const showSelfAnalysis = hasAnalysis && detail?.id === resultId;
  const { rootStyle } = useResultStyles(theme);

  if (!resultDetail || !theme) return null;

  return (
    <ProtectedComponent>
      <SEOConfig title={`${theme.title} | 島島阿學`} />
      <div style={rootStyle}>
        <div className="relative max-w-[392px] mx-auto">
          <main className="p-6 text-xs text-basic-400">
            <header className="mb-1">
              <HorizontalLogoSvg className="h-[22px]" />
            </header>
            <BackButton
              label="返回結果頁"
              className="text-sm font-normal"
              onClick={(router) => router.push("/daodao-test/result")}
            />
            <h1 className="heading-md mb-3">群島全圖鑑</h1>
            <section className="mb-4 flex items-center">
              <div className="flex-1 flex flex-col gap-2">
                <div>它叫...</div>
                <div className="flex gap-1">
                  <h2 className="heading-md leading-relaxed text-[var(--color)]">
                    {theme.title}
                  </h2>
                  <div className="text-white size-7 flex items-center justify-center rounded-full rounded-bl-none bg-[var(--secondary-color)]">
                    {resultDetail.id.toUpperCase()}
                  </div>
                </div>
                <div className="flex gap-2">
                  {resultDetail.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="px-2 text-xs text-[var(--color)]"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="relative basis-44">
                <AspectRatio ratio={9 / 7}>
                  <Image src={theme.largeImg} alt={theme.title} fill priority />
                </AspectRatio>
              </div>
            </section>
            <Slogan>{resultDetail.slogan}</Slogan>
            <div className="mb-6 space-y-4 bg-white rounded-md p-4">
              <ResultChart
                analysis={showSelfAnalysis ? analysis : theme.analysis}
                color={theme.color}
                className="aspect-[36/35] max-w-[158px] w-full mx-auto"
              />
              <section>
                <Title>島民特質</Title>
                <p>{resultDetail.learningTraits}</p>
              </section>
              <section>
                <Title>開墾方式</Title>
                <List data={resultDetail.learningStrategies} />
              </section>
              <section className="space-y-2">
                <Title>群島好夥伴</Title>
                {resultDetail.partners.map(({ roleId, brief, description }) => {
                  const partnerTheme = themeMap.get(roleId);
                  const RoleSvg = partnerTheme?.smallImg;
                  if (!RoleSvg) return null;
                  return (
                    <Fragment key={roleId}>
                      <div className="basis-1/2 bg-[var(--bg-color)] rounded-md p-3 flex flex-col items-center gap-2 body-sm">
                        <RoleSvg />
                        <p className="flex gap-1">
                          <span
                            className="font-bold"
                            style={{ color: partnerTheme.color }}
                          >
                            {partnerTheme.title}
                          </span>
                          <span className="text-normal">{brief}</span>
                        </p>
                      </div>
                      <p>{description}</p>
                    </Fragment>
                  );
                })}
              </section>
              <section>
                <Title>需要的支持</Title>
                <List data={resultDetail.supportNeeded} />
              </section>
              <section>
                <Title>島嶼餐桌</Title>
                <p>{resultDetail.islandDiningDescription}</p>
              </section>
              <section>
                <Title>推薦資源</Title>
                <p>{resultDetail.recommendedResources}</p>
              </section>
              <Button className="w-full font-bold" size="lg">
                生成主題實踐！開始行動！
              </Button>
              <Button variant="outline" className="w-full font-bold" size="lg">
                找相同分類的夥伴
              </Button>
            </div>
            <footer>
              <h2 className="heading-md mb-4">看更多分類</h2>
              <ul className="flex flex-wrap gap-4">
                {Array.from(themeMap.values()).map(
                  ({ id, title, color, smallImg: RoleSvg }) =>
                    resultId !== id && (
                      <li key={id} className="flex-1 basis-1/3">
                        <Link
                          className="flex flex-col body-sm font-bold items-center gap-2 p-3 bg-white rounded-md"
                          style={{ color }}
                          href={`/daodao-test/result/${id}`}
                        >
                          <RoleSvg />
                          {title}
                        </Link>
                      </li>
                    )
                )}
              </ul>
            </footer>
          </main>
        </div>
      </div>
    </ProtectedComponent>
  );
}

DaodaoTestResultDetailPage.getLayout = getDaodaoTestLayout;
