import {
  getRandomPracticeTemplates,
  type PracticeTemplateType,
  usePracticeTemplateById,
  usePracticeTemplateCategories,
} from "@daodao/api";
import ArtSvg from "@daodao/assets/images/categories/art.svg";
import HealthSvg from "@daodao/assets/images/categories/health.svg";
import LanguageSvg from "@daodao/assets/images/categories/language.svg";
import LifeSvg from "@daodao/assets/images/categories/life.svg";
import TechSvg from "@daodao/assets/images/categories/tech.svg";
import CompassSvg from "@daodao/assets/images/dashboard/compass.svg";
import Deco4Svg from "@daodao/assets/images/dashboard/deco-4.svg";
import ArrowRightOutlineSvg from "@daodao/assets/images/icon/arrow-right-outline.svg";
import { ChevronDown, ChevronLeft, RefreshCw } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import {
  ExecutionDurationCard,
  ExecutionTimingCard,
  PracticeOverviewCard,
  ResourceCard,
  ResourceGrid,
} from "@/components/practice/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DURATION_DAYS_NUMBER_OPTIONS,
  DurationDays,
  DurationDaysNumberToStringMap,
  type ExecutionTiming,
  Frequency,
  PracticeTimePeriodToExecutionTimingMap,
} from "@/constants/practice-form";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { api } from "@/services/api-client";

type CategoryIcon = typeof LanguageSvg;

/** 對齊 product practiceCategoryMetadataMap：類別 ID → 翻譯 key + 圖示 */
const categoryMetadataMap: Record<string, { labelKey: string; Icon: CategoryIcon }> = {
  language: { labelKey: "categories.language", Icon: LanguageSvg },
  lifestyle: { labelKey: "categories.lifestyle", Icon: LifeSvg },
  digital_skill: { labelKey: "categories.digital_skill", Icon: TechSvg },
  art_design: { labelKey: "categories.art_design", Icon: ArtSvg },
  wellness: { labelKey: "categories.wellness", Icon: HealthSvg },
};

type TemplateFormValues = {
  actionDescription: string;
  durationMinutes: number;
  startDate: string;
  durationDays: DurationDays;
  frequency: Frequency;
  executionTiming: ExecutionTiming[];
  customTiming: string;
  tags: string[];
  resources: Array<{ id: string; name: string; url?: string }>;
};

// 今天日期字串（yyyy-MM-dd），避免額外依賴 date-fns
const formatToday = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 將 API 的 practiceTimePeriods 映射到 executionTiming（對齊 product）
const mapPracticeTimePeriodsToExecutionTiming = (periods?: string[] | null): ExecutionTiming[] => {
  if (!periods) return [];
  return periods
    .map((period) => PracticeTimePeriodToExecutionTimingMap[period])
    .filter((timing): timing is ExecutionTiming => timing !== undefined);
};

// 將 API 的 frequencyMinDays / frequencyMaxDays 映射到 frequency（對齊 product）
const mapFrequencyToFormValue = (
  minDays: number | null | undefined,
  maxDays: number | null | undefined
): Frequency => {
  if (minDays == null || maxDays == null) return Frequency.threeToFive;
  if (minDays >= 2 && maxDays <= 4) return Frequency.twoToFour;
  if (minDays >= 3 && maxDays <= 5) return Frequency.threeToFive;
  if (minDays >= 4 && maxDays <= 7) return Frequency.fourToSeven;
  return Frequency.threeToFive;
};

// 將 API 的 durationDays 映射到表單字串（對齊 product）
const mapDurationDaysToString = (days: number | null | undefined): DurationDays => {
  if (days == null) return DurationDays.thirty;
  const closest = DURATION_DAYS_NUMBER_OPTIONS.reduce((prev, curr) =>
    Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev
  );
  return DurationDaysNumberToStringMap[closest];
};

// 將 API 模板轉成卡片所需的表單值（對齊 product convertTemplateToFormValues）
const convertTemplateToFormValues = (template: PracticeTemplateType): TemplateFormValues => ({
  actionDescription: template.practiceAction || template.title,
  durationMinutes: template.sessionDurationMinutes ?? 30,
  startDate: formatToday(),
  durationDays: mapDurationDaysToString(template.durationDays),
  frequency: mapFrequencyToFormValue(template.frequencyMinDays, template.frequencyMaxDays),
  executionTiming: mapPracticeTimePeriodsToExecutionTiming(template.practiceTimePeriods),
  customTiming: "",
  tags: template.suggestedTags ?? [],
  resources: (template.resources ?? [])
    .filter((resource, index, self) => index === self.findIndex((r) => r.id === resource.id))
    .map((resource) => ({
      id: resource.id,
      name: resource.name,
      url: resource.url ?? undefined,
    })),
});

type TemplateCreateRequest = {
  title: string;
  practiceAction?: string;
  durationDays: number;
  frequencyMinDays: number;
  frequencyMaxDays: number;
  sessionDurationMinutes: number;
  practiceTimePeriods?: string[];
  tags?: string[];
  resources?: Array<{ name: string; url?: string }>;
};

const buildTemplateCreateRequest = (template: PracticeTemplateType): TemplateCreateRequest => ({
  title: template.title,
  practiceAction: template.practiceAction || template.title,
  durationDays: template.durationDays ?? 30,
  frequencyMinDays: template.frequencyMinDays ?? 3,
  frequencyMaxDays: template.frequencyMaxDays ?? 5,
  sessionDurationMinutes: template.sessionDurationMinutes ?? 30,
  practiceTimePeriods: template.practiceTimePeriods ?? undefined,
  tags: template.suggestedTags ?? undefined,
  resources: template.resources?.map((resource) => ({
    name: resource.name,
    url: resource.url ?? undefined,
  })),
});

export default function TemplatePreviewScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const commonT = useMobileTranslation("common");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const { data, error, isLoading } = usePracticeTemplateById(templateId);
  const { data: categoriesData } = usePracticeTemplateCategories();
  const template = useMemo(() => data?.data ?? null, [data]);
  const formValues = useMemo(
    () => (template ? convertTemplateToFormValues(template) : null),
    [template]
  );

  /** API 分類 → 選單選項（對齊 product categoryOptions） */
  const categoryOptions = useMemo(() => {
    if (!categoriesData?.data) return [];
    return categoriesData.data.map((categoryId: string) => {
      const metadata = categoryMetadataMap[categoryId];
      return {
        id: categoryId,
        label: metadata ? t(metadata.labelKey) : categoryId,
        Icon: metadata?.Icon,
      };
    });
  }, [categoriesData, t]);

  // 目前模板所屬類別（badge +「換一個」隨機來源）
  const currentCategory = useMemo(() => {
    const categories = template?.categories ?? [];
    return categories.find((c) => c in categoryMetadataMap) ?? categories[0];
  }, [template]);

  const categoryLabel = currentCategory
    ? t(categoryMetadataMap[currentCategory]?.labelKey ?? currentCategory)
    : t("create_title");

  // 深連結直接進入此頁時沒有可返回的堆疊，退回首頁避免 GO_BACK 未處理
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  /**
   * 抽取指定分類的隨機模板並導向（對齊 product goToRandomTemplate）
   * - 未指定 category → 跨全部分類
   * - 「換一個」傳 currentCategory；選單切分類傳 categoryId
   */
  const goToRandomTemplate = useCallback(
    async (category?: string) => {
      if (isRefreshing) return;
      setIsRefreshing(true);
      setCategoryMenuOpen(false);
      try {
        const response = await getRandomPracticeTemplates({
          count: 1,
          category,
        });
        const next = response.data?.data?.[0];
        if (!next) {
          router.push("/practices/create");
          return;
        }
        router.replace(`/practices/create/${next.id}`);
      } catch {
        router.push("/practices/create");
      } finally {
        setIsRefreshing(false);
      }
    },
    [isRefreshing, router]
  );

  // 換一個：在目前分類內重抽
  const handleRefresh = useCallback(() => {
    void goToRandomTemplate(currentCategory);
  }, [goToRandomTemplate, currentCategory]);

  // 切換分類：抽所選分類的一個模板
  const handleSelectCategory = useCallback(
    (categoryId: string) => {
      if (categoryId === currentCategory) {
        setCategoryMenuOpen(false);
        return;
      }
      void goToRandomTemplate(categoryId);
    },
    [goToRandomTemplate, currentCategory]
  );

  const handleUseTemplate = useCallback(async () => {
    if (isSubmitting || !template) return;
    setIsSubmitting(true);
    try {
      const response = await api.post<{ data?: { id?: string } }>(
        "/practices",
        buildTemplateCreateRequest(template)
      );
      const practiceId = response?.data?.id;
      router.replace(
        practiceId
          ? `/practices/create/success?practiceId=${practiceId}`
          : "/practices/create/success"
      );
    } catch (createError) {
      Alert.alert(
        t("create_failed"),
        createError instanceof Error ? createError.message : t("create_failed_retry")
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, template, router, t]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.logo.cyan }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Spinner color={colors.basic.white} />
        </YStack>
      </SafeAreaView>
    );
  }

  if (error || !template || !formValues) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.logo.cyan }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$4">
          <Text fontSize={16} color={colors.basic.white}>
            {t("template_load_error")}
          </Text>
          <Button backgroundColor={colors.basic.white} onPress={handleBack}>
            <Text color={colors.text.dark}>{commonT("back")}</Text>
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const hasResources = formValues.resources.length > 0;

  return (
    <YStack flex={1} backgroundColor={colors.logo.cyan}>
      {/* 右上裝飾插圖（對齊 product Deco4） */}
      <YStack position="absolute" top={0} right={0} pointerEvents="none">
        <Deco4Svg width={220} height={394} />
      </YStack>

      {/* 點空白關閉類別選單 */}
      {categoryMenuOpen && (
        <Pressable
          style={[StyleSheet.absoluteFillObject, { zIndex: 25 }]}
          onPress={() => setCategoryMenuOpen(false)}
          accessibilityLabel={commonT("close")}
        />
      )}

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1}>
          {/* Header */}
          <XStack padding="$4" alignItems="center">
            <Button
              size="$4"
              circular
              chromeless
              onPress={handleBack}
              accessibilityLabel={commonT("back")}
            >
              <ChevronLeft size={24} color={colors.basic.white} />
            </Button>
          </XStack>

          <ScrollView flex={1} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
            {/* 標題區 */}
            <YStack paddingHorizontal="$5" paddingBottom="$4" gap="$2">
              {/*
                類別 badge + 下拉（對齊 product DropdownMenu）
                選項後 goToRandomTemplate(categoryId)
              */}
              <YStack alignSelf="flex-start" zIndex={30} position="relative">
                {categoryOptions.length > 0 ? (
                  <>
                    <Pressable
                      onPress={() => setCategoryMenuOpen((open) => !open)}
                      disabled={isRefreshing}
                      accessibilityRole="button"
                      accessibilityLabel={categoryLabel}
                      accessibilityState={{ expanded: categoryMenuOpen }}
                    >
                      <Badge backgroundColor={colors.basic.white}>
                        <XStack alignItems="center" gap="$1">
                          <Text fontSize={12} color={colors.text.dark}>
                            {categoryLabel}
                          </Text>
                          <ChevronDown size={12} color={colors.text.dark} opacity={0.7} />
                        </XStack>
                      </Badge>
                    </Pressable>

                    {categoryMenuOpen && (
                      <YStack
                        position="absolute"
                        top="100%"
                        left={0}
                        marginTop={2}
                        minWidth={176}
                        backgroundColor={colors.basic.white}
                        borderRadius={12}
                        paddingVertical={4}
                        shadowColor="#000"
                        shadowOffset={{ width: 0, height: 2 }}
                        shadowOpacity={0.15}
                        shadowRadius={8}
                        elevation={8}
                        zIndex={40}
                      >
                        {categoryOptions.map((category) => {
                          const isSelected = currentCategory === category.id;
                          const Icon = category.Icon;
                          return (
                            <Pressable
                              key={category.id}
                              onPress={() => handleSelectCategory(category.id)}
                              style={({ pressed }) => ({
                                opacity: pressed ? 0.7 : 1,
                                minHeight: 44,
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                              })}
                              accessibilityRole="menuitem"
                              accessibilityState={{ selected: isSelected }}
                            >
                              {Icon ? <Icon width={16} height={16} /> : null}
                              <Text
                                fontSize={14}
                                fontWeight={isSelected ? "500" : "400"}
                                color={isSelected ? colors.logo.cyan : colors.text.dark}
                              >
                                {category.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </YStack>
                    )}
                  </>
                ) : (
                  <Badge backgroundColor={colors.basic.white}>
                    <Text fontSize={12} color={colors.text.dark}>
                      {categoryLabel}
                    </Text>
                  </Badge>
                )}
              </YStack>

              <XStack alignItems="flex-start" gap="$3">
                <YStack flex={1}>
                  <Text fontSize={24} lineHeight={32} fontWeight="600" color={colors.basic.white}>
                    {template.title}
                  </Text>
                </YStack>
                <Button
                  height={35}
                  paddingHorizontal="$3"
                  backgroundColor={colors.basic.white}
                  onPress={handleRefresh}
                  disabled={isRefreshing}
                  accessibilityLabel={t("template_swap")}
                >
                  <XStack alignItems="center" gap="$1.5">
                    {isRefreshing ? (
                      <Spinner size="small" color={colors.text.dark} />
                    ) : (
                      <RefreshCw size={16} color={colors.text.dark} />
                    )}
                    <Text fontSize={14} color={colors.text.dark}>
                      {t("template_swap")}
                    </Text>
                  </XStack>
                </Button>
              </XStack>
            </YStack>

            {/* 白色圓角內容區 — overflow visible 讓指南針可伸出頂部外 */}
            <YStack
              flexGrow={1}
              backgroundColor={colors.basic.white}
              borderTopLeftRadius={16}
              borderTopRightRadius={16}
              paddingHorizontal="$5"
              paddingTop="$5"
              gap="$3.5"
              overflow="visible"
            >
              {/*
                概覽卡 + 指南針（對齊 product）：
                absolute -top-14 -right-1 z-10
                RN：card 有 elevation 會蓋住先前 sibling，故 compass 放 card 之後 + elevation
              */}
              <YStack position="relative" overflow="visible" zIndex={1}>
                <PracticeOverviewCard
                  actionDescription={formValues.actionDescription}
                  frequency={formValues.frequency}
                  durationMinutes={formValues.durationMinutes}
                  tags={formValues.tags}
                />
                <YStack
                  position="absolute"
                  top={-56}
                  right={-4}
                  zIndex={20}
                  elevation={12}
                  pointerEvents="none"
                >
                  <CompassSvg width={109} height={114} />
                </YStack>
              </YStack>

              {/* 執行時機 + 執行時長（兩欄） */}
              <XStack gap="$3">
                <YStack flex={1}>
                  <ExecutionTimingCard
                    executionTiming={formValues.executionTiming}
                    customTiming={formValues.customTiming}
                  />
                </YStack>
                <YStack flex={1}>
                  <ExecutionDurationCard
                    durationDays={formValues.durationDays}
                    startDate={formValues.startDate}
                  />
                </YStack>
              </XStack>

              {/* 推薦資源 — 對齊 product grid-cols-2；標題「Recommended resources」已移除（多餘） */}
              {hasResources && (
                <YStack marginTop={16}>
                  <ResourceGrid>
                    {formValues.resources.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </ResourceGrid>
                </YStack>
              )}
            </YStack>
          </ScrollView>

          {/* 底部 CTA */}
          <YStack
            padding="$5"
            backgroundColor={colors.background.veryLightGray}
            borderTopWidth={1}
            borderTopColor={colors.border.light}
          >
            <Button
              size="$5"
              backgroundColor={colors.logo.orange}
              pressStyle={{ opacity: 0.85 }}
              onPress={handleUseTemplate}
              disabled={isSubmitting}
              accessibilityLabel={t("template_looks_good")}
            >
              <XStack alignItems="center" gap="$2">
                {isSubmitting ? (
                  <>
                    <Spinner size="small" color={colors.basic.white} />
                    <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                      {t("template_creating")}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                      {t("template_looks_good")}
                    </Text>
                    <ArrowRightOutlineSvg width={18} height={18} color={colors.basic.white} />
                  </>
                )}
              </XStack>
            </Button>
          </YStack>
        </YStack>
      </SafeAreaView>
    </YStack>
  );
}
