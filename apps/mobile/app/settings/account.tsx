import { Camera, ChevronLeft, Trash2 } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Button, Card, Input, ScrollView, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useAuth } from "@/providers/AuthProvider";

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call
      Alert.alert("成功", "個人資料已更新");
    } catch (_error) {
      Alert.alert("錯誤", "更新失敗，請稍後再試");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert("刪除帳號", "確定要刪除帳號嗎？此操作無法復原，所有資料將被永久刪除。", [
      { text: "取消", style: "cancel" },
      {
        text: "刪除",
        style: "destructive",
        onPress: async () => {
          // TODO: Implement account deletion
          await signOut();
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
            帳號設定
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack gap="$5">
            {/* Avatar */}
            <YStack alignItems="center" gap="$3">
              <YStack position="relative">
                <Avatar circular size="$8">
                  {user?.avatar ? (
                    <Avatar.Image source={{ uri: user.avatar }} />
                  ) : (
                    <Avatar.Fallback
                      backgroundColor={colors.primary.lighter}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize={32} fontWeight="600" color={colors.primary.darker}>
                        {user?.name?.charAt(0) || "?"}
                      </Text>
                    </Avatar.Fallback>
                  )}
                </Avatar>
                <Button
                  position="absolute"
                  bottom={0}
                  right={0}
                  size="$3"
                  circular
                  backgroundColor={colors.primary.base}
                >
                  <Camera size={16} color={colors.basic.white} />
                </Button>
              </YStack>
              <Text fontSize={13} color="$color" opacity={0.6}>
                點擊更換頭像
              </Text>
            </YStack>

            {/* Profile Fields */}
            <Card
              padding="$4"
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <YStack gap="$4">
                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>
                    姓名
                  </Text>
                  <Input size="$4" value={name} onChangeText={setName} placeholder="輸入你的姓名" />
                </YStack>

                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>
                    電子郵件
                  </Text>
                  <Input size="$4" value={user?.email || ""} disabled opacity={0.6} />
                  <Text fontSize={11} color="$color" opacity={0.5}>
                    電子郵件無法修改
                  </Text>
                </YStack>
              </YStack>
            </Card>

            {/* Save Button */}
            <Button
              size="$4"
              backgroundColor={colors.primary.base}
              pressStyle={{ opacity: 0.8 }}
              onPress={handleSave}
              disabled={isSaving || name === user?.name}
            >
              <Text color={colors.basic.white} fontWeight="600">
                {isSaving ? "儲存中..." : "儲存變更"}
              </Text>
            </Button>

            {/* Danger Zone */}
            <YStack gap="$3" marginTop="$4">
              <Text fontSize={13} fontWeight="600" color={colors.semantic.error}>
                危險區域
              </Text>
              <Button
                size="$4"
                backgroundColor="transparent"
                borderWidth={1}
                borderColor={colors.semantic.error}
                pressStyle={{ backgroundColor: `${colors.semantic.error}10` }}
                onPress={handleDeleteAccount}
              >
                <XStack alignItems="center" gap="$2">
                  <Trash2 size={18} color={colors.semantic.error} />
                  <Text color={colors.semantic.error} fontWeight="600">
                    刪除帳號
                  </Text>
                </XStack>
              </Button>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
