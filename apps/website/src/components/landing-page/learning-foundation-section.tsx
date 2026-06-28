"use client";

import { usePublicPractices } from "@daodao/api";
import { BlueSvg, GreenSvg, PinkSvg, YellowSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { ANCHOR_IDS } from "@daodao/shared";
import { Image } from "@daodao/ui/components/image";
import Stack from "@daodao/ui/components/stack";
import { ChevronRight, Loader2 } from "lucide-react";
import { useCallback, useMemo } from "react";

const themeSvgMap = {
  yellow: YellowSvg,
  blue: BlueSvg,
  pink: PinkSvg,
  green: GreenSvg,
};

type PracticeTheme = keyof typeof themeSvgMap;

const themeOrder: PracticeTheme[] = ["yellow", "pink", "blue", "green"];

const PRODUCT_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.daodao.so";

const formatFrequency = (minDays: number | null, maxDays: number | null): string => {
  if (minDays === null || maxDays === null) return "3-5";
  return `${minDays}-${maxDays}`;
};

function PracticeCard({
  tag,
  title,
  description,
  frequency,
  frequencyUnit,
  duration,
  durationUnit,
  theme,
  practiceId,
  userName,
  isActive = false,
  onClick,
}: {
  tag: string;
  title: string;
  description: string;
  frequency: string;
  frequencyUnit: string;
  duration: string;
  durationUnit: string;
  theme: PracticeTheme;
  practiceId: string;
  userName?: string;
  isActive?: boolean;
  onClick?: (practiceId: string) => void;
}) {
  const ThemeSvg = themeSvgMap[theme];

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(practiceId);
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl text-left">
      <ThemeSvg className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" />

      <div className="relative flex h-full flex-col justify-between p-6">
        <div>
          <span className="inline-block rounded-full border border-primary-base bg-white/70 px-3 py-1 text-xs font-medium text-primary-darker">
            {tag}
          </span>
          <h3 className="mt-3 text-2xl font-bold text-primary-darker">{title}</h3>
          <p className="mt-2 text-sm text-basic-400">{description}</p>
          {userName && (
            <p className="mt-1 text-xs text-basic-400/60">{userName} 正在實踐</p>
          )}
        </div>

        {isActive && (
          <div className="mt-4 flex justify-end">
            <div className="relative">
              <div className="rounded-lg bg-basic-500 px-4 py-2 text-sm text-white">
                一起來實踐吧！
              </div>
              <div className="absolute -bottom-2 right-8 size-0 border-x-8 border-t-8 border-x-transparent border-t-basic-500" />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-end justify-between">
          <div className="flex items-baseline gap-4">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-primary-darker">{frequency}</span>
              <span className="ml-0.5 text-sm text-basic-400">{frequencyUnit}</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-primary-darker">{duration}</span>
              <span className="ml-0.5 text-sm text-basic-400">{durationUnit}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleIconClick}
            className="flex size-12 items-center justify-center rounded-full bg-white/80 shadow-sm hover:bg-white active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="size-5 text-basic-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function LearningFoundationSection() {
  const t = useTranslations("common");
  const tag = t("landing_foundation_tag");

  const { data, isLoading } = usePublicPractices({ limit: 20 });

  const handleCardClick = useCallback((practiceId: string) => {
    window.location.href = `${PRODUCT_APP_URL}/practices/${practiceId}`;
  }, []);

  const cards = useMemo(() => {
    if (!data?.data || data.data.length === 0) return [];

    return data.data.map((practice, index) => (
      <PracticeCard
        key={practice.id}
        tag={tag}
        title={practice.title}
        description={practice.practiceAction || ""}
        frequency={formatFrequency(
          practice.frequencyMinDays ?? null,
          practice.frequencyMaxDays ?? null,
        )}
        frequencyUnit="天/週"
        duration={String(practice.sessionDurationMinutes ?? 30)}
        durationUnit="分/次"
        theme={themeOrder[index % themeOrder.length] as PracticeTheme}
        practiceId={practice.id}
        userName={practice.user?.name}
        onClick={handleCardClick}
      />
    ));
  }, [data, tag, handleCardClick]);

  return (
    <section
      id={ANCHOR_IDS.LEARNING_INSPIRATION}
      className="relative overflow-hidden bg-white py-16 md:py-24"
    >
      <Image
        src="/assets/landing-page/bg-blur-1.svg"
        alt=""
        width={837}
        height={831}
        className="pointer-events-none absolute -left-40 -top-20 w-[500px] md:-left-20 md:w-[837px]"
      />
      <Image
        src="/assets/landing-page/bg-blur-2.svg"
        alt=""
        width={558}
        height={558}
        className="pointer-events-none absolute -bottom-40 -right-40 w-[400px] md:-bottom-20 md:-right-20 md:w-[558px]"
      />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="whitespace-pre-line text-[1.75rem] font-bold leading-tight md:text-3xl">
            <span className="text-primary-darker">{t("landing_foundation_title")}</span>
            <span className="text-primary-base">{t("landing_foundation_title_highlight")}</span>
          </h2>
          <p className="mt-3 text-sm text-basic-400">{t("landing_foundation_subtitle_1")}</p>
          <p className="mt-1 text-sm text-basic-400">{t("landing_foundation_subtitle_2")}</p>
        </div>

        <div className="relative mx-auto h-[360px] w-[300px] md:h-[400px] md:w-[340px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary-base" />
            </div>
          ) : cards.length > 0 ? (
            <Stack
              cards={cards}
              sendToBackOnClick
              sensitivity={80}
              renderCount={3}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-basic-400">
              暫無實踐資料
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
