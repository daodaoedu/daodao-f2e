"use client";

import { Fragment } from "react";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";
import HorizontalLogoSvg from "@daodao/assets/images/brand/horizontal-primary-logo.svg";
import { AspectRatio } from "@daodao/ui/components/aspect-ratio";
import { Badge } from "@daodao/ui/components/badge";
import { BackButton } from "@daodao/ui/components/button";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import { cn } from "@daodao/ui/lib/utils";
import { resultDetailMap } from "../utils/result-detail-map";
import { themeMap } from "../utils/theme-map";
import { useResultStyles } from "../hooks/use-result-styles";
import { Title, Slogan, List } from "./styled";

interface QuizResultDetailProps {
  resultId: string;
}

export const QuizResultDetail = ({
  resultId,
}: QuizResultDetailProps) => {
  const resultDetail = resultDetailMap.get(resultId);
  const theme = themeMap.get(resultId);
  const { rootStyle } = useResultStyles(theme);

  if (!resultDetail || !theme) return null;

  return (
    <div style={rootStyle}>
      <div className="relative mx-auto max-w-[392px]">
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
            <div className="flex flex-1 flex-col gap-2">
              <div>它叫...</div>
              <div className="flex gap-1">
                <h2 className="heading-md leading-relaxed text-[var(--color)]">
                  {theme.title}
                </h2>
                <div className="flex size-7 items-center justify-center rounded-full rounded-bl-none bg-[var(--secondary-color)] text-white">
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
          <div className="mb-6 space-y-4 rounded-md bg-white p-4 text-base font-light">
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
                    <div className="body-sm flex basis-1/2 flex-col items-center gap-2 rounded-md bg-[var(--bg-color)] p-3">
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
                {resultDetail.recommendedResourceLinks.map(({ text, link }) => (
                  <li key={text}>
                    <CustomLink
                      href={link}
                      className={cn(
                        "mt-2 flex items-start justify-between underline",
                        "w-full text-base font-bold text-basic-400 hover:text-primary-base"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {text}
                      <SquareArrowOutUpRightIcon
                        size={20}
                        className="shrink-0 text-primary-base"
                      />
                    </CustomLink>
                  </li>
                ))}
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
                        className="body-base flex flex-col items-center gap-2 rounded-md bg-white p-3 font-bold"
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
  );
};
