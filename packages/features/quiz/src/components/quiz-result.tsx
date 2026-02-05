"use client";

import { saveQuizResult } from "@daodao/api";
import { HorizontalFullSvg, VerticalFullSvg } from "@daodao/assets";
import favicon256Png from "@daodao/assets/images/brand/favicon256.png";
import { AuthButton, useAuth } from "@daodao/auth";
import { useRouter } from "@daodao/i18n/navigation";
import {
  type CapturedImageData,
  captureElementAsImage,
} from "@daodao/shared/lib/capture-element-as-image";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { useEffect, useRef, useState } from "react";
import { useQuiz, useResultStyles } from "../hooks";
import { themeMap } from "../utils/theme-map";
import { ResultCard } from "./result-card";
import { ResultChart } from "./result-chart";
import { ShareButtons } from "./share-buttons";
import { List, Slogan, Title } from "./styled";

export const QuizResult = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [resultImg, setResultImg] = useState<CapturedImageData | null>(null);
  const [hasSavedResult, setHasSavedResult] = useState(false);
  const { detail, theme, analysis, hasAnalysis, result } = useQuiz();
  const { rootStyle } = useResultStyles(theme);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleReplay = () => {
    router.push("/quiz");
  };

  const handleViewAnalysis = () => {
    router.push(`/quiz/result/${detail?.id}`);
  };

  const handleImageContextMenu = () => {
    if (!theme) return;
    console.log(theme.title);
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

  // 當用戶已登入且有測驗結果時，自動儲存到後端
  useEffect(() => {
    const saveResult = async () => {
      if (!isAuthenticated || !hasAnalysis || !detail || hasSavedResult) {
        return;
      }

      try {
        // 轉換答案格式：從 { q1: { selectedAnswer: 'A' } } 轉為 { "1": { selectedAnswer: "A" } }
        const formattedAnswers: Record<string, { selectedAnswer: string }> = {};
        for (const [questionId, answer] of Object.entries(result)) {
          const questionNumber = questionId.replace("q", "");
          formattedAnswers[questionNumber] = { selectedAnswer: answer.selectedAnswer };
        }

        // resultType 需要轉換為大寫以符合 API 規格 (L/C/A/D/O)
        await saveQuizResult({
          resultType: detail.id.toUpperCase(),
          scores: analysis,
          answers: formattedAnswers,
        });
        setHasSavedResult(true);
      } catch (error) {
        // 儲存失敗時靜默處理，不影響用戶體驗
        console.error("Failed to save quiz result:", error);
      }
    };

    saveResult();
  }, [isAuthenticated, hasAnalysis, detail, hasSavedResult, result, analysis]);

  useEffect(() => {
    const renderResultImg = async () => {
      if (!mainRef.current || isLoading) return;

      const imageData = await captureElementAsImage(mainRef.current);
      if (imageData) {
        setResultImg(imageData);
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
    <div style={rootStyle}>
      <div className="relative mx-auto max-w-[392px]">
        <div className="relative border-b border-dashed border-(--color) sm:border">
          <main
            ref={mainRef}
            className="p-6 pb-10 text-left text-sm text-basic-400 [background:var(--bg-image)]"
            style={rootStyle}
          >
            <header className="mb-1">
              <HorizontalFullSvg className="h-[22px]" />
            </header>

            <ResultCard detail={detail} theme={theme} className="mb-4" />

            <Slogan>{detail.slogan}</Slogan>

            <div className="relative mb-4 space-y-4 rounded-md bg-white p-4 text-base font-light">
              <div className="mx-auto w-52">
                <ResultChart analysis={analysis} color={theme.color} className="aspect-36/35" />
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
              <div className="absolute bottom-4 right-4 opacity-20">
                <img
                  src={favicon256Png.src}
                  alt={theme.title}
                  width={128}
                  height={64}
                  className="h-16 w-32 object-cover"
                />
              </div>
            </div>

            <div className="mb-2 text-center text-base font-bold">適合一起學習的夥伴</div>
            <div className="flex gap-2">
              {detail.partners.map(({ roleId, brief }) => {
                const partnerTheme = themeMap.get(roleId);
                if (!partnerTheme) return null;
                const { smallImg: SmallImg, title, color } = partnerTheme;
                return (
                  <div
                    key={roleId}
                    className="flex basis-1/2 flex-col items-center gap-2 rounded-md bg-white p-3"
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
              className="absolute inset-0 object-cover"
              onContextMenu={handleImageContextMenu}
            />
          )}
        </div>

        <div className="relative -top-4 mb-4 flex justify-center">
          <div className="bg-(--bg-color) px-2 text-lg font-bold text-(--color)">
            <div className="hidden sm:block">右鍵上方圖片以儲存結果</div>
            <div className="block sm:hidden">長按上方圖片以儲存結果</div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <ShareButtons className="mb-4" />

          <Button
            variant="outline"
            className="mb-4 block w-full border-basic-400 text-basic-400 hover:bg-basic-400"
            onClick={handleReplay}
          >
            再玩一次
          </Button>

          <AuthButton
            variant="outline"
            className="mb-6 block w-full border-basic-400 text-basic-400 hover:bg-basic-400"
            onClick={handleViewAnalysis}
            redirectUrl={`/quiz/result/${detail?.id}`}
          >
            看深度分析
          </AuthButton>

          <footer className="flex flex-col items-center rounded-md bg-white p-5">
            <VerticalFullSvg className="w-24" />
            <p className="my-6 text-center text-sm">
              島島阿學是為「相信學習可以不一樣的人」所打造的學習平台。
              以科技與社群，匯集學習經驗、資源、人脈，並提供個人化學習管理與技能展現的工具，賦予每個人掌握學習旅程的能力。
              這裡，是個人成長與集體智慧交會的所在。
            </p>
            <Button className="w-full" asChild>
              <CustomLink href="/">前往 島島阿學</CustomLink>
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
};
