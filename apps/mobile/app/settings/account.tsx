import { useUserMutations } from "@daodao/api";
import { Check, ChevronDown, ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Input, ScrollView, Text, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import {
  AVAILABLE_FIELDS,
  EDUCATION_STAGE_OPTIONS,
  INTEREST_CATEGORIES,
  POSITION_OPTIONS,
} from "@/constants/settings";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { applyOnboardingUpdateFromResponse } from "@/hooks/useOnboardingProgress";
import { useMobileTranslation } from "@/i18n";

type FieldOptionType = { value: string; label: string };

function assertSuccessfulResponse(response: { error?: unknown }, fallbackMessage: string) {
  if (!response.error) return;

  const error = response.error as { error?: { message?: string }; message?: string };
  throw new Error(error.error?.message ?? error.message ?? fallbackMessage);
}

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
  const t = useMobileTranslation("mobile.accountSettings");
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
                {t("cancel")}
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
                {t("confirm")}
              </Text>
            </Button>
          </XStack>
          <Text fontSize={12} color="$color" opacity={0.5} paddingHorizontal="$4" marginBottom="$2">
            {t("selection_count", { max: maxSelection, count: localSelected.length })}
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
  const t = useMobileTranslation("mobile.accountSettings");
  const tCommon = useMobileTranslation("common");
  const { user, isLoading, mutate } = useCurrentUser();
  const { updateCurrentUser } = useUserMutations();
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

      const response = await updateCurrentUser(updateData);
      assertSuccessfulResponse(response, t("saveError"));
      // 新手任務 B：即時標記「公開資訊/帳號/領域偏好」完成
      applyOnboardingUpdateFromResponse(response.data);
      await mutate();
      Alert.alert(t("successTitle"), t("saveSuccess"), [
        { text: t("confirm"), onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(t("errorTitle"), error instanceof Error ? error.message : t("saveError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
          <Text fontSize={14} color="$color" opacity={0.5}>
            {t("loading")}
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
            disabled={isSubmitting}
          >
            <Text color={colors.basic.white} fontWeight="600" fontSize={14}>
              {isSubmitting ? t("saving") : t("save")}
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
                    {t("birthday")}
                  </Text>
                  <Input size="$4" value={birthday || t("not_set")} disabled opacity={0.6} />
                </YStack>
                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="500" color="$color" opacity={0.6}>
                    {t("educationStage")}
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
                          : t("educationStagePlaceholder")}
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
                    {t("position")}
                  </Text>
                  {position.length > 0 && (
                    <Button size="$2" chromeless onPress={() => setPosition([])}>
                      <Text fontSize={12} color="$color" opacity={0.5}>
                        {t("clear")}
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
                      title: t("position"),
                      options: POSITION_OPTIONS,
                      selected: position,
                      maxSelection: 5,
                      onConfirm: setPosition,
                    })
                  }
                >
                  <Text color={colors.basic.white} fontWeight="500">
                    {t("edit")}
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
                    {t("professionalFields")}
                  </Text>
                  {professionalFields.length > 0 && (
                    <Button size="$2" chromeless onPress={() => setProfessionalFields([])}>
                      <Text fontSize={12} color="$color" opacity={0.5}>
                        {t("clear")}
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
                      title: t("professionalFields"),
                      options: AVAILABLE_FIELDS,
                      selected: professionalFields,
                      maxSelection: 5,
                      onConfirm: setProfessionalFields,
                    })
                  }
                >
                  <Text color={colors.basic.white} fontWeight="500">
                    {t("edit")}
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
                    {t("explorationFields")}
                  </Text>
                  {explorationFields.length > 0 && (
                    <Button size="$2" chromeless onPress={() => setExplorationFields([])}>
                      <Text fontSize={12} color="$color" opacity={0.5}>
                        {t("clear")}
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
                      title: t("explorationFields"),
                      options: INTEREST_CATEGORIES,
                      selected: explorationFields,
                      maxSelection: 5,
                      onConfirm: setExplorationFields,
                    })
                  }
                >
                  <Text color={colors.basic.white} fontWeight="500">
                    {t("edit")}
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
                    {t("educationStage")}
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
