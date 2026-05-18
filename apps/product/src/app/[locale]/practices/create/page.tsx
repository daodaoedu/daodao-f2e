"use client";

import { useTranslations } from "@daodao/i18n";

import {
  type PracticeTemplateType,
  usePracticeTemplateCategories,
  usePracticeTemplates,
} from "@daodao/api";
import { LifeSvg } from "@daodao/assets";
import { useRouter } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@daodao/ui/components/carousel";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { BgRadialAnimation } from "@/components/layout/bg-radial-animation";
import { practiceCategoryMetadataMap } from "@/constants/practice-category";

export default function CreatePracticePage() {
  const t = useTranslations("practice");
  const router = useRouter();

  // 取得分類列表
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = usePracticeTemplateCategories();

  // 將 API 返回的分類 ID 轉換成包含 label 和 icon 的 Category 物件
  const categories = useMemo(() => {
    if (!categoriesData?.data) {
      return [];
    }

    return categoriesData.data.map((categoryId: string) => {
      const metadata = practiceCategoryMetadataMap[categoryId];
      return {
        id: categoryId,
        label: metadata?.label ?? categoryId,
        icon: metadata?.icon ?? LifeSvg,
      };
    });
  }, [categoriesData]);

  // 預設選擇第一個分類，如果沒有分類則為空字串
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // 當分類載入完成後，設定預設選中的分類
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]?.id ?? "");
    }
  }, [categories, selectedCategory]);

  // 取得實踐模板列表
  const {
    data,
    error,
    isLoading: isTemplatesLoading,
  } = usePracticeTemplates({
    category: selectedCategory || undefined,
    limit: 16,
  });

  // 統一的 loading 狀態：分類或模板任一在載入中
  const isLoading = isCategoriesLoading || isTemplatesLoading;

  // 統一的 error 狀態：分類或模板任一發生錯誤
  const hasError = categoriesError || error;

  const handleTemplateSelect = (templateId: string) => {
    router.push(`/practices/create/template/${templateId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // 將 API 回應的模板轉換成頁面需要的格式
  const currentPractices = useMemo(() => {
    if (!data?.data) {
      return [];
    }

    return data.data.map((template: PracticeTemplateType) => ({
      id: template.id,
      title: template.title,
      description: template.practiceAction || template.suggestedTags.join("、") || template.title,
    }));
  }, [data]);

  // 將 practices 每 2 個分組
  const practiceGroups = useMemo(() => {
    const groups: Array<{
      id: string;
      items: Array<(typeof currentPractices)[0]>;
    }> = [];
    for (let i = 0; i < currentPractices.length; i += 2) {
      groups.push({
        id: `${selectedCategory}-group-${Math.floor(i / 2)}`,
        items: currentPractices.slice(i, i + 2),
      });
    }
    return groups;
  }, [currentPractices, selectedCategory]);

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-linear-to-br from-[#F5F9E8] via-white to-[#F0F4F8]">
      <BackgroundAnimation />

      <PageHeader rightActionTo="/" />

      <main className="relative px-4 max-w-[600px] mx-auto pb-8">
        {/* Header */}
        <div className="text-center pt-5 md:pt-12">
          <Badge size="sm" variant="secondary" className="text-xs md:text-sm text-text-dark mb-3">
            {t("practice.create_title")}
          </Badge>
          <h1 className="text-2xl md:text-4xl font-semibold text-text-dark mb-3 relative">
            {t("practice.create_subtitle")}
            <BgRadialAnimation
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%-64px)] md:-translate-y-[calc(50%-24px)] -z-10"
              variant="deco"
            />
          </h1>
          <p className="md:text-lg text-text-dark/70 text-center">
            {t("practice.create_no_perfect")}
            <br />
            {t("practice.create_just_start")}
          </p>
        </div>

        {/* Category Navigation */}
        {categories.length > 0 && (
          <div className="flex gap-2 md:gap-3 justify-start md:justify-center mt-6 md:mt-8 mb-6 md:mb-8 pb-2 overflow-x-auto md:overflow-x-visible scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "white"}
                  onClick={() => handleCategoryClick(category.id)}
                  aria-label={t("practice.create_select_category_label", { label: category.label })}
                  className={cn(
                    "h-12 rounded-lg shrink-0 whitespace-nowrap",
                    isSelected && "pointer-events-none"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 md:size-6",
                      isSelected ? "text-white" : "text-text-dark/60"
                    )}
                  />
                  {category.label}
                </Button>
              );
            })}
          </div>
        )}

        {/* Practice Cards Grid */}
        <div className="relative w-full md:w-[472px] mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-text-dark/60" />
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-text-dark/70 mb-4">{t("practice.create_load_error")}</p>
              <Button
                variant="outline"
                onClick={() => {
                  // SWR 會自動重新驗證
                  window.location.reload();
                }}
              >{t("practice.create_reload")}</Button>
            </div>
          ) : currentPractices.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-text-dark/70">{t("practice.create_no_templates")}</p>
            </div>
          ) : (
            <Carousel
              key={selectedCategory}
              className="w-full"
              opts={{ loop: false, align: "start" }}
            >
              <CarouselContent className="-ml-2">
                {practiceGroups.map((group) => (
                  <CarouselItem key={group.id} className="pl-2 basis-[80%] sm:basis-1/2">
                    <div className="flex flex-col gap-2">
                      {group.items.map((practice) => (
                        <button
                          key={practice.id}
                          type="button"
                          onClick={() => handleTemplateSelect(practice.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleTemplateSelect(practice.id);
                            }
                          }}
                          aria-label={t("practice.create_select_practice_label", { title: practice.title })}
                          className={cn(
                            "w-full bg-[#E9FEFFB2]/70 rounded-lg px-6 py-4 border-2 border-[#C1ECFF] cursor-pointer",
                            "text-left focus-visible:outline-2 focus-visible:outline-logo-cyan focus-visible:outline-offset-2",
                            "flex items-center justify-between gap-2 group h-[104px] backdrop-blur-lg"
                          )}
                        >
                          <div className="flex-1 flex flex-col h-full min-w-0">
                            <h3 className="font-medium text-bg-dark line-clamp-1 mb-1">
                              {practice.title}
                            </h3>
                            <p className="text-sm text-text-dark line-clamp-2 flex-1">
                              {practice.description}
                            </p>
                          </div>
                          <div className="shrink-0">
                            <ChevronRight className="size-4.5 text-text-dark group-hover:text-logo-cyan transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious
                variant="ghost"
                size="icon"
                className="absolute -left-16 top-1/2 -translate-y-1/2 z-20 hidden md:flex size-10 text-text-dark/70 hover:text-text-dark hover:opacity-100 bg-white/80 hover:bg-white shadow-md"
                aria-label={t("practice.create_prev")}
              />
              <CarouselNext
                variant="ghost"
                size="icon"
                className="absolute -right-16 top-1/2 -translate-y-1/2 z-20 hidden md:flex size-10 text-text-dark/70 hover:text-text-dark hover:opacity-100 bg-white/80 hover:bg-white shadow-md"
                aria-label={t("practice.create_next")}
              />
            </Carousel>
          )}
        </div>

        {/* Create Manual Practice Button */}
        <div className="flex justify-center mt-8 mb-4">
          <Button variant="white" onClick={() => router.push("/practices/create/manual")}>
            {t("practice.create_manual")}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
