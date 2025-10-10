import { toast } from "sonner";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import SEOConfig from "@/components/SEOConfig";
import { Button } from "@/shared/ui/button";
import favicon112Png from "@/public/assets/brand/favicon-112.png";
import HorizontalLogoSvg from "@/public/assets/brand/horizontal-primary-logo.svg";
import VerticalLogoSvg from "@/public/assets/brand/vertical-primary-logo.svg";
import { AuthButton } from "@/contexts/Auth";
import {
  getQuizLayout,
  themeMap,
  useQuiz,
  Title,
  useResultStyles,
  Slogan,
  List,
} from "@/features/quiz";

const ResultChart = dynamic(
  () => import("@/features/quiz").then(mod => ({ default: mod.ResultChart })),
  {
    ssr: false,
    loading: () => <div className="aspect-[36/35] animate-pulse bg-gray-100 rounded" />,
  }
);
import FacebookSvg from "@/public/assets/social-icons/facebook.svg";
import LineSvg from "@/public/assets/social-icons/line.svg";
import LinkedInSvg from "@/public/assets/social-icons/linkedin.svg";
import ShareWindowsSvg from "@/public/assets/social-icons/share_windows.svg";
import ThreadsSvg from "@/public/assets/social-icons/threads.svg";
import XSvg from "@/public/assets/social-icons/x.svg";
import { AspectRatio } from "@/shared/ui/aspect-ratio";
import { Badge } from "@/shared/ui/badge";
import getShareAPI from "@/utils/getShareAPI";
import { GACategory, logEvent } from "@/utils/analytics";

interface ResultImg {
  src: string;
  width: number;
  height: number;
}

export default function QuizResultPage() {
  const router = useRouter();
  const [resultImg, setResultImg] = useState<ResultImg | null>(null);
  const { detail, theme, analysis, hasAnalysis } = useQuiz();
  const { rootStyle } = useResultStyles(theme);
  const mainRef = useRef<HTMLDivElement>(null);
  const shareAPI = getShareAPI({
    title: "【我有一個島，它叫＿島】學習風格測驗｜島島阿學",
    text: "【我有一個島，它叫＿島】學習風格測驗｜島島阿學",
    url: "/quiz",
    hashtag: "#島島阿學",
  });

  const handleReplay = () => {
    logEvent(GACategory.User, "Replay Quiz");
    router.push("/quiz");
  };

  const handleViewAnalysis = () => {
    logEvent(GACategory.User, "View Quiz Analysis", `Detail ID: ${detail?.id}`);
    router.push(`/quiz/result/${detail?.id}`);
  };

  const handleImageContextMenu = () => {
    if (!theme) return;
    logEvent(GACategory.User, "Download Result", `Theme: ${theme.title}`);
  };

  const isLoading = !hasAnalysis || !detail || !theme;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAnalysis) {
        router.replace("/quiz");
      }
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [hasAnalysis, router]);

  useEffect(() => {
    const renderResultImg = async () => {
      if (!mainRef.current || isLoading) return;
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 動態載入 html-to-image
        const { toJpeg } = await import('html-to-image');
        const dataUrl = await toJpeg(mainRef.current, {
          quality: 0.95,
          pixelRatio: window.devicePixelRatio,
        });

        setResultImg({
          src: dataUrl,
          width: mainRef.current.clientWidth - 2,
          height: mainRef.current.clientHeight - 2,
        });
      } catch {
        toast.error("圖片渲染失敗");
      }
    };

    const handleResize = () => {
      requestAnimationFrame(renderResultImg);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <>
      <SEOConfig title={`${theme.title} | 島島阿學`} />
      <div style={rootStyle}>
        <div className="relative max-w-[392px] mx-auto">
          <div className="relative border-b border-dashed border-[var(--color)] sm:border">
            <main
              ref={mainRef}
              className="p-6 pb-10 text-sm text-left text-basic-400 [background:var(--bg-image)]"
              style={rootStyle}
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
                    {/* 使用 img 標籤替代 Next.js Image 組件，避免 html-to-image 轉換問題 */}
                    <img
                      src={theme.largeImg.src}
                      alt={theme.title}
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                </div>
              </div>
              <Slogan>{detail.slogan}</Slogan>
              <div className="relative mb-4 space-y-4 text-base font-light bg-white rounded-md p-4">
                <div className="w-52 mx-auto">
                  <ResultChart
                    analysis={analysis}
                    color={theme.color}
                    className="aspect-[36/35]"
                  />
                </div>
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
                <div>
                  <Title>島嶼餐桌</Title>
                  <List data={detail.islandDining} />
                </div>
                {/* 使用 img 標籤替代 Next.js Image 組件，避免 html-to-image 轉換問題 */}
                <div className="absolute bottom-4 right-4 opacity-20">
                  <img
                    src={favicon112Png.src}
                    alt={theme.title}
                    width={128}
                    height={64}
                    className="w-32 h-16 object-cover"
                  />
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
            {resultImg && (
              <img
                src={resultImg.src}
                alt={theme.title}
                width={resultImg.width}
                height={resultImg.height}
                className="absolute inset-px object-cover"
                onContextMenu={handleImageContextMenu}
              />
            )}
          </div>
          <div className="mb-4 relative -top-4 flex justify-center">
            <div className="px-2 font-bold text-lg text-[var(--color)] bg-[var(--bg-color)]">
              <div className="hidden sm:block">右鍵上方圖片以儲存結果</div>
              <div className="block sm:hidden">長按上方圖片以儲存結果</div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="mb-3 font-bold body-md text-center">
              分享個人結果到
            </div>
            <div className="mb-4 mx-2 flex justify-between gap-2 text-basic-400">
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
              onClick={handleReplay}
            >
              再玩一次
            </Button>
            <AuthButton
              variant="outline"
              size="lg"
              className="block w-full mb-6 text-basic-400 border-basic-400 hover:bg-basic-400"
              onClick={handleViewAnalysis}
            >
              看深度分析
            </AuthButton>
            <footer className="p-5 bg-white rounded-md flex flex-col items-center">
              <VerticalLogoSvg />
              <p className="my-6 text-sm text-center">
                島島阿學是為「相信學習可以不一樣的人」所打造的學習平台。
                以科技與社群，匯集學習經驗、資源、人脈，並提供個人化學習管理與技能展現的工具，賦予每個人掌握學習旅程的能力。
                這裡，是個人成長與集體智慧交會的所在。
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
