"use client";

import { ArrowRightOutlineSvg, BulbSvg, Deco2Svg } from "@daodao/assets";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import Stack from "@daodao/ui/components/stack";
import { useRouter } from "@daodao/i18n/navigation";
import { useMemo } from "react";
import {
  PracticeTheme,
  PRACTICE_THEMES,
  practiceThemeSvgMap,
} from "@/constants/practice-theme";

interface IRandomPractice {
  id: string;
  title: string;
  description: string;
  templateId: string;
}

// 模擬隨機實踐資料 - 之後可以從 API 取得
const MOCK_RANDOM_PRACTICES: IRandomPractice[] = [
  {
    id: "0",
    title: "自己準備便當",
    description: "開始為自己做上班的健康午餐便當",
    templateId: "prepare-lunch-box",
  },
  {
    id: "1",
    title: "每天學英文 30 分鐘",
    description: "透過 App 和影片學習，持續 30 天",
    templateId: "learn-english-30min",
  },
  {
    id: "2",
    title: "冥想",
    description: "看 Youtube 教學,每晚睡前練習",
    templateId: "meditation",
  },
];

interface IRandomPracticeCardProps {
  practice: IRandomPractice;
  theme: PracticeTheme;
  onAction: () => void;
}

const RandomPracticeCard = ({
  practice,
  theme,
  onAction,
}: IRandomPracticeCardProps) => {
  const ThemeSvg =
    practiceThemeSvgMap[theme] ?? practiceThemeSvgMap[PracticeTheme.yellow];

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onAction();
    };

  return (
    <div className="absolute inset-0 rounded-[12px] overflow-hidden">
      <ThemeSvg className="absolute inset-0" />
      <div className="relative p-4 pb-6 flex flex-col h-full justify-between z-10">
        <div className="flex flex-col gap-2">
          <Badge variant="secondary" size="sm" className="w-fit">
            主題實踐
          </Badge>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-medium text-bg-dark line-clamp-2">
              {practice.title}
            </h3>
            <p className="text-xs text-text-dark line-clamp-2">
              {practice.description}
            </p>
          </div>
        </div>
        <Button variant="secondary" className="w-full" onClick={handleClick}>
          馬上行動
        </Button>
      </div>
    </div>
  );
};

interface IRandomPracticesSectionProps {
  practices?: IRandomPractice[];
}

export const RandomPracticesSection = ({
  practices = MOCK_RANDOM_PRACTICES,
}: IRandomPracticesSectionProps) => {
  const router = useRouter();

  // 為每個實踐分配主題顏色
  const practicesWithTheme = useMemo(() => {
    return practices.map((practice, index) => {
      const themeIndex = index % PRACTICE_THEMES.length;
      const theme = PRACTICE_THEMES[themeIndex] ?? PracticeTheme.yellow;
      return { ...practice, theme };
    });
  }, [practices]);

  const handleAction = (templateId: string) => {
    router.push(`/practices/create/template/${templateId}`);
  };

  const handleMoreThemes = () => {
    router.push("/practices/create");
  };

  // Stack 元件會讓陣列最後一個元素顯示在最上層，所以需要反轉順序
  // 讓黃色（第一個）顯示在最上層
  const stackCards = practicesWithTheme
    .slice()
    .reverse()
    .map((practice) => (
      <RandomPracticeCard
        key={practice.id}
        practice={practice}
        theme={practice.theme}
        onAction={() => handleAction(practice.templateId)}
      />
    ));

  return (
    <section className="mb-6 pt-4 px-4">
      {/* 標題區域 */}
      <div className="relative max-w-[640px] bg-white rounded-[12px] p-4 mx-auto flex flex-col items-center gap-3">
        <Deco2Svg
          width={98}
          height={120}
          className="absolute -left-[50px] -top-[18px] md:-left-[66px] md:-top-[34px]"
        />
        <h2 className="relative z-10 flex justify-center text-lg font-medium text-bg-dark">
          從好奇開始, 一起小步實踐生活裡的學習靈感。
        </h2>
        <div className="w-[296px] h-[239px] pt-6">
          <div className="w-[240px] h-[200px]">
            <Stack cards={stackCards} sendToBackOnClick />
          </div>
        </div>
        <Button
          variant="default"
          onClick={handleMoreThemes}
          className="max-w-60 w-full"
        >
          更多主題
          <ArrowRightOutlineSvg className="size-4.5" />
        </Button>
      </div>
    </section>
  );
};
