import { Check, ChevronDown, ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Input, ScrollView, Text, XStack, YStack } from "tamagui";
import {
  AVAILABLE_FIELDS,
  EDUCATION_STAGE_OPTIONS,
  INTEREST_CATEGORIES,
  POSITION_OPTIONS,
} from "@/constants/settings";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/services/api-client";

type FieldOptionType = { value: string; label: string };

function FieldSelectionModal({
  visible,
  title,
  options,
  selected,
  maxSelection,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  options: readonly FieldOptionType[];
  selected: string[];
  maxSelection: number;
  onClose: () => void;
  onConfirm: (selected: string[]) => void;
}) {
  const [localSelected, setLocalSelected] = useState<string[]>(selected);

  useEffect(() => {
    if (visible) setLocalSelected(selected);
  }, [visible, selected]);

  const toggle = (value: string) => {
    setLocalSelected((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (prev.length >= maxSelection) return prev;
      return [...prev, value];
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background">
          <XStack padding="$4" alignItems="center" justifyContent="space-between">
            <Button size="$3" chromeless onPress={onClose}>
              <Text fontSize={14} color="$color">
                取消
              </Text>
            </Button>
            <Text fontSize={16} fontWeight="600" color="$color">
              {title}
            </Text>
            <Button
              size="$3"
              chromeless
              onPress={() => {
                onConfirm(localSelected);
                onClose();
              }}
            >
              <Text fontSize={14} color={colors.primary.base} fontWeight="600">
                確定
              </Text>
            </Button>
          </XStack>
          <Text fontSize={12} color="$color" opacity={0.5} paddingHorizontal="$4" marginBottom="$2">
            最多選 {maxSelection} 項（已選 {localSelected.length} 項）
          </Text>
          <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
            <XStack flexWrap="wrap" gap="$2">
              {options.map((opt) => {
                const isSelected = localSelected.includes(opt.value);
                return (
                  <Button
                    key={opt.value}
                    size="$3"
                    backgroundColor={isSelected ? colors.primary.palest : "$background"}
                    borderWidth={1}
                    borderColor={isSelected ? colors.primary.base : "$borderColor"}
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => toggle(opt.value)}
                  >
                    <XStack alignItems="center" gap="$1">
                      {isSelected && <Check size={14} color={colors.primary.base} />}
                      <Text fontSize={13} color={isSelected ? colors.primary.base : "$color"}>
                        {opt.label}
                      </Text>
                    </XStack>
                  </Button>
                );
              })}
            </XStack>
          </ScrollView>
        </YStack>
      </SafeAreaView>
    </Modal>
  );
}

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { user, isLoading, mutate } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [educationStage, setEducationStage] = useState("");
  const [position, setPosition] = useState<string[]>([]);
  const [professionalFields, setProfessionalFields] = useState<string[]>([]);
  const [explorationFields, setExplorationFields] = useState<string[]>([]);

  // Modal states
  const [showEducationPicker, setShowEducationPicker] = useState(false);
  const [activeFieldModal, setActiveFieldModal] = useState<{
    title: string;
    options: readonly FieldOptionType[];
    selected: string[];
    maxSelection: number;
    onConfirm: (selected: string[]) => void;
  } | null>(null);

  useEffect(() => {
    if (user) {
      const u = user as unknown as Record<string, unknown>;
      setEmail((u.email as string) || "");
      setBirthday((u.birthDay as string) || "");
      setEducationStage((u.educationStage as string) || "");
      setPosition((u.positionList as string[]) || []);
      setProfessionalFields((u.professionalField as string[]) || []);
      setExplorationFields((u.interestList as string[]) || []);
    }
  }, [user]);

  const getLabel = useCallback((options: readonly FieldOptionType[], value: string) => {
    return options.find((o) => o.value === value)?.label ?? value;
  }, []);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const updateData: Record<string, unknown> = {
        positionList: position,
        professionalField: professionalFields,
        interestList: explorationFields,
      };
      if (educationStage) updateData.educationStage = educationStage;

      await api.put("/users/me", updateData);
      await mutate();
      Alert.alert("成功", "帳號設定已更新", [{ text: "確定", onPress: () => router.back() }]);
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
          <Text fontSize={14} color="$color" opacity={0.5}>
            載入中...
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

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
          <Text fontSize={18} fontWeight="600" color="$color" flex={1}>
            帳號設定
          </Text>
          <Button
            size="$3"
            backgroundColor={colors.primary.base}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <Text color={colors.basic.white} fontWeight="600" fontSize={14}>
              {isSubmitting ? "儲存中..." : "儲存"}
            </Text>
          </Button>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <YStack gap="$5">
            {/* Email + 生日 + 教育階段 */}
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
                    Email
                  </Text>
                  <Input size="$4" value={email} disabled opacity={0.6} />
                </YStack>
                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>
                    生日
                  </Text>
                  <Input size="$4" value={birthday || "尚未設定"} disabled opacity={0.6} />
                </YStack>
                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>
                    教育階段
                  </Text>
                  <Pressable onPress={() => setShowEducationPicker(true)}>
                    <XStack
                      height={44}
                      paddingHorizontal="$3"
                      alignItems="center"
                      justifyContent="space-between"
                      borderWidth={1}
                      borderColor="$borderColor"
                      borderRadius="$md"
                      backgroundColor="$background"
                    >
                      <Text
                        fontSize={14}
                        color={educationStage ? "$color" : "$color"}
                        opacity={educationStage ? 1 : 0.5}
                      >
                        {educationStage
                          ? getLabel(EDUCATION_STAGE_OPTIONS, educationStage)
                          : "請選擇教育階段"}
                      </Text>
                      <ChevronDown size={16} color="$color" opacity={0.5} />
                    </XStack>
                  </Pressable>
                </YStack>
              </YStack>
            </Card>

            {/* 身份 */}
            <Card
              padding="$4"
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <YStack gap="$3">
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize={15} fontWeight="600" color="$color">
                    身份
                  </Text>
                  {position.length > 0 && (
                    <Button size="$2" chromeless onPress={() => setPosition([])}>
                      <Text fontSize={12} color="$color" opacity={0.5}>
                        清空
                      </Text>
                    </Button>
                  )}
                </XStack>
                {position.length > 0 && (
                  <XStack flexWrap="wrap" gap="$2">
                    {position.map((v) => (
                      <YStack
                        key={v}
                        paddingHorizontal="$3"
                        paddingVertical="$1"
                        backgroundColor={colors.primary.palest}
                        borderRadius="$md"
                        borderWidth={1}
                        borderColor={colors.primary.base}
                      >
                        <Text fontSize={12} color={colors.primary.base}>
                          {getLabel(POSITION_OPTIONS, v)}
                        </Text>
                      </YStack>
                    ))}
                  </XStack>
                )}
                <Button
                  size="$4"
                  backgroundColor={colors.primary.base}
                  pressStyle={{ opacity: 0.8 }}
                  onPress={() =>
                    setActiveFieldModal({
                      title: "身份",
                      options: POSITION_OPTIONS,
                      selected: position,
                      maxSelection: 5,
                      onConfirm: setPosition,
                    })
                  }
                >
                  <Text color={colors.basic.white} fontWeight="500">
                    編輯
                  </Text>
                </Button>
              </YStack>
            </Card>

            {/* 專業領域 */}
            <Card
              padding="$4"
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <YStack gap="$3">
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize={15} fontWeight="600" color="$color">
                    專業領域
                  </Text>
                  {professionalFields.length > 0 && (
                    <Button size="$2" chromeless onPress={() => setProfessionalFields([])}>
                      <Text fontSize={12} color="$color" opacity={0.5}>
                        清空
                      </Text>
                    </Button>
                  )}
                </XStack>
                {professionalFields.length > 0 && (
                  <XStack flexWrap="wrap" gap="$2">
                    {professionalFields.map((v) => (
                      <YStack
                        key={v}
                        paddingHorizontal="$3"
                        paddingVertical="$1"
                        backgroundColor={colors.primary.palest}
                        borderRadius="$md"
                        borderWidth={1}
                        borderColor={colors.primary.base}
                      >
                        <Text fontSize={12} color={colors.primary.base}>
                          {getLabel(AVAILABLE_FIELDS, v)}
                        </Text>
                      </YStack>
                    ))}
                  </XStack>
                )}
                <Button
                  size="$4"
                  backgroundColor={colors.primary.base}
                  pressStyle={{ opacity: 0.8 }}
                  onPress={() =>
                    setActiveFieldModal({
                      title: "專業領域",
                      options: AVAILABLE_FIELDS,
                      selected: professionalFields,
                      maxSelection: 5,
                      onConfirm: setProfessionalFields,
                    })
                  }
                >
                  <Text color={colors.basic.white} fontWeight="500">
                    編輯
                  </Text>
                </Button>
              </YStack>
            </Card>

            {/* 想探索的領域 */}
            <Card
              padding="$4"
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <YStack gap="$3">
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize={15} fontWeight="600" color="$color">
                    想探索的領域
                  </Text>
                  {explorationFields.length > 0 && (
                    <Button size="$2" chromeless onPress={() => setExplorationFields([])}>
                      <Text fontSize={12} color="$color" opacity={0.5}>
                        清空
                      </Text>
                    </Button>
                  )}
                </XStack>
                {explorationFields.length > 0 && (
                  <XStack flexWrap="wrap" gap="$2">
                    {explorationFields.map((v) => (
                      <YStack
                        key={v}
                        paddingHorizontal="$3"
                        paddingVertical="$1"
                        backgroundColor={colors.primary.palest}
                        borderRadius="$md"
                        borderWidth={1}
                        borderColor={colors.primary.base}
                      >
                        <Text fontSize={12} color={colors.primary.base}>
                          {getLabel(INTEREST_CATEGORIES, v)}
                        </Text>
                      </YStack>
                    ))}
                  </XStack>
                )}
                <Button
                  size="$4"
                  backgroundColor={colors.primary.base}
                  pressStyle={{ opacity: 0.8 }}
                  onPress={() =>
                    setActiveFieldModal({
                      title: "想探索的領域",
                      options: INTEREST_CATEGORIES,
                      selected: explorationFields,
                      maxSelection: 5,
                      onConfirm: setExplorationFields,
                    })
                  }
                >
                  <Text color={colors.basic.white} fontWeight="500">
                    編輯
                  </Text>
                </Button>
              </YStack>
            </Card>
          </YStack>
        </ScrollView>

        {/* 教育階段 Picker Modal */}
        <Modal visible={showEducationPicker} animationType="slide" transparent>
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
            onPress={() => setShowEducationPicker(false)}
          >
            <YStack flex={1} justifyContent="flex-end">
              <Pressable>
                <Card
                  backgroundColor="$background"
                  borderTopLeftRadius={20}
                  borderTopRightRadius={20}
                  padding="$4"
                >
                  <Text fontSize={16} fontWeight="600" color="$color" marginBottom="$3">
                    教育階段
                  </Text>
                  {EDUCATION_STAGE_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() => {
                        setEducationStage(opt.value);
                        setShowEducationPicker(false);
                      }}
                    >
                      <XStack padding="$3" alignItems="center" justifyContent="space-between">
                        <Text fontSize={15} color="$color">
                          {opt.label}
                        </Text>
                        {educationStage === opt.value && (
                          <Check size={18} color={colors.primary.base} />
                        )}
                      </XStack>
                    </Pressable>
                  ))}
                </Card>
              </Pressable>
            </YStack>
          </Pressable>
        </Modal>

        {/* Field Selection Modal */}
        {activeFieldModal && (
          <FieldSelectionModal
            visible
            title={activeFieldModal.title}
            options={activeFieldModal.options}
            selected={activeFieldModal.selected}
            maxSelection={activeFieldModal.maxSelection}
            onClose={() => setActiveFieldModal(null)}
            onConfirm={activeFieldModal.onConfirm}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}
