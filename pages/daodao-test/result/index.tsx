import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import SEOConfig from "@/shared/components/SEO";
import { Button } from "@/components/ui/button";
import HorizontalLogoSvg from "@/public/horizontal-logo.svg";
import VerticalLogoSvg from "@/public/vertical-logo.svg";
import { cn } from "@/utils/cn";
import { AuthButton } from "@/contexts/Auth";
import {
  getDaodaoTestLayout,
  themeMap,
  useDaodaoTest,
  Title,
  ResultChart,
  useResultStyles,
  Slogan,
  List,
} from "@/features/daodao-test";
import FacebookSvg from "@/public/assets/daodao-test/socials-logos/facebook.svg";
import LineSvg from "@/public/assets/daodao-test/socials-logos/line.svg";
import LinkedInSvg from "@/public/assets/daodao-test/socials-logos/linkedin.svg";
import ShareWindowsSvg from "@/public/assets/daodao-test/socials-logos/share_windows.svg";
import ThreadsSvg from "@/public/assets/daodao-test/socials-logos/threads.svg";
import XSvg from "@/public/assets/daodao-test/socials-logos/x.svg";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";

export default function DaodaoTestResultPage() {
  const router = useRouter();
  const { detail, theme, analysis, hasAnalysis } = useDaodaoTest();

  const { rootStyle } = useResultStyles(theme);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAnalysis) {
        router.replace("/daodao-test");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [hasAnalysis, router]);

  if (!hasAnalysis || !detail || !theme) return null;

  return (
    <>
      <SEOConfig title={`${theme.title} | 島島阿學`} />
      <div style={rootStyle}>
        <div className="relative max-w-[392px] mx-auto">
          <main className="p-6 text-xs text-basic-400">
            <header className="mb-1">
              <HorizontalLogoSvg className="h-[22px]" />
            </header>
            <div className="mb-4 flex items-center">
              <div className="flex-1 flex flex-col gap-2">
                <div>我有一個島，它叫...</div>
                <div className="flex gap-1">
                  <h1 className="heading-md leading-relaxed text-[var(--color)]">
                    {theme.title}
                  </h1>
                  <div className="text-white size-7 flex items-center justify-center rounded-full rounded-bl-none bg-[var(--secondary-color)]">
                    {detail.id.toUpperCase()}
                  </div>
                </div>
                <div className="flex gap-2">
                  {detail.tags.map((tag) => (
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
            </div>
            <Slogan>{detail.slogan}</Slogan>
            <div className="mb-4 flex gap-4">
              <div className="basis-[156px] my-2 flex flex-col gap-4">
                <ResultChart
                  analysis={analysis}
                  color={theme.color}
                  className="aspect-[36/35]"
                />
                <div>
                  <Title>島嶼餐桌</Title>
                  <List data={detail.islandDining} />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <Title>島民特質</Title>
                  <p>{detail.characteristics}</p>
                </div>
                <div>
                  <Title>島上風景</Title>
                  <p>{detail.scenery}</p>
                </div>
                <div>
                  <Title>開墾策略</Title>
                  <List data={detail.strategies} />
                </div>
              </div>
            </div>
            <div className="mb-2 font-bold text-base text-center">
              適合一起學習的夥伴
            </div>
            <div className="flex gap-2">
              {detail.partners.map(({ roleId, brief }) => {
                const partnerTheme = themeMap.get(roleId);
                const RoleSvg = partnerTheme?.smallImg;
                if (!RoleSvg) return null;
                return (
                  <div
                    key={roleId}
                    className="basis-1/2 bg-white rounded-md p-3 flex flex-col items-center gap-2"
                  >
                    <RoleSvg />
                    <p className="flex gap-1">
                      <span
                        className="font-bold"
                        style={{ color: partnerTheme.color }}
                      >
                        {partnerTheme.title}
                      </span>
                      <span>{brief}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </main>
          <div
            className={cn(
              "mb-4 relative font-bold text-center text-lg",
              "before:content-[''] before:absolute before:inset-x-0 before:top-1/2 before:-translate-y-1/2",
              "before:border before:border-dashed before:border-[var(--color)] before:opacity-50",
              "after:content-['長按圖片已儲存結果'] after:text-[var(--color)] after:bg-[var(--bg-color)] after:px-3",
              "after:absolute after:left-1/2 after:top-1/2 after:-translate-y-1/2 after:-translate-x-1/2"
            )}
          >
            長按圖片已儲存結果
          </div>
          <div className="px-6 pb-6">
            <div className="mb-3 font-bold body-md text-center">
              分享個人結果到
            </div>
            <div className="mb-4 mx-2 flex justify-between gap-2">
              <Button variant="ghost" size="icon" className="size-12">
                <FacebookSvg />
              </Button>
              <Button variant="ghost" size="icon" className="size-12">
                <ThreadsSvg />
              </Button>
              <Button variant="ghost" size="icon" className="size-12">
                <LinkedInSvg />
              </Button>
              <Button variant="ghost" size="icon" className="size-12">
                <XSvg />
              </Button>
              <Button variant="ghost" size="icon" className="size-12">
                <LineSvg />
              </Button>
              <Button variant="ghost" size="icon" className="size-12">
                <ShareWindowsSvg />
              </Button>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="block w-full mb-4 text-basic-400 border-basic-400 hover:bg-basic-400"
              onClick={() => router.push("/daodao-test")}
            >
              再玩一次
            </Button>
            <AuthButton
              variant="outline"
              size="lg"
              className="block w-full mb-6 text-basic-400 border-basic-400 hover:bg-basic-400"
              onClick={() => router.push(`/daodao-test/result/${detail.id}`)}
            >
              看深度分析
            </AuthButton>
            <footer className="p-6 bg-white rounded-md flex flex-col items-center">
              <h3 className="mb-3 body-lg font-bold">關於島島阿學</h3>
              <VerticalLogoSvg />
              <p className="my-6 body-sm text-center">
                島島阿學以學習資源網站（找資源、找夥伴、找揪團）、社群、學習陪伴計劃等服務，協助學習者克服自主學習時方向不明、無法自律、無合適資源等困難，盼以科技輔助學習社群發展，
                與學習者共創自主學習生態網絡。
              </p>
              <Button className="w-full" size="lg" asChild>
                <Link href="/">前往 島島阿學 自主學習資源平台</Link>
              </Button>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}

DaodaoTestResultPage.getLayout = getDaodaoTestLayout;
