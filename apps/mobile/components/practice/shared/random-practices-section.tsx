import { type PracticeTemplateType, useRandomPracticeTemplates } from "@daodao/api";
import { ArrowRight } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Button, Text, View, XStack, YStack } from "tamagui";
import { PRACTICE_THEMES, PracticeTheme, practiceThemeColorMap } from "@/constants/practice-theme";
import { colors } from "@/generated/design-tokens";

interface IRandomPractice {
  id: string;
  title: string;
  description: string;
  templateId: string;
}

// Convert API template to practice
const convertTemplateToRandomPractice = (template: PracticeTemplateType): IRandomPractice => {
  return {
    id: template.id,
    title: template.title,
    description: template.practiceAction || template.suggestedTags.join("、") || template.title,
    templateId: template.id,
  };
};

interface IRandomPracticeCardProps {
  practice: IRandomPractice;
  theme: PracticeTheme;
  onAction: () => void;
}

const RandomPracticeCard = ({ practice, theme, onAction }: IRandomPracticeCardProps) => {
  const themeColor = practiceThemeColorMap[theme] || practiceThemeColorMap[PracticeTheme.yellow];

  return (
    <Pressable
      style={[styles.practiceCard, { backgroundColor: themeColor }]}
      onPress={onAction}
      accessibilityLabel={`實踐：${practice.title}`}
      accessibilityRole="button"
    >
      <YStack flex={1} justifyContent="space-between" padding="$4">
        <YStack gap="$2">
          <View style={styles.themeBadge}>
            <Text fontSize={12} color={colors.text.dark}>
              主題實踐
            </Text>
          </View>
          <Text fontSize={18} fontWeight="500" color={colors.text.dark} numberOfLines={2}>
            {practice.title}
          </Text>
          <Text fontSize={12} color={colors.text.dark} numberOfLines={2}>
            {practice.description}
          </Text>
        </YStack>
        <Button
          backgroundColor={colors.basic.white}
          pressStyle={{ opacity: 0.8 }}
          onPress={onAction}
        >
          <Text color={colors.text.dark} fontWeight="500">
            馬上行動
          </Text>
        </Button>
      </YStack>
    </Pressable>
  );
};

interface IRandomPracticesSectionProps {
  practices?: IRandomPractice[];
  compact?: boolean;
}

/**
 * 隨機實踐推薦區域 (Mobile)
 */
export const RandomPracticesSection = ({
  practices: propPractices,
  compact = false,
}: IRandomPracticesSectionProps) => {
  const router = useRouter();

  // Get 3 random templates
  const { data: randomTemplatesData } = useRandomPracticeTemplates({
    count: 3,
  });

  // Convert API data to practices
  const practices = useMemo(() => {
    if (propPractices && propPractices.length > 0) {
      return propPractices;
    }

    if (!randomTemplatesData?.data || randomTemplatesData.data.length === 0) {
      return [];
    }

    return randomTemplatesData.data.map(convertTemplateToRandomPractice);
  }, [propPractices, randomTemplatesData]);

  // Assign theme colors to practices
  const practicesWithTheme = useMemo(() => {
    return practices.map((practice, index) => {
      const themeIndex = index % PRACTICE_THEMES.length;
      const theme = PRACTICE_THEMES[themeIndex] ?? PracticeTheme.yellow;
      return { ...practice, theme };
    });
  }, [practices]);

  const handleAction = useCallback(
    (templateId: string) => {
      router.push(`/practices/create/template/${templateId}` as const);
    },
    [router]
  );

  const handleMoreThemes = useCallback(() => {
    router.push("/practices/create" as const);
  }, [router]);

  if (practices.length === 0) {
    return null;
  }

  return (
    <YStack paddingHorizontal={compact ? 0 : "$4"} paddingTop={compact ? 0 : "$4"}>
      {/* Header Section */}
      <View style={styles.headerCard}>
        <Text
          fontSize={16}
          fontWeight="500"
          color={colors.text.dark}
          textAlign="center"
          marginBottom="$4"
        >
          從好奇開始, 一起小步實踐生活裡的學習靈感。
        </Text>

        {/* Practice Cards */}
        <YStack gap="$3" marginBottom="$4">
          {practicesWithTheme.map((practice) => (
            <RandomPracticeCard
              key={practice.id}
              practice={practice}
              theme={practice.theme}
              onAction={() => handleAction(practice.templateId)}
            />
          ))}
        </YStack>

        {/* More Button */}
        <Button
          backgroundColor={colors.text.dark}
          pressStyle={{ opacity: 0.8 }}
          onPress={handleMoreThemes}
          width="100%"
          maxWidth={240}
          alignSelf="center"
        >
          <XStack alignItems="center" gap="$2">
            <Text color={colors.basic.white} fontWeight="500">
              更多主題
            </Text>
            <ArrowRight size={18} color={colors.basic.white} />
          </XStack>
        </Button>
      </View>
    </YStack>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: colors.basic.white,
    borderRadius: 12,
    padding: 16,
    maxWidth: 640,
    alignSelf: "center",
    width: "100%",
  },
  practiceCard: {
    borderRadius: 12,
    minHeight: 180,
    width: "100%",
  },
  themeBadge: {
    backgroundColor: colors.basic.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
});
