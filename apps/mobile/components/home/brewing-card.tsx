import { Text, XStack } from "tamagui";
import type { IShowcasePractice } from "@/hooks/useShowcaseFeed";
import { useMobileTranslation } from "@/i18n";
import { ShowcaseCard } from "./showcase-card";

interface BrewingCardProps {
  practice: IShowcasePractice;
}

export function BrewingCard({ practice }: BrewingCardProps) {
  const t = useMobileTranslation("mobile.home");

  return (
    <ShowcaseCard
      practice={practice}
      extraContent={
        <XStack
          alignItems="center"
          gap="$2"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius={12}
          backgroundColor="#F8F9FA"
          borderWidth={1}
          borderStyle="dashed"
          borderColor="#C1D0D8"
          marginBottom="$3"
        >
          <Text fontSize={16}>🍵</Text>
          <Text fontSize={12} color="rgba(0,0,0,0.6)">
            {t("brewing_locked")}
          </Text>
        </XStack>
      }
    />
  );
}
