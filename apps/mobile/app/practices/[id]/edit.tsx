import { ChevronLeft } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { updatePractice, usePracticeById } from "@daodao/api";
import { colors } from "@/generated/design-tokens";

export default function PracticeEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = usePracticeById(id ?? "");
  const practice = data?.data;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (practice) {
      setTitle((practice as any).title ?? "");
      setDescription((practice as any).practiceAction ?? "");
    }
  }, [practice]);

  const handleSave = async () => {
    if (!id || !title.trim()) {
      Alert.alert("請填寫標題");
      return;
    }
    setIsSaving(true);
    try {
      const response = await updatePractice(id, {
        title: title.trim(),
        practiceAction: description.trim() || undefined,
      } as any);
      if (response.error) {
        throw new Error("更新失敗");
      }
      router.back();
    } catch (e) {
      Alert.alert("儲存失敗", e instanceof Error ? e.message : "請稍後再試");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.primary.base} />
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap="$2">
            <Button size="$4" circular chromeless onPress={() => router.back()} accessibilityLabel="返回">
              <ChevronLeft size={24} color="$color" />
            </Button>
            <Text fontSize={18} fontWeight="600" color="$color">編輯實踐</Text>
          </XStack>
          <Button
            size="$3"
            backgroundColor={colors.primary.base}
            borderRadius="$md"
            disabled={isSaving}
            onPress={handleSave}
            pressStyle={{ opacity: 0.8 }}
          >
            {isSaving ? (
              <Spinner size="small" color="white" />
            ) : (
              <Text color="white" fontWeight="500">儲存</Text>
            )}
          </Button>
        </XStack>

        <ScrollView flex={1} padding="$4" contentContainerStyle={{ gap: 16 }}>
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color={colors.text.dark}>標題</Text>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="實踐標題"
              fontSize={16}
              borderColor="$borderColor"
              focusStyle={{ borderColor: colors.primary.base }}
            />
          </YStack>

          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color={colors.text.dark}>實踐行動</Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="描述你的實踐行動"
              multiline
              numberOfLines={4}
              fontSize={14}
              borderColor="$borderColor"
              focusStyle={{ borderColor: colors.primary.base }}
            />
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
