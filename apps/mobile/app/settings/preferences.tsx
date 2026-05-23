import { useAvailablePreferences, useCurrentUserPreferences, useUserMutations } from "@daodao/api";
import { Check, ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScrollView, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

function assertSuccessfulResponse(response: { error?: unknown }) {
  if (!response.error) return;

  const error = response.error as { error?: { message?: string }; message?: string };
  throw new Error(error.error?.message ?? error.message ?? "Update failed. Please try again later.");
}

interface IPreferenceOption {
  id: number;
  name: string;
  value: string;
  description?: string | null;
}

interface IPreferenceType {
  id: number;
  name: string;
  description?: string | null;
  maxSelections: number | null;
  options: IPreferenceOption[];
}

interface IUserPreference {
  preferenceTypeId: number;
  optionId: number;
  isSelected: boolean;
}

export default function PreferencesSettingsScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.preferencesSettings");
  const tCommon = useMobileTranslation("common");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateCurrentUserPreferences } = useUserMutations();

  const { data: availablePrefsData, isLoading: isLoadingAvailable } = useAvailablePreferences();
  const { data: userPrefsData, isLoading: isLoadingPrefs } = useCurrentUserPreferences();

  const preferenceTypes = (availablePrefsData?.data ?? []) as IPreferenceType[];
  const userPrefs = (userPrefsData?.data?.preferences ?? []) as IUserPreference[];

  const initialSelections = useMemo(() => {
    const selections: Record<string, number[]> = {};
    preferenceTypes.forEach((type) => {
      selections[String(type.id)] = [];
    });
    if (userPrefs) {
      userPrefs.forEach((pref) => {
        if (pref.isSelected) {
          const typeId = String(pref.preferenceTypeId);
          if (!selections[typeId]) selections[typeId] = [];
          selections[typeId].push(pref.optionId);
        }
      });
    }
    return selections;
  }, [userPrefs, preferenceTypes]);

  const [selections, setSelections] = useState<Record<string, number[]>>({});
  const isDirty = useMemo(
    () => JSON.stringify(selections) !== JSON.stringify(initialSelections),
    [initialSelections, selections]
  );

  useEffect(() => {
    if (Object.keys(initialSelections).length > 0) {
      setSelections(initialSelections);
    }
  }, [initialSelections]);

  const handleBack = () => {
    if (!isDirty) {
      router.back();
      return;
    }

    Alert.alert(t("unsavedTitle"), t("unsavedMessage"), [
      { text: t("keepEditing"), style: "cancel" },
      { text: t("leave"), style: "destructive", onPress: () => router.back() },
    ]);
  };

  const toggleOption = useCallback(
    (typeId: string, optionId: number, maxSelections: number | null) => {
      setSelections((prev) => {
        const current = prev[typeId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [typeId]: current.filter((id) => id !== optionId) };
        }
        if (maxSelections && current.length >= maxSelections) {
          return prev;
        }
        return { ...prev, [typeId]: [...current, optionId] };
      });
    },
    []
  );

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const preferenceItems: Array<{
        preferenceTypeId: number;
        optionId: number;
        isSelected: boolean;
      }> = [];

      preferenceTypes.forEach((preferenceType) => {
        const typeId = String(preferenceType.id);
        const selectedIds = selections[typeId] || [];
        preferenceType.options.forEach((option) => {
          preferenceItems.push({
            preferenceTypeId: preferenceType.id,
            optionId: option.id,
            isSelected: selectedIds.includes(option.id),
          });
        });
      });

      const response = await updateCurrentUserPreferences({ preferences: preferenceItems });
      assertSuccessfulResponse(response);

      Alert.alert(t("successTitle"), t("saveSuccess"), [
        { text: t("confirm"), onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(t("errorTitle"), error instanceof Error ? error.message : t("saveError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingPrefs || isLoadingAvailable;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button
            size="$4"
            circular
            chromeless
            onPress={handleBack}
            accessibilityLabel={tCommon("back")}
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color" flex={1}>
            {t("title")}
          </Text>
          <Button
            size="$3"
            backgroundColor={colors.primary.base}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleSave}
            disabled={isSubmitting || isLoading || !isDirty}
            opacity={isDirty ? 1 : 0.55}
          >
            <Text color={colors.basic.white} fontWeight="600" fontSize={14}>
              {isSubmitting ? t("saving") : t("save")}
            </Text>
          </Button>
        </XStack>

        {isLoading ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Text fontSize={14} color="$color" opacity={0.5}>
              {t("loading")}
            </Text>
          </YStack>
        ) : preferenceTypes.length === 0 ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Text fontSize={14} color="$color" opacity={0.5}>
              {t("empty")}
            </Text>
          </YStack>
        ) : (
          <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
            <YStack gap="$5">
              {preferenceTypes.map((preferenceType) => {
                const typeId = String(preferenceType.id);
                const selectedIds = selections[typeId] || [];
                return (
                  <YStack key={preferenceType.id} gap="$3">
                    <YStack gap="$1" paddingLeft="$1">
                      <Text fontSize={15} fontWeight="600" color="$color">
                        {preferenceType.name}
                      </Text>
                      {preferenceType.description && (
                        <Text fontSize={12} color="$color" opacity={0.5}>
                          {preferenceType.description}
                        </Text>
                      )}
                      {preferenceType.maxSelections && (
                        <Text fontSize={12} color="$color" opacity={0.5}>
                          {t("selection_count", {
                            max: preferenceType.maxSelections,
                            count: selectedIds.length,
                          })}
                        </Text>
                      )}
                    </YStack>
                    <XStack flexWrap="wrap" gap="$2">
                      {preferenceType.options.map((option) => {
                        const isSelected = selectedIds.includes(option.id);
                        return (
                          <Button
                            key={option.id}
                            size="$3"
                            backgroundColor={isSelected ? colors.primary.palest : "$background"}
                            borderWidth={1}
                            borderColor={isSelected ? colors.primary.base : "$borderColor"}
                            pressStyle={{ opacity: 0.7 }}
                            onPress={() =>
                              toggleOption(typeId, option.id, preferenceType.maxSelections)
                            }
                          >
                            <XStack alignItems="center" gap="$1">
                              {isSelected && <Check size={14} color={colors.primary.base} />}
                              <Text
                                fontSize={13}
                                color={isSelected ? colors.primary.base : "$color"}
                              >
                                {option.name}
                              </Text>
                            </XStack>
                          </Button>
                        );
                      })}
                    </XStack>
                  </YStack>
                );
              })}
            </YStack>
          </ScrollView>
        )}
      </YStack>
    </SafeAreaView>
  );
}
