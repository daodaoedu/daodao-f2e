import type { InferGetStaticPropsType, GetStaticProps } from "next";
import { Fragment } from "react";
import { CustomLink } from '@/shared/ui/custom-link';
import SEOConfig from "@/components/SEOConfig";
import { Button } from "@/shared/ui/button";
import { Image } from "@/shared/ui/image";
import HorizontalLogoSvg from "@/public/assets/brand/horizontal-primary-logo.svg";
import {
  getQuizLayout,
  resultDetailMap,
  themeMap,
  Title,
  useResultStyles,
  Slogan,
  List,
} from "@/features/quiz";
import { parseToString } from "@/utils/helper";
import { AspectRatio } from "@/shared/ui/aspect-ratio";
import { Badge } from "@/shared/ui/badge";
import { ProtectedComponent } from "@/features/auth";
import { BackButton } from "@/shared/ui/back-button";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export const getStaticPaths = async () => {
  const languages = ['zh-TW', 'en'];
  const resultIds = ['a', 'c', 'd', 'l', 'o'];

  const paths = languages.flatMap((language) =>
    resultIds.map((resultId) => ({
      params: { language, resultId },
    }))
  );

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

export default function QuizResultDetailPage({
  resultId,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const resultDetail = resultDetailMap.get(resultId ?? "");
  const theme = themeMap.get(resultId ?? "");
  const { rootStyle } = useResultStyles(theme);

  if (!resultDetail || !theme) return null;

  return (
    <ProtectedComponent>
      <SEOConfig title={`${theme.title} | 島島阿學`} />
      <div style={rootStyle}>
        <div className="relative max-w-[392px] mx-auto">
          <main className="p-6 text-sm text-basic-400">
            <header className="mb-1">
              <HorizontalLogoSvg className="h-[22px]" />
            </header>
            <BackButton
              label="返回結果頁"
              className="text-sm font-normal"
              onClick={(router) => router.push("/quiz/result")}
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
            <div className="mb-6 space-y-4 bg-white rounded-md p-4 text-base font-light">
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
                  if (!partnerTheme) return null;
                  const { smallImg: SmallImg, title, color } = partnerTheme;
                  return (
                    <Fragment key={roleId}>
                      <div className="basis-1/2 bg-[var(--bg-color)] rounded-md p-3 flex flex-col items-center gap-2 body-sm">
                        <SmallImg />
                        <p className="flex gap-1">
                          <span className="font-bold" style={{ color }}>
                            {title}
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
                <ul>
                  {resultDetail.recommendedResourceLinks.map(
                    ({ text, link }) => (
                      <li key={text}>
                        <CustomLink
                          href={link}
                          className={cn(
                            "flex justify-between items-start underline mt-2",
                            "text-base font-bold text-basic-400 w-full hover:text-primary-base"
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {text}
                          <SquareArrowOutUpRightIcon
                            size={20}
                            className="text-primary-base shrink-0"
                          />
                        </CustomLink>
                      </li>
                    )
                  )}
                </ul>
              </section>
              <Button className="w-full font-bold" size="lg" asChild>
                <CustomLink
                  href="https://tally.so/r/w71dbZ"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  搶先體驗新功能測試
                </CustomLink>
              </Button>
              <Button
                variant="outline"
                className="w-full font-bold"
                size="lg"
                asChild
              >
                <CustomLink href="/resource" target="_blank">
                  先挖掘更多優質資源！
                </CustomLink>
              </Button>
            </div>
            <footer>
              <h2 className="heading-md mb-4">認識群島好夥伴</h2>
              <ul className="flex flex-wrap gap-4">
                {Array.from(themeMap.values()).map(
                  ({ id, title, color, smallImg: SmallImg }) =>
                    resultId !== id && (
                      <li key={id} className="flex-1 basis-1/3">
                        <CustomLink
                          className="flex flex-col body-base font-bold items-center gap-2 p-3 bg-white rounded-md"
                          style={{ color }}
                          href={`/quiz/result/${id}`}
                        >
                          <SmallImg />
                          {title}
                        </CustomLink>
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

QuizResultDetailPage.getLayout = getQuizLayout;
