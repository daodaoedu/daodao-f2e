import { CheckCircle2, Mail, XCircle } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Spinner, Text, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

type AuthStatusVariant = "loading" | "success" | "error" | "mail";

function StatusIcon({ variant }: { variant: AuthStatusVariant }) {
  if (variant === "loading") {
    return <Spinner size="large" color={colors.primary.base} />;
  }

  const icon =
    variant === "success" ? (
      <CheckCircle2 size={36} color={colors.semantic.success} />
    ) : variant === "mail" ? (
      <Mail size={36} color={colors.logo.orange} />
    ) : (
      <XCircle size={36} color={colors.semantic.error} />
    );

  return (
    <YStack
      width={76}
      height={76}
      borderRadius={38}
      alignItems="center"
      justifyContent="center"
      backgroundColor={variant === "error" ? "#FEE2E2" : colors.primary.palest}
    >
      {icon}
    </YStack>
  );
}

export function AuthStatusScreen({
  variant,
  title,
  description,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  children,
}: {
  variant: AuthStatusVariant;
  title: string;
  description: string;
  primaryLabel?: string;
  onPrimaryPress?: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  children?: ReactNode;
}) {
  const router = useRouter();
  const tCommon = useMobileTranslation("common");

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background" padding="$5" justifyContent="center">
        <Card
          padding="$5"
          borderRadius="$lg"
          backgroundColor={colors.background.light}
          borderWidth={1}
          borderColor={colors.border.light}
          alignItems="center"
          gap="$4"
        >
          <StatusIcon variant={variant} />
          <YStack gap="$2" alignItems="center">
            <Text fontSize={24} fontWeight="700" color="$color" textAlign="center">
              {title}
            </Text>
            <Text fontSize={14} color="$color" opacity={0.65} textAlign="center">
              {description}
            </Text>
          </YStack>
          {children}
          <YStack width="100%" gap="$3">
            {primaryLabel && onPrimaryPress ? (
              <Button size="$5" backgroundColor={colors.primary.base} onPress={onPrimaryPress}>
                <Text color={colors.basic.white} fontWeight="600">
                  {primaryLabel}
                </Text>
              </Button>
            ) : null}
            <Button
              size="$5"
              chromeless
              onPress={onSecondaryPress ?? (() => router.replace("/" as never))}
            >
              <XStack alignItems="center" gap="$2">
                <Text color="$color">{secondaryLabel ?? tCommon("back")}</Text>
              </XStack>
            </Button>
          </YStack>
        </Card>
      </YStack>
    </SafeAreaView>
  );
}
