'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomLink } from '@/shared/ui/custom-link';
import { Button } from '@/shared/ui/button';
import favicon112Png from '@/public/assets/brand/favicon-112.png';
import HorizontalLogoSvg from '@/public/assets/brand/horizontal-primary-logo.svg';
import VerticalLogoSvg from '@/public/assets/brand/vertical-primary-logo.svg';
import {
  useQuiz,
  Title,
  useResultStyles,
  ResultChart,
  Slogan,
  List,
  ShareButtons,
} from '@/features/quiz';
import {
  captureElementAsImage,
  CapturedImageData,
} from '@/shared/lib/capture-element-as-image';
import { ResultCard, themeMap } from '@/entities/quiz';
import { GACategory, logEvent } from '@/shared/lib/analytics';

export const QuizResultWidget = () => {
  const router = useRouter();
  const [resultImg, setResultImg] = useState<CapturedImageData | null>(null);
  const { detail, theme, analysis, hasAnalysis } = useQuiz();
  const { rootStyle } = useResultStyles(theme);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleReplay = () => {
    logEvent(GACategory.User, 'Replay Quiz');
    router.push('/quiz');
  };

  const handleViewAnalysis = () => {
    logEvent(GACategory.User, 'View Quiz Analysis', `Detail ID: ${detail?.id}`);
    router.push(`/quiz/result/${detail?.id}`);
  };

  const handleImageContextMenu = () => {
    if (!theme) return;
    logEvent(GACategory.User, 'Download Result', `Theme: ${theme.title}`);
  };

  const isLoading = !hasAnalysis || !detail || !theme;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAnalysis) {
        router.replace('/quiz');
      }
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [hasAnalysis, router]);

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
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <div style={rootStyle}>
      <div className="relative mx-auto max-w-[392px]">
        <div className="relative border-b border-dashed border-[var(--color)] sm:border">
          <main
            ref={mainRef}
            className="p-6 pb-10 text-left text-sm text-basic-400 [background:var(--bg-image)]"
            style={rootStyle}
          >
            <header className="mb-1">
              <HorizontalLogoSvg className="h-[22px]" />
            </header>

            <ResultCard detail={detail} theme={theme} className="mb-4" />

            <Slogan>{detail.slogan}</Slogan>

            <div className="relative mb-4 space-y-4 rounded-md bg-white p-4 text-base font-light">
              <div className="mx-auto w-52">
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
              <div className="absolute bottom-4 right-4 opacity-20">
                <img
                  src={favicon112Png.src}
                  alt={theme.title}
                  width={128}
                  height={64}
                  className="h-16 w-32 object-cover"
                />
              </div>
            </div>

            <div className="mb-2 text-center text-base font-bold">
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
          <div className="bg-[var(--bg-color)] px-2 text-lg font-bold text-[var(--color)]">
            <div className="hidden sm:block">右鍵上方圖片以儲存結果</div>
            <div className="block sm:hidden">長按上方圖片以儲存結果</div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <ShareButtons className="mb-4" />

          <Button
            variant="outline"
            size="lg"
            className="mb-4 block w-full border-basic-400 text-basic-400 hover:bg-basic-400"
            onClick={handleReplay}
          >
            再玩一次
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="mb-6 block w-full border-basic-400 text-basic-400 hover:bg-basic-400"
            onClick={handleViewAnalysis}
          >
            看深度分析
          </Button>

          <footer className="flex flex-col items-center rounded-md bg-white p-5">
            <VerticalLogoSvg />
            <p className="my-6 text-center text-sm">
              島島阿學是為「相信學習可以不一樣的人」所打造的學習平台。
              以科技與社群，匯集學習經驗、資源、人脈，並提供個人化學習管理與技能展現的工具，賦予每個人掌握學習旅程的能力。
              這裡，是個人成長與集體智慧交會的所在。
            </p>
            <Button className="w-full" size="lg" asChild>
              <CustomLink href="/">前往 島島阿學</CustomLink>
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
};
