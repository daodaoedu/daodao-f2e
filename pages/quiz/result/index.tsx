import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { toJpeg } from "html-to-image";
import SEOConfig from "@/shared/components/SEO";
import { Button } from "@/components/ui/button";
import HorizontalLogoSvg from "@/public/horizontal-logo.svg";
import VerticalLogoSvg from "@/public/vertical-logo.svg";
import { AuthButton } from "@/contexts/Auth";
import {
  getQuizLayout,
  themeMap,
  useQuiz,
  Title,
  ResultChart,
  useResultStyles,
  Slogan,
  List,
} from "@/features/quiz";
import FacebookSvg from "@/public/assets/quiz/socials-logos/facebook.svg";
import LineSvg from "@/public/assets/quiz/socials-logos/line.svg";
import LinkedInSvg from "@/public/assets/quiz/socials-logos/linkedin.svg";
import ShareWindowsSvg from "@/public/assets/quiz/socials-logos/share_windows.svg";
import ThreadsSvg from "@/public/assets/quiz/socials-logos/threads.svg";
import XSvg from "@/public/assets/quiz/socials-logos/x.svg";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { useDialog } from "@/contexts/Dialog";
import getShareAPI from "@/utils/getShareAPI";
import getEnv from "@/utils/env";

export default function QuizResultPage() {
  const router = useRouter();
  const { detail, theme, analysis, hasAnalysis } = useQuiz();
  const { rootStyle } = useResultStyles(theme);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const { openDialog } = useDialog();
  const shareAPI = getShareAPI({
    title: "我有一個島，它叫...",
    text: "我有一個島，它叫...",
    url: getEnv().isClientSide ? `${window.location.origin}/quiz` : "",
    hashtag: "#島島阿學",
  });

  const handleOpenDialog = () => {
    openDialog({
      title: "下載分析結果",
      content: theme && (
        <div className="px-10">
          <AspectRatio ratio={9 / 7}>
            <Image src={theme.largeImg} alt={theme.title} fill />
          </AspectRatio>
        </div>
      ),
      cancelText: "取消",
      confirmText: "下載",
      onCancel: () => {
        console.log("cancel");
      },
      onConfirm: async () => {
        if (!mainRef.current || !theme) return;
        const anchor = document.createElement("a");
        try {
          const dataUrl = await toJpeg(mainRef.current, {
            quality: 0.95,
          });
          anchor.href = dataUrl;
          anchor.download = `${theme.title}.jpeg`;
          anchor.click();
        } finally {
          anchor.remove();
        }
      },
    });
  };

  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => {
      handleOpenDialog();
    }, 1000);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = () => {
    handleOpenDialog();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAnalysis) {
        router.replace("/quiz");
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
          <button
            type="button"
            className="border-b border-dashed border-[var(--color)] sm:border"
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <main
              ref={mainRef}
              className="p-6 pb-10 text-xs text-left text-basic-400 [background:var(--bg-image)]"
            >
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
                    <Image
                      src={theme.largeImg}
                      alt={theme.title}
                      fill
                      priority
                    />
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
                  if (!partnerTheme) return null;
                  const { smallImg: SmallImg, title, color } = partnerTheme;
                  return (
                    <div
                      key={roleId}
                      className="basis-1/2 bg-white rounded-md p-3 flex flex-col items-center gap-2"
                    >
                      <SmallImg />
                      <p className="flex gap-1">
                        <span className="font-bold" style={{ color }}>
                          {title}
                        </span>
                        <span>{brief}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </main>
          </button>
          <div className="mb-4 relative -top-4 flex justify-center">
            <div className="px-2 font-bold text-lg text-[var(--color)] bg-[var(--bg-color)]">
              <span className="block sm:hidden">長按上方圖片以儲存結果</span>
              <span className="hidden sm:block">點擊上方圖片以儲存結果</span>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="mb-3 font-bold body-md text-center">
              分享個人結果到
            </div>
            <div className="mb-4 mx-2 flex justify-between gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-12"
                onClick={shareAPI.facebookShare}
              >
                <FacebookSvg />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-12"
                onClick={shareAPI.threadsShare}
              >
                <ThreadsSvg />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-12"
                onClick={shareAPI.linkedinShare}
              >
                <LinkedInSvg />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-12"
                onClick={shareAPI.xShare}
              >
                <XSvg />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-12"
                onClick={shareAPI.lineShare}
              >
                <LineSvg />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-12"
                onClick={shareAPI.nativeShare}
              >
                <ShareWindowsSvg />
              </Button>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="block w-full mb-4 text-basic-400 border-basic-400 hover:bg-basic-400"
              onClick={() => router.push("/quiz")}
            >
              再玩一次
            </Button>
            <AuthButton
              variant="outline"
              size="lg"
              className="block w-full mb-6 text-basic-400 border-basic-400 hover:bg-basic-400"
              onClick={() => router.push(`/quiz/result/${detail.id}`)}
            >
              看深度分析
            </AuthButton>
            <footer className="p-5 bg-white rounded-md flex flex-col items-center">
              <VerticalLogoSvg />
              <p className="my-6 text-sm text-center">
                島島阿學是為「相信學習可以不一樣的人」所打造的學習行動平台。以教育科技與社群，匯集學習經驗、資源、人脈，以及打造個人化學習管理與展現系統，賦予每個人掌控學習旅程的能力。
                這裡，是個人成長與集體智慧交會的所在
              </p>
              <Button className="w-full" size="lg" asChild>
                <Link href="/">前往 島島阿學</Link>
              </Button>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}

QuizResultPage.getLayout = getQuizLayout;
