"use client";

import { type PracticeTemplateType, useRandomPracticeTemplates } from "@daodao/api";
import { ArrowRightOutlineSvg } from "@daodao/assets";
import { useRouter } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import Stack from "@daodao/ui/components/stack";
import { useMemo } from "react";
import { PRACTICE_THEMES, PracticeTheme, practiceThemeSvgMap } from "@/constants/practice-theme";

interface IRandomPractice {
  id: string;
  title: string;
  description: string;
  templateId: string;
}

export interface IFeedPracticeItem {
  id: string;
  title: string;
  description: string;
  userName?: string;
}

// 將 API 的 PracticeTemplate 轉換成 IRandomPractice
const convertTemplateToRandomPractice = (template: PracticeTemplateType): IRandomPractice => {
  return {
    id: template.id,
    title: template.title,
    description: template.practiceAction || template.suggestedTags.join("、") || template.title,
    templateId: template.id,
  };
};

interface IFeedPracticeCardProps {
  practice: IFeedPracticeItem;
  theme: PracticeTheme;
  onView: () => void;
}

const FeedPracticeCard = ({ practice, theme, onView }: IFeedPracticeCardProps) => {
  const ThemeSvg = practiceThemeSvgMap[theme] ?? practiceThemeSvgMap[PracticeTheme.yellow];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onView();
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
            <h3 className="text-xl font-medium text-bg-dark line-clamp-2">{practice.title}</h3>
            <p className="text-xs text-text-dark line-clamp-2">{practice.description}</p>
          </div>
          {practice.userName && (
            <p className="text-xs text-text-dark/60">{practice.userName} 正在實踐</p>
          )}
        </div>
        <Button variant="secondary" className="w-full" onClick={handleClick}>
          查看實踐
        </Button>
      </div>
    </div>
  );
};

interface IRandomPracticeCardProps {
  practice: IRandomPractice;
  theme: PracticeTheme;
  onAction: () => void;
}

const RandomPracticeCard = ({ practice, theme, onAction }: IRandomPracticeCardProps) => {
  const ThemeSvg = practiceThemeSvgMap[theme] ?? practiceThemeSvgMap[PracticeTheme.yellow];

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
            <h3 className="text-xl font-medium text-bg-dark line-clamp-2">{practice.title}</h3>
            <p className="text-xs text-text-dark line-clamp-2">{practice.description}</p>
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
  feedPractices?: IFeedPracticeItem[];
  /**
   * 是否使用緊湊模式（移除外層 padding，適用於放在其他容器內）
   */
  compact?: boolean;
}

export const RandomPracticesSection = ({
  practices: propPractices,
  feedPractices,
  compact = false,
}: IRandomPracticesSectionProps) => {
  const router = useRouter();

  const hasFeedPractices = feedPractices && feedPractices.length > 0;

  // 取得 3 個隨機模板（只在沒有 feed 真實資料時使用）
  const { data: randomTemplatesData } = useRandomPracticeTemplates(
    hasFeedPractices ? undefined : { count: 3 }
  );

  // 從 API 取得隨機模板，或使用傳入的 practices
  const templatePractices = useMemo(() => {
    if (propPractices && propPractices.length > 0) {
      return propPractices;
    }
    if (!randomTemplatesData?.data || randomTemplatesData.data.length === 0) {
      return [];
    }
    return randomTemplatesData.data.map(convertTemplateToRandomPractice);
  }, [propPractices, randomTemplatesData]);

  // 為每個實踐分配主題顏色
  const feedPracticesWithTheme = useMemo(() => {
    if (!feedPractices) return [];
    return feedPractices.map((practice, index) => {
      const themeIndex = index % PRACTICE_THEMES.length;
      const theme = PRACTICE_THEMES[themeIndex] ?? PracticeTheme.yellow;
      return { ...practice, theme };
    });
  }, [feedPractices]);

  const templatePracticesWithTheme = useMemo(() => {
    return templatePractices.map((practice, index) => {
      const themeIndex = index % PRACTICE_THEMES.length;
      const theme = PRACTICE_THEMES[themeIndex] ?? PracticeTheme.yellow;
      return { ...practice, theme };
    });
  }, [templatePractices]);

  const handleViewPractice = (id: string) => {
    router.push(`/practices/${id}`);
  };

  const handleAction = (templateId: string) => {
    router.push(`/practices/create/template/${templateId}`);
  };

  const handleMoreThemes = () => {
    router.push("/practices/create");
  };

  // Stack 元件會讓陣列最後一個元素顯示在最上層，所以需要反轉順序
  const stackCards = hasFeedPractices
    ? feedPracticesWithTheme
        .slice()
        .reverse()
        .map((practice) => (
          <FeedPracticeCard
            key={practice.id}
            practice={practice}
            theme={practice.theme}
            onView={() => handleViewPractice(practice.id)}
          />
        ))
    : templatePracticesWithTheme
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

  const heading = hasFeedPractices
    ? "看看大家都在實踐什麼，一起小步前行！"
    : "從好奇開始, 一起小步實踐生活裡的學習靈感。";

  return (
    <section className={compact ? "" : "mb-6 pt-4 px-4"}>
      {/* 標題區域 */}
      <div className="relative max-w-[640px] bg-white rounded-[12px] p-4 mx-auto flex flex-col items-center gap-3">
        <h2 className="relative z-10 flex justify-center text-lg font-medium text-bg-dark">
          {heading}
        </h2>
        <div className="w-[296px] h-[239px] pt-6">
          <div className="w-[240px] h-[200px]">
            <Stack cards={stackCards} sendToBackOnClick />
          </div>
        </div>
        <Button variant="default" onClick={handleMoreThemes} className="max-w-60 w-full">
          更多主題
          <ArrowRightOutlineSvg className="size-4.5" />
        </Button>
      </div>
    </section>
  );
};
