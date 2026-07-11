import { getUserPractices } from "@daodao/api";
import BookSvg from "@daodao/assets/images/dashboard/book.svg";
import ExperimentSvg from "@daodao/assets/images/icon/experiment.svg";
import FlagSvg from "@daodao/assets/images/icon/flag.svg";
import NoteSvg from "@daodao/assets/images/icon/note.svg";
import { Check, ChevronRight } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { type ComponentType, useMemo, useState } from "react";
import { Pressable } from "react-native";
import useSWR from "swr";
import { Card, Spinner, Text, XStack, YStack } from "tamagui";
import { PersonaProfileMe } from "@/components/persona/persona-profile-me";
import { RandomPracticesSection } from "@/components/practice/shared/random-practices-section";
import { Badge } from "@/components/ui/badge";
import type { PracticeStatus } from "@/constants/practice-status";
import {
  mapPracticeStatusToTaskStatus,
  TaskStatus,
  type TaskStatus as TaskStatusType,
} from "@/constants/task-status";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMobileTranslation } from "@/i18n";

export type PracticeTabType = "practices" | "persona" | "plans" | "ideas";

type SvgIcon = ComponentType<{ width?: number; height?: number; color?: string }>;

interface IPracticeItem {
  id: string;
  status: TaskStatusType;
  title: string;
  description: string;
  tags: string[];
}

function usePracticeTabs(): {
  id: PracticeTabType;
  label: string;
  Icon: SvgIcon;
  disabled?: boolean;
}[] {
  const t = useMobileTranslation("app_product");
  const personaT = useMobileTranslation("persona");
  return [
    { id: "practices", label: t("practice_section_title"), Icon: ExperimentSvg },
    { id: "persona", label: personaT("tabLabelShort"), Icon: BookSvg },
    { id: "plans", label: t("practice_tab_plans"), Icon: FlagSvg, disabled: true },
    { id: "ideas", label: t("practice_tab_ideas"), Icon: NoteSvg, disabled: true },
  ];
}

/**
 * 主題實踐分頁 rail — 對齊 product 的置頂 sticky bar 內容。
 * 由呼叫端（profile 頁）放進捲動驅動的置頂列裡。
 */
export function PracticeTabBar({
  activeTab,
  onChange,
}: {
  activeTab: PracticeTabType;
  onChange: (tab: PracticeTabType) => void;
}) {
  const tabs = usePracticeTabs();

  return (
    <XStack>
      {tabs.map(({ id, label, Icon, disabled }) => {
        const active = activeTab === id;
        return (
          <Pressable
            key={id}
            disabled={disabled}
            onPress={() => onChange(id)}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={{ flex: 1, alignItems: "center", gap: 2, opacity: disabled ? 0.5 : 1 }}
          >
            <YStack
              width={40}
              height={40}
              borderRadius={20}
              alignItems="center"
              justifyContent="center"
              backgroundColor={active ? `${colors.logo.cyan}1A` : "transparent"}
            >
              <Icon width={24} height={24} color={active ? colors.logo.cyan : colors.text.dark} />
            </YStack>
            <Text
              fontSize={11}
              color={colors.text.dark}
              opacity={active ? 1 : 0.5}
              textAlign="center"
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </XStack>
  );
}

interface PracticeSectionProps {
  /** 目標用戶 ID；用來抓該用戶的實踐並判斷是否為本人 */
  userId: string;
  /** 目前分頁（由 profile 頁的置頂 sticky bar 控制）*/
  activeTab: PracticeTabType;
}

/**
 * 「主題實踐」區塊 — 對齊 product PracticeSection。
 * 分頁 rail 已抽到 {@link PracticeTabBar}（product mobile 是捲動置頂 sticky bar）；
 * 本元件只負責標題 +「包含已完成」切換 + 內容（實踐列表 / 學習人物誌）。
 */
export function PracticeSection({ userId, activeTab }: PracticeSectionProps) {
  const router = useRouter();
  const t = useMobileTranslation("app_product");
  const personaT = useMobileTranslation("persona");
  const { user } = useCurrentUser();

  const [includeCompleted, setIncludeCompleted] = useState(true);

  const isOwnData = Boolean(user?.id && user.id === userId);

  const { data, isLoading, error } = useSWR(
    userId ? ["/api/v1/practices/user/{userId}", userId, "all"] : null,
    ([, uid]) => getUserPractices(uid, { status: "all" }),
    { revalidateOnFocus: false }
  );

  const practices: IPracticeItem[] = useMemo(() => {
    const list = data?.data?.data ?? [];
    return list.map((practice) => ({
      id: practice.id,
      status: mapPracticeStatusToTaskStatus(practice.status as PracticeStatus),
      title: practice.title,
      description: practice.practiceAction || "",
      tags: practice.tags ?? [],
    }));
  }, [data]);

  const filteredPractices = includeCompleted
    ? practices
    : practices.filter((p) => p.status !== TaskStatus.completed);

  return (
    <Card
      backgroundColor={colors.background.light}
      borderRadius={16}
      padding={20}
      borderWidth={1}
      borderColor={colors.border.light}
    >
      {/* 標題 + 包含已完成切換 */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom={16}>
        <Text fontSize={18} fontWeight="500" color={colors.text.dark}>
          {activeTab === "persona" ? personaT("tabLabel") : t("practice_section_title")}
        </Text>
        {activeTab !== "persona" && practices.length > 0 ? (
          <Pressable
            onPress={() => setIncludeCompleted((v) => !v)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: includeCompleted }}
            accessibilityLabel={t("practice_include_completed")}
          >
            <XStack alignItems="center" gap={6}>
              <XStack
                width={18}
                height={18}
                borderRadius={4}
                borderWidth={1.5}
                borderColor={includeCompleted ? colors.primary.base : colors.text.muted}
                backgroundColor={includeCompleted ? colors.primary.base : "transparent"}
                alignItems="center"
                justifyContent="center"
              >
                {includeCompleted ? <Check size={12} color={colors.basic.white} /> : null}
              </XStack>
              <Text fontSize={13} color={colors.text.dark}>
                {t("practice_include_completed")}
              </Text>
            </XStack>
          </Pressable>
        ) : null}
      </XStack>

      {/* 內容 */}
      {activeTab === "persona" ? (
        <PersonaProfileMe />
      ) : isLoading ? (
        <YStack alignItems="center" justifyContent="center" paddingVertical="$8">
          <Spinner color={colors.primary.base} />
        </YStack>
      ) : error ? (
        <YStack alignItems="center" justifyContent="center" paddingVertical="$8">
          <Text fontSize={14} color={colors.text.muted}>
            {t("load_failed_retry")}
          </Text>
        </YStack>
      ) : filteredPractices.length === 0 ? (
        isOwnData ? (
          <RandomPracticesSection compact />
        ) : (
          <YStack alignItems="center" justifyContent="center" paddingVertical="$8">
            <Text fontSize={14} color={colors.text.muted}>
              {t("practice_empty_practices")}
            </Text>
          </YStack>
        )
      ) : (
        <YStack gap="$2.5">
          {filteredPractices.map((practice) => (
            <Card
              key={practice.id}
              padding="$3"
              backgroundColor={colors.background.light}
              borderRadius={12}
              borderWidth={1}
              borderColor={colors.border.light}
              pressStyle={{ opacity: 0.85 }}
              onPress={() => router.push(`/practices/${practice.id}`)}
              accessibilityRole="button"
              accessibilityLabel={practice.title}
            >
              <XStack alignItems="center" justifyContent="space-between" gap="$2" marginBottom="$2">
                <StatusBadge status={practice.status} />
                <XStack gap="$2" flexWrap="wrap" alignItems="center">
                  {practice.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} backgroundColor={colors.background.veryLightGray}>
                      <Text fontSize={11} color={colors.text.muted}>
                        {tag}
                      </Text>
                    </Badge>
                  ))}
                  {practice.tags.length > 2 ? (
                    <Text fontSize={11} color={colors.text.muted}>
                      +{practice.tags.length - 2}
                    </Text>
                  ) : null}
                </XStack>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <YStack flex={1}>
                  <Text
                    fontSize={15}
                    fontWeight="500"
                    color={colors.text.dark}
                    numberOfLines={1}
                    marginBottom="$1"
                  >
                    {practice.title}
                  </Text>
                  <Text fontSize={12} color={colors.text.dark} opacity={0.7} numberOfLines={1}>
                    {practice.description}
                  </Text>
                </YStack>
                <ChevronRight size={18} color={colors.text.muted} />
              </XStack>
            </Card>
          ))}
        </YStack>
      )}
    </Card>
  );
}

function StatusBadge({ status }: { status: TaskStatusType }) {
  const t = useMobileTranslation("dashboard");
  const labelMap: Record<TaskStatusType, string> = {
    [TaskStatus.draft]: t("filter_draft"),
    [TaskStatus.notStarted]: t("filter_not_started"),
    [TaskStatus.inProgress]: t("filter_in_progress"),
    [TaskStatus.completed]: t("filter_completed"),
  };
  const label = labelMap[status];

  if (status === TaskStatus.completed) {
    return (
      <Badge backgroundColor={colors.primary.base}>
        <Text fontSize={11} fontWeight="500" color={colors.basic.white}>
          {label}
        </Text>
      </Badge>
    );
  }

  if (status === TaskStatus.inProgress) {
    return (
      <Badge backgroundColor="transparent" borderWidth={1} borderColor={colors.logo.cyan}>
        <Text fontSize={11} fontWeight="500" color={colors.logo.cyan}>
          {label}
        </Text>
      </Badge>
    );
  }

  return (
    <Badge backgroundColor={colors.background.veryLightGray}>
      <Text fontSize={11} color={colors.text.muted}>
        {label}
      </Text>
    </Badge>
  );
}
