import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Input, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

export type AdminRecord = Record<string, unknown>;

export function asRecord(value: unknown): AdminRecord {
  return value && typeof value === "object" ? (value as AdminRecord) : {};
}

export function asArray(value: unknown): AdminRecord[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

export function stringValue(value: unknown, fallback = "-") {
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

export function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function formatNumber(value: unknown) {
  return numberValue(value).toLocaleString();
}

export function formatDate(value: unknown, fallback = "-") {
  if (typeof value !== "string" || value.length === 0) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString();
}

export function buildQuery(path: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export function AdminScreen({
  title,
  children,
  refreshing,
  onRefresh,
}: {
  title: string;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const tCommon = useMobileTranslation("common");

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
          <Text flex={1} fontSize={18} fontWeight="700" color="$color" numberOfLines={1}>
            {title}
          </Text>
        </XStack>
        <ScrollView
          flex={1}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          <YStack gap="$4">{children}</YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <YStack alignItems="center" paddingVertical="$8" gap="$3">
      <Spinner size="large" color={colors.primary.base} />
      <Text fontSize={14} color="$color" opacity={0.6}>
        {label}
      </Text>
    </YStack>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <YStack alignItems="center" paddingVertical="$8">
      <Text fontSize={14} color="$color" opacity={0.55} textAlign="center">
        {label}
      </Text>
    </YStack>
  );
}

export function StatGrid({
  items,
}: {
  items: Array<{ label: string; value: string | number; hint?: string }>;
}) {
  return (
    <XStack flexWrap="wrap" gap="$3">
      {items.map((item) => (
        <Card
          key={item.label}
          width="47%"
          padding="$4"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
          backgroundColor="$background"
        >
          <Text fontSize={12} color="$color" opacity={0.55} numberOfLines={1}>
            {item.label}
          </Text>
          <Text marginTop="$2" fontSize={22} fontWeight="700" color="$color" numberOfLines={1}>
            {item.value}
          </Text>
          {item.hint ? (
            <Text marginTop="$1" fontSize={11} color="$color" opacity={0.5} numberOfLines={1}>
              {item.hint}
            </Text>
          ) : null}
        </Card>
      ))}
    </XStack>
  );
}

export function SectionCard({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <Card
      padding="$4"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$background"
    >
      <YStack gap="$3">
        {title ? (
          <Text fontSize={16} fontWeight="700" color="$color">
            {title}
          </Text>
        ) : null}
        {children}
      </YStack>
    </Card>
  );
}

export function SearchRow({
  value,
  placeholder,
  searchLabel,
  onChange,
  onSubmit,
}: {
  value: string;
  placeholder: string;
  searchLabel: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <XStack gap="$2">
      <Input
        flex={1}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
      />
      <Button backgroundColor={colors.primary.base} onPress={onSubmit}>
        <Text color={colors.basic.white}>{searchLabel}</Text>
      </Button>
    </XStack>
  );
}

export function PaginationRow({
  page,
  totalPages,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <XStack justifyContent="center" alignItems="center" gap="$3">
      <Button size="$3" disabled={page <= 1} onPress={onPrevious}>
        {previousLabel}
      </Button>
      <Text color="$color" opacity={0.65}>
        {page} / {totalPages}
      </Text>
      <Button size="$3" disabled={page >= totalPages} onPress={onNext}>
        {nextLabel}
      </Button>
    </XStack>
  );
}

export function FieldRow({ label, value }: { label: string; value: string | number }) {
  return (
    <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
      <Text flex={1} fontSize={13} color="$color" opacity={0.55}>
        {label}
      </Text>
      <Text flex={1.4} fontSize={13} color="$color" textAlign="right">
        {value}
      </Text>
    </XStack>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "good" | "bad" | "warn" | "neutral";
}) {
  const color =
    tone === "good"
      ? colors.primary.base
      : tone === "bad"
        ? colors.semantic.error
        : tone === "warn"
          ? colors.semantic.warning
          : colors.basic[500];

  return (
    <XStack
      alignSelf="flex-start"
      paddingHorizontal="$3"
      paddingVertical="$1"
      borderRadius="$full"
      backgroundColor="$backgroundHover"
    >
      <Text fontSize={12} fontWeight="600" color={color}>
        {label}
      </Text>
    </XStack>
  );
}
