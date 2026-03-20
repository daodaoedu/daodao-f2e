import { deletePractice, useMyPractices, useUnarchivePractice } from "@daodao/api";
import { Archive, ChevronLeft, RotateCcw, Trash2 } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Text, XStack, YStack } from "tamagui";
import { ProgressRing } from "@/components";
import { colors } from "@/generated/design-tokens";

export default function ArchivedPracticesScreen() {
  const router = useRouter();
  const { data, mutate } = useMyPractices({ status: "archived" } as any);
  const allPractices = (data?.data as any[]) ?? [];
  const archivedPractices = allPractices.filter((p: any) => p.status === "archived");
  const { unarchivePractice } = useUnarchivePractice();

  const handleRestore = (practice: { id: string; title: string }) => {
    Alert.alert("恢復實踐", `確定要恢復「${practice.title}」嗎？`, [
      { text: "取消", style: "cancel" },
      {
        text: "恢復",
        onPress: async () => {
          try {
            await unarchivePractice(practice.id);
            await mutate();
          } catch (e) {
            Alert.alert("恢復失敗", e instanceof Error ? e.message : "請稍後再試");
          }
        },
      },
    ]);
  };

  const handleDelete = (practice: { id: string; title: string }) => {
    Alert.alert("永久刪除", `確定要永久刪除「${practice.title}」嗎？此操作無法復原。`, [
      { text: "取消", style: "cancel" },
      {
        text: "刪除",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePractice(practice.id);
            await mutate();
          } catch (e) {
            Alert.alert("刪除失敗", e instanceof Error ? e.message : "請稍後再試");
          }
        },
      },
    ]);
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
            accessibilityLabel="返回"
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color">
            已封存實踐
          </Text>
        </XStack>

        {archivedPractices.length === 0 ? (
          <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" gap="$4">
            <YStack
              width={80}
              height={80}
              backgroundColor={colors.basic[100]}
              borderRadius={40}
              alignItems="center"
              justifyContent="center"
            >
              <Archive size={40} color={colors.basic[300]} />
            </YStack>
            <YStack alignItems="center" gap="$2">
              <Text fontSize={18} fontWeight="600" color="$color">
                沒有封存的實踐
              </Text>
              <Text fontSize={14} color="$color" opacity={0.6} textAlign="center">
                當你封存實踐時，它們會出現在這裡
              </Text>
            </YStack>
          </YStack>
        ) : (
          <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
            <YStack gap="$3">
              {archivedPractices.map((practice: any) => {
                const progress =
                  practice.targetDays > 0
                    ? Math.round((practice.completedDays / practice.targetDays) * 100)
                    : 0;
                const cardColor = practice.color || colors.primary.base;

                return (
                  <Card
                    key={practice.id}
                    padding="$4"
                    backgroundColor="$background"
                    borderRadius="$md"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <YStack gap="$3">
                      <XStack gap="$3" alignItems="center">
                        <ProgressRing
                          progress={progress}
                          size={48}
                          strokeWidth={4}
                          color={cardColor}
                          showLabel={false}
                        />
                        <YStack flex={1} gap="$1">
                          <Text fontSize={16} fontWeight="600" color="$color">
                            {practice.title}
                          </Text>
                          <Text fontSize={12} color="$color" opacity={0.6}>
                            {practice.completedDays} / {practice.targetDays} 天完成
                          </Text>
                        </YStack>
                      </XStack>

                      <XStack gap="$2">
                        <Button
                          flex={1}
                          size="$3"
                          backgroundColor={colors.primary.palest}
                          borderWidth={1}
                          borderColor={colors.primary.lighter}
                          pressStyle={{ backgroundColor: colors.primary.lighter }}
                          onPress={() => handleRestore(practice)}
                        >
                          <XStack alignItems="center" gap="$1">
                            <RotateCcw size={14} color={colors.primary.base} />
                            <Text fontSize={13} color={colors.primary.base} fontWeight="500">
                              恢復
                            </Text>
                          </XStack>
                        </Button>

                        <Button
                          flex={1}
                          size="$3"
                          backgroundColor={`${colors.semantic.error}10`}
                          borderWidth={1}
                          borderColor={`${colors.semantic.error}30`}
                          pressStyle={{ backgroundColor: `${colors.semantic.error}20` }}
                          onPress={() => handleDelete(practice)}
                        >
                          <XStack alignItems="center" gap="$1">
                            <Trash2 size={14} color={colors.semantic.error} />
                            <Text fontSize={13} color={colors.semantic.error} fontWeight="500">
                              刪除
                            </Text>
                          </XStack>
                        </Button>
                      </XStack>
                    </YStack>
                  </Card>
                );
              })}
            </YStack>

            {/* Info */}
            <YStack
              marginTop="$4"
              padding="$4"
              backgroundColor={colors.basic[100]}
              borderRadius="$md"
              gap="$2"
            >
              <Text fontSize={13} color="$color" opacity={0.6}>
                提示：封存的實踐不會計入統計，但可以隨時恢復。永久刪除後將無法復原。
              </Text>
            </YStack>
          </ScrollView>
        )}
      </YStack>
    </SafeAreaView>
  );
}
