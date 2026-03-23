import { Camera, ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Avatar,
  Button,
  Card,
  Input,
  ScrollView,
  Switch,
  Text,
  TextArea,
  XStack,
  YStack,
} from "tamagui";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/services/api-client";
import { colors } from "@/generated/design-tokens";

export default function PublicInfoSettingsScreen() {
  const router = useRouter();
  const { user, isLoading, mutate } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [customId, setCustomId] = useState("");
  const [personalSlogan, setPersonalSlogan] = useState("");
  const [selfIntroduction, setSelfIntroduction] = useState("");
  const [hideConnectionsCount, setHideConnectionsCount] = useState(false);

  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [discord, setDiscord] = useState("");
  const [line, setLine] = useState("");
  const [threads, setThreads] = useState("");
  const [personalUrl, setPersonalUrl] = useState("");

  useEffect(() => {
    if (user) {
      const u = user as unknown as Record<string, unknown>;
      const contactList = (u.contactList ?? {}) as Record<string, string>;
      setName((u.name as string) || "");
      setCustomId((u.customId as string) || "");
      setPersonalSlogan((u.personalSlogan as string) || "");
      setSelfIntroduction((u.selfIntroduction as string) || "");
      setHideConnectionsCount((u.hideConnectionsCount as boolean) ?? false);
      setFacebook(contactList.facebook || "");
      setInstagram(contactList.instagram || "");
      setLinkedin(contactList.linkedin || "");
      setGithub(contactList.github || "");
      setDiscord(contactList.discord || "");
      setLine(contactList.line || "");
      setThreads(contactList.threads || "");
      setPersonalUrl(contactList.website || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("錯誤", "姓名不可為空");
      return;
    }
    setIsSubmitting(true);
    try {
      const currentCustomId = (user as unknown as Record<string, unknown>)?.customId as string || "";
      await api.put("/users/me", {
        name,
        ...(customId !== currentCustomId ? { customId } : {}),
        personalSlogan,
        selfIntroduction,
        hideConnectionsCount,
        contactList: {
          facebook,
          instagram,
          linkedin,
          github,
          discord,
          line,
          threads,
          website: personalUrl,
        },
      });
      await mutate();
      Alert.alert("成功", "公開資訊已更新", [
        { text: "確定", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("錯誤", "更新失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
          <Text fontSize={14} color="$color" opacity={0.5}>載入中...</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button size="$4" circular chromeless onPress={() => router.back()} accessibilityLabel="返回">
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color" flex={1}>公開資訊設定</Text>
          <Button size="$3" backgroundColor={colors.primary.base} pressStyle={{ opacity: 0.8 }} onPress={handleSave} disabled={isSubmitting}>
            <Text color={colors.basic.white} fontWeight="600" fontSize={14}>{isSubmitting ? "儲存中..." : "儲存"}</Text>
          </Button>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <YStack gap="$5">
            {/* 頭像 */}
            <YStack alignItems="center" gap="$3">
              <YStack position="relative">
                <Avatar circular size="$8">
                  {user?.photoURL ? (
                    <Avatar.Image source={{ uri: user.photoURL }} />
                  ) : (
                    <Avatar.Fallback backgroundColor={colors.primary.lighter}>
                      <Text fontSize={32} fontWeight="600" color={colors.primary.darker}>{name?.charAt(0) || "?"}</Text>
                    </Avatar.Fallback>
                  )}
                </Avatar>
                <Button position="absolute" bottom={0} right={0} size="$3" circular backgroundColor={colors.primary.base}>
                  <Camera size={16} color={colors.basic.white} />
                </Button>
              </YStack>
            </YStack>

            {/* 基本資料 */}
            <Card padding="$4" backgroundColor="$background" borderRadius="$md" borderWidth={1} borderColor="$borderColor">
              <YStack gap="$4">
                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>姓名</Text>
                  <Input size="$4" value={name} onChangeText={setName} placeholder="輸入你的姓名" />
                </YStack>
                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>自訂 ID</Text>
                  <Input size="$4" value={customId} onChangeText={setCustomId} placeholder="自訂你的 ID" autoCapitalize="none" />
                </YStack>
              </YStack>
            </Card>

            {/* 自我介紹 */}
            <Card padding="$4" backgroundColor="$background" borderRadius="$md" borderWidth={1} borderColor="$borderColor">
              <YStack gap="$4">
                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>個人標語</Text>
                  <Input size="$4" value={personalSlogan} onChangeText={setPersonalSlogan} placeholder="一句話介紹自己" />
                </YStack>
                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>自我介紹</Text>
                  <TextArea size="$4" value={selfIntroduction} onChangeText={setSelfIntroduction} placeholder="詳細介紹自己" numberOfLines={4} />
                </YStack>
              </YStack>
            </Card>

            {/* 社群連結 */}
            <Card padding="$4" backgroundColor="$background" borderRadius="$md" borderWidth={1} borderColor="$borderColor">
              <YStack gap="$4">
                <Text fontSize={15} fontWeight="600" color="$color">社群連結</Text>
                {[
                  { label: "個人網站", value: personalUrl, setter: setPersonalUrl },
                  { label: "Facebook", value: facebook, setter: setFacebook },
                  { label: "Instagram", value: instagram, setter: setInstagram },
                  { label: "LinkedIn", value: linkedin, setter: setLinkedin },
                  { label: "Github", value: github, setter: setGithub },
                  { label: "Discord", value: discord, setter: setDiscord },
                  { label: "Line", value: line, setter: setLine },
                  { label: "Threads", value: threads, setter: setThreads },
                ].map(({ label, value, setter }) => (
                  <YStack key={label} gap="$1">
                    <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>{label}</Text>
                    <Input size="$4" value={value} onChangeText={setter} placeholder={label} autoCapitalize="none" autoCorrect={false} />
                  </YStack>
                ))}
              </YStack>
            </Card>

            {/* 隱私設定 */}
            <Card padding="$4" backgroundColor="$background" borderRadius="$md" borderWidth={1} borderColor="$borderColor">
              <XStack alignItems="center" justifyContent="space-between">
                <YStack flex={1} gap="$1">
                  <Text fontSize={15} color="$color">隱藏連結數量</Text>
                  <Text fontSize={12} color="$color" opacity={0.5}>開啟後，其他人將看不到你的連結夥伴數量</Text>
                </YStack>
                <Switch checked={hideConnectionsCount} onCheckedChange={setHideConnectionsCount} backgroundColor={hideConnectionsCount ? colors.primary.base : colors.basic[300]}>
                  <Switch.Thumb />
                </Switch>
              </XStack>
            </Card>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
