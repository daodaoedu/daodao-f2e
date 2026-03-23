import { Check, ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Text, XStack, YStack } from "tamagui";
import useSWR from "swr";
import { api } from "@/services/api-client";
import { colors } from "@/generated/design-tokens";

interface PreferenceOption {
  id: number;
  name: string;
  value: string;
  description?: string | null;
}

interface PreferenceType {
  id: number;
  name: string;
  description?: string | null;
  maxSelections: number | null;
  options: PreferenceOption[];
}

interface UserPreference {
  preferenceTypeId: number;
  optionId: number;
  isSelected: boolean;
}

export default function PreferencesSettingsScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: availableTypes, isLoading: isLoadingAvailable } = useSWR<PreferenceType[]>(
    "/users/preferences/available",
    () => api.get<{ data: PreferenceType[] }>("/users/preferences/available").then((r) => r.data),
    { revalidateOnFocus: false }
  );

  const { data: userPrefs, isLoading: isLoadingPrefs } = useSWR<UserPreference[]>(
    "/users/me/preferences",
    () => api.get<{ data: { preferences: UserPreference[] } }>("/users/me/preferences").then((r) => r.data.preferences),
    { revalidateOnFocus: false }
  );

  const preferenceTypes = availableTypes ?? [];

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

  useEffect(() => {
    if (Object.keys(initialSelections).length > 0) {
      setSelections(initialSelections);
    }
  }, [initialSelections]);

  const toggleOption = useCallback((typeId: string, optionId: number, maxSelections: number | null) => {
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
  }, []);

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

      await api.put("/users/me/preferences", { preferences: preferenceItems });

      Alert.alert("成功", "偏好設定已更新", [
        { text: "確定", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("錯誤", "更新失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingPrefs || isLoadingAvailable;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button size="$4" circular chromeless onPress={() => router.back()} accessibilityLabel="返回">
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color" flex={1}>領域偏好設定</Text>
          <Button size="$3" backgroundColor={colors.primary.base} pressStyle={{ opacity: 0.8 }} onPress={handleSave} disabled={isSubmitting || isLoading}>
            <Text color={colors.basic.white} fontWeight="600" fontSize={14}>{isSubmitting ? "儲存中..." : "儲存"}</Text>
          </Button>
        </XStack>

        {isLoading ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Text fontSize={14} color="$color" opacity={0.5}>載入中...</Text>
          </YStack>
        ) : preferenceTypes.length === 0 ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Text fontSize={14} color="$color" opacity={0.5}>目前沒有可用的偏好設定</Text>
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
                      <Text fontSize={15} fontWeight="600" color="$color">{preferenceType.name}</Text>
                      {preferenceType.description && (
                        <Text fontSize={12} color="$color" opacity={0.5}>{preferenceType.description}</Text>
                      )}
                      {preferenceType.maxSelections && (
                        <Text fontSize={12} color="$color" opacity={0.5}>
                          最多選 {preferenceType.maxSelections} 項（已選 {selectedIds.length} 項）
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
                            onPress={() => toggleOption(typeId, option.id, preferenceType.maxSelections)}
                          >
                            <XStack alignItems="center" gap="$1">
                              {isSelected && <Check size={14} color={colors.primary.base} />}
                              <Text fontSize={13} color={isSelected ? colors.primary.base : "$color"}>{option.name}</Text>
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
