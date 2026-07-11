import {
  type PracticeTemplateType,
  usePracticeTemplateCategories,
  usePracticeTemplates,
} from "@daodao/api";
import ArtSvg from "@daodao/assets/images/categories/art.svg";
import HealthSvg from "@daodao/assets/images/categories/health.svg";
import LanguageSvg from "@daodao/assets/images/categories/language.svg";
import LifeSvg from "@daodao/assets/images/categories/life.svg";
import TechSvg from "@daodao/assets/images/categories/tech.svg";
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

type CategoryIcon = typeof LanguageSvg;

// 對齊 product practiceCategoryMetadataMap：類別 ID → 翻譯 key + 圖示
const categoryMetadataMap: Record<string, { labelKey: string; Icon: CategoryIcon }> = {
  language: { labelKey: "categories.language", Icon: LanguageSvg },
  lifestyle: { labelKey: "categories.lifestyle", Icon: LifeSvg },
  digital_skill: { labelKey: "categories.digital_skill", Icon: TechSvg },
  art_design: { labelKey: "categories.art_design", Icon: ArtSvg },
  wellness: { labelKey: "categories.wellness", Icon: HealthSvg },
};

// 卡片輪播（對齊 product：每頁 2 張、寬度約 80% 讓下一頁露出）
const H_PADDING = 16;
const SLIDE_GAP = 8;
const CARD_HEIGHT = 104;

export default function CreatePracticeScreen() {
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const commonT = useMobileTranslation("common");
  const { width: screenWidth } = useWindowDimensions();

  const slideWidth = Math.round((screenWidth - H_PADDING * 2) * 0.8);

  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: isCategoriesLoading,
  } = usePracticeTemplateCategories();

  const categories = useMemo(() => categoriesData?.data ?? [], [categoriesData]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0] ?? "");
    }
  }, [categories, selectedCategory]);

  const {
    data: templatesData,
    error: templatesError,
    isLoading: isTemplatesLoading,
  } = usePracticeTemplates({
    category: selectedCategory || undefined,
    limit: 16,
  });

  const templates = useMemo(() => templatesData?.data ?? [], [templatesData]);
  const isLoading = isCategoriesLoading || isTemplatesLoading;
  const hasError = categoriesError || templatesError;

  // 每頁 2 張卡片，垂直堆疊，橫向滑動切頁
  const templateGroups = useMemo(() => {
    const groups: PracticeTemplateType[][] = [];
    for (let i = 0; i < templates.length; i += 2) {
      groups.push(templates.slice(i, i + 2));
    }
    return groups;
  }, [templates]);

  const handleReload = () => {
    router.replace("/practices/create");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button
            size="$4"
            circular
            chromeless
            onPress={() => router.back()}
            accessibilityLabel={commonT("back")}
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color">
            {t("create_title")}
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: H_PADDING }}>
          {/* Custom Practice */}
          <Card
            padding="$4"
            backgroundColor={colors.primary.palest}
            borderRadius="$md"
            borderWidth={1}
            borderColor={colors.primary.lighter}
            pressStyle={{ scale: 0.98 }}
            onPress={() => router.push("/practices/create/manual/step1")}
            marginBottom="$5"
          >
            <XStack gap="$3" alignItems="center">
              <YStack
                width={56}
                height={56}
                backgroundColor={colors.primary.base}
                borderRadius={28}
                alignItems="center"
                justifyContent="center"
              >
                <Plus size={28} color={colors.basic.white} />
              </YStack>
              <YStack flex={1} gap="$1">
                <Text fontSize={16} fontWeight="600" color={colors.primary.darker}>
                  {t("create_manual")}
                </Text>
                <Text fontSize={13} color={colors.primary.darker} opacity={0.8}>
                  {t("mobile_create_manual_description")}
                </Text>
              </YStack>
              <ChevronRight size={20} color={colors.primary.darker} />
            </XStack>
          </Card>

          {categories.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} marginBottom="$4">
              <XStack gap="$2">
                {categories.map((category) => {
                  const selected = selectedCategory === category;
                  const meta = categoryMetadataMap[category];
                  const label = meta ? t(meta.labelKey) : category;
                  const Icon = meta?.Icon;
                  return (
                    <Button
                      key={category}
                      size="$3"
                      backgroundColor={selected ? colors.primary.base : "$background"}
                      borderWidth={1}
                      borderColor={selected ? colors.primary.base : "$borderColor"}
                      onPress={() => setSelectedCategory(category)}
                      accessibilityLabel={t("create_select_category_label", { label })}
                    >
                      <XStack alignItems="center" gap="$1.5">
                        {Icon && <Icon width={18} height={18} />}
                        <Text color={selected ? colors.basic.white : "$color"} fontSize={13}>
                          {label}
                        </Text>
                      </XStack>
                    </Button>
                  );
                })}
              </XStack>
            </ScrollView>
          )}

          {isLoading ? (
            <YStack alignItems="center" justifyContent="center" padding="$8">
              <Spinner color={colors.primary.base} />
            </YStack>
          ) : hasError ? (
            <YStack alignItems="center" gap="$3" padding="$8">
              <Text fontSize={14} color="$color" opacity={0.7} textAlign="center">
                {t("create_load_error")}
              </Text>
              <Button onPress={handleReload}>
                <XStack alignItems="center" gap="$2">
                  <RefreshCw size={16} color="$color" />
                  <Text>{t("create_reload")}</Text>
                </XStack>
              </Button>
            </YStack>
          ) : templates.length === 0 ? (
            <YStack alignItems="center" justifyContent="center" padding="$8">
              <Text fontSize={14} color="$color" opacity={0.7}>
                {t("create_no_templates")}
              </Text>
            </YStack>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={slideWidth + SLIDE_GAP}
              decelerationRate="fast"
              contentContainerStyle={{ gap: SLIDE_GAP, paddingRight: H_PADDING }}
            >
              {templateGroups.map((group, groupIndex) => (
                <YStack key={group[0]?.id ?? groupIndex} width={slideWidth} gap="$2">
                  {group.map((template) => {
                    const description =
                      template.practiceAction ||
                      template.suggestedTags?.join("、") ||
                      template.title;

                    return (
                      <Card
                        key={template.id}
                        height={CARD_HEIGHT}
                        paddingHorizontal={24}
                        paddingVertical={16}
                        backgroundColor="rgba(233, 254, 255, 0.7)"
                        borderRadius="$md"
                        borderWidth={2}
                        borderColor={colors.border.lightCyan}
                        pressStyle={{ scale: 0.98 }}
                        onPress={() => router.push(`/practices/create/${template.id}`)}
                        accessibilityRole="button"
                        accessibilityLabel={t("create_select_practice_label", {
                          title: template.title,
                        })}
                      >
                        <XStack flex={1} gap="$2" alignItems="center">
                          <YStack flex={1} justifyContent="center">
                            <Text
                              fontSize={15}
                              fontWeight="500"
                              color={colors.text.dark}
                              numberOfLines={1}
                              marginBottom="$1"
                            >
                              {template.title}
                            </Text>
                            <Text
                              fontSize={13}
                              color={colors.text.dark}
                              opacity={0.7}
                              numberOfLines={2}
                            >
                              {description}
                            </Text>
                          </YStack>
                          <ChevronRight size={18} color={colors.text.dark} />
                        </XStack>
                      </Card>
                    );
                  })}
                </YStack>
              ))}
            </ScrollView>
          )}
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
