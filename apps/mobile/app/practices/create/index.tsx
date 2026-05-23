import { type PracticeTemplateType, usePracticeTemplateCategories, usePracticeTemplates } from "@daodao/api";
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

const categoryColorMap: Record<string, string> = {
  learning: colors.practice.blue,
  health: colors.practice.green,
  mindfulness: colors.practice.pink,
  creativity: colors.practice.yellow,
  skill: colors.primary.base,
  life: colors.semantic.warning,
};

const getCategoryColor = (category: string, index = 0) => {
  const fallbackColors = [
    colors.practice.blue,
    colors.practice.green,
    colors.practice.pink,
    colors.practice.yellow,
    colors.primary.base,
    colors.semantic.warning,
  ];

  return categoryColorMap[category] ?? fallbackColors[index % fallbackColors.length] ?? colors.primary.base;
};

export default function CreatePracticeScreen() {
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const commonT = useMobileTranslation("common");

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

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
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
                {categories.map((category, index) => {
                  const selected = selectedCategory === category;
                  return (
                    <Button
                      key={category}
                      size="$3"
                      backgroundColor={selected ? getCategoryColor(category, index) : "$background"}
                      borderWidth={1}
                      borderColor={selected ? getCategoryColor(category, index) : "$borderColor"}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text color={selected ? colors.basic.white : "$color"} fontSize={13}>
                        {category}
                      </Text>
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
            <YStack gap="$3">
              {templates.map((template: PracticeTemplateType, index) => {
                const color = getCategoryColor(selectedCategory, index);
                const description =
                  template.practiceAction || template.suggestedTags?.join("、") || template.title;

                return (
                  <Card
                    key={template.id}
                    padding="$4"
                    backgroundColor="$background"
                    borderRadius="$md"
                    borderWidth={1}
                    borderColor="$borderColor"
                    pressStyle={{ scale: 0.98 }}
                    onPress={() => router.push(`/practices/create/${template.id}`)}
                  >
                    <XStack gap="$3" alignItems="center">
                      <YStack
                        width={48}
                        height={48}
                        backgroundColor={`${color}20`}
                        borderRadius={24}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize={20} color={color} fontWeight="700">
                          {template.title.slice(0, 1)}
                        </Text>
                      </YStack>
                      <YStack flex={1} gap="$1">
                        <Text fontSize={15} fontWeight="600" color="$color" numberOfLines={1}>
                          {template.title}
                        </Text>
                        <Text fontSize={12} color="$color" opacity={0.6} numberOfLines={2}>
                          {description}
                        </Text>
                      </YStack>
                      <ChevronRight size={20} color="$color" opacity={0.4} />
                    </XStack>
                  </Card>
                );
              })}
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
