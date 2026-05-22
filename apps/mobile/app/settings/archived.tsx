import { useMyPractices, useUnarchivePractice } from "@daodao/api";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Text, XStack, YStack } from "tamagui";

interface IArchivedPractice {
  id: string;
  title: string;
  practiceAction?: string;
}

export default function ArchivedContentScreen() {
  const router = useRouter();
  const [unarchivingIds, setUnarchivingIds] = useState<Set<string>>(new Set());
  const { unarchivePractice } = useUnarchivePractice();

  const {
    data: practicesData,
    isLoading,
    error,
    mutate,
  } = useMyPractices({ status: "archived", limit: 100 });

  const items = (practicesData?.data ?? []) as IArchivedPractice[];

  const handleUnarchive = async (practiceId: string) => {
    if (unarchivingIds.has(practiceId)) return;
    setUnarchivingIds((prev) => new Set(prev).add(practiceId));
    try {
      await unarchivePractice(practiceId);
      await mutate();
    } catch {
      Alert.alert("錯誤", "取消封存失敗，請稍後再試");
    } finally {
      setUnarchivingIds((prev) => {
        const next = new Set(prev);
        next.delete(practiceId);
        return next;
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button
            size="$4"
            circular
            chromeless
            onPress={() => router.back()}
            accessibilityLabel="返回"
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color">
            已封存的內容
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          {isLoading ? (
            <YStack alignItems="center" paddingVertical="$8">
              <Text fontSize={14} color="$color" opacity={0.5}>
                載入中...
              </Text>
            </YStack>
          ) : error ? (
            <YStack alignItems="center" paddingVertical="$8">
              <Text fontSize={14} color="$color" opacity={0.5}>
                載入失敗，請稍後再試
              </Text>
            </YStack>
          ) : items.length === 0 ? (
            <YStack alignItems="center" paddingVertical="$8">
              <Text fontSize={14} color="$color" opacity={0.5}>
                尚無已封存的內容
              </Text>
            </YStack>
          ) : (
            <YStack gap="$3">
              <Text fontSize={15} fontWeight="600" color="$color" paddingLeft="$1">
                主題實踐
              </Text>
              {items.map((practice) => (
                <Card
                  key={practice.id}
                  padding="$4"
                  backgroundColor="$background"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <XStack alignItems="center" gap="$3">
                    <YStack flex={1}>
                      <Text fontSize={15} fontWeight="500" color="$color" numberOfLines={1}>
                        {practice.title}
                      </Text>
                      {practice.practiceAction && (
                        <Text fontSize={12} color="$color" opacity={0.5} numberOfLines={1}>
                          {practice.practiceAction}
                        </Text>
                      )}
                    </YStack>
                    <Button
                      size="$3"
                      backgroundColor="transparent"
                      borderWidth={1}
                      borderColor="$borderColor"
                      onPress={() => handleUnarchive(practice.id)}
                      disabled={unarchivingIds.has(practice.id)}
                    >
                      <Text fontSize={12} color="$color">
                        {unarchivingIds.has(practice.id) ? "處理中..." : "取消封存"}
                      </Text>
                    </Button>
                  </XStack>
                </Card>
              ))}
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
