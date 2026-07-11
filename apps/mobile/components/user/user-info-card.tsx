import FacebookSvg from "@daodao/assets/images/social-icons/facebook-filled.svg";
import GithubSvg from "@daodao/assets/images/social-icons/github.svg";
import InstagramSvg from "@daodao/assets/images/social-icons/instagram-filled.svg";
import LinkedInSvg from "@daodao/assets/images/social-icons/linkedin-filled.svg";
import ThreadsSvg from "@daodao/assets/images/social-icons/threads-filled.svg";
import { MapPin } from "@tamagui/lucide-icons";
import { Linking, Pressable } from "react-native";
import { Avatar, Card, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import type { IContactList } from "@/types/user";

// ── Social link helpers ──

type SocialPlatformType =
  | "line"
  | "facebook"
  | "instagram"
  | "threads"
  | "linkedin"
  | "github"
  | "website"
  | "discord";

const SOCIAL_DISPLAY_ORDER: SocialPlatformType[] = [
  "website",
  "github",
  "threads",
  "facebook",
  "instagram",
  "linkedin",
  "line",
  "discord",
];

const PLATFORMS_WITH_ICON: SocialPlatformType[] = [
  "github",
  "facebook",
  "instagram",
  "threads",
  "linkedin",
];

// 圖示尺寸對齊 web（size-8 = 32px）。顏色由各 SVG 內建（品牌色徽章），與 web 一致，
// 故不需傳 color prop。
const SOCIAL_ICON_SIZE = 32;

function getSocialIcon(platform: SocialPlatformType) {
  switch (platform) {
    case "facebook":
      return <FacebookSvg width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} />;
    case "instagram":
      return <InstagramSvg width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} />;
    case "threads":
      return <ThreadsSvg width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} />;
    case "linkedin":
      return <LinkedInSvg width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} />;
    case "github":
      return <GithubSvg width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} />;
    default:
      return null;
  }
}

// ── Component ──

interface UserInfoCardProps {
  name: string | null;
  location?: string | null;
  selfIntroduction?: string | null;
  photoURL?: string | null;
  personalSlogan?: string | null;
  contactList?: IContactList | null;
}

export function UserInfoCard({
  name,
  location,
  selfIntroduction,
  photoURL,
  personalSlogan,
  contactList,
}: UserInfoCardProps) {
  const t = useMobileTranslation("mobile.profile");
  const displayName = name || t("unnamed_user");

  // 將 contactList 轉成有值的 social links 陣列
  const socialLinks = contactList
    ? SOCIAL_DISPLAY_ORDER.filter((p) => {
        const val = contactList[p as keyof IContactList];
        return val != null && val !== "";
      }).map((p) => ({
        platform: p,
        value: contactList[p as keyof IContactList] as string,
        hasIcon: PLATFORMS_WITH_ICON.includes(p),
      }))
    : [];

  const linksWithIcon = socialLinks.filter((l) => l.hasIcon);
  const linksWithoutIcon = socialLinks.filter((l) => !l.hasIcon);

  return (
    <Card
      backgroundColor={colors.background.light}
      borderRadius={16}
      padding={24}
      marginBottom={24}
      borderWidth={1}
      borderColor={colors.border.light}
      elevate
      elevation={2}
    >
      {/* 頭像和基本資訊 */}
      <XStack gap={16} alignItems="center">
        <Avatar circular size={96}>
          {photoURL ? (
            <Avatar.Image source={{ uri: photoURL }} />
          ) : (
            <Avatar.Fallback
              backgroundColor={colors.background.veryLightGray}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={24} fontWeight="500" color={colors.text.dark}>
                {displayName.charAt(0)}
              </Text>
            </Avatar.Fallback>
          )}
        </Avatar>

        <YStack flex={1} gap={4}>
          <Text fontSize={22} fontWeight="500" color={colors.basic.black} numberOfLines={1}>
            {displayName}
          </Text>
          {personalSlogan ? (
            <Text fontSize={14} color={colors.text.dark} numberOfLines={2}>
              {personalSlogan}
            </Text>
          ) : null}
          {location ? (
            <XStack alignItems="center" gap={8}>
              <MapPin size={18} color={colors.logo.cyan} />
              <Text fontSize={12} color={colors.logo.cyan}>
                {location}
              </Text>
            </XStack>
          ) : null}
        </YStack>
      </XStack>

      {/* 個人簡介 */}
      {selfIntroduction ? (
        <Text fontSize={12} color={colors.text.dark} marginTop={16}>
          {selfIntroduction}
        </Text>
      ) : null}

      {/* 社群媒體連結 — 有圖示的 */}
      {linksWithIcon.length > 0 && (
        <XStack gap={12} marginTop={16}>
          {linksWithIcon.map((link) => (
            <Pressable key={link.platform} onPress={() => Linking.openURL(link.value)} hitSlop={8}>
              {getSocialIcon(link.platform)}
            </Pressable>
          ))}
        </XStack>
      )}

      {/* 沒有圖示的連結（LINE, Discord 等） */}
      {linksWithoutIcon.length > 0 && (
        <YStack gap={8} marginTop={linksWithIcon.length > 0 ? 12 : 16}>
          {linksWithoutIcon.map((link) => (
            <XStack key={link.platform} alignItems="center" gap={8}>
              <Text fontSize={12} color={colors.text.dark} fontWeight="500">
                {link.platform === "line"
                  ? "LINE"
                  : link.platform === "discord"
                    ? "Discord"
                    : link.platform}
              </Text>
              <Text fontSize={12} color={colors.text.muted}>
                {link.value}
              </Text>
            </XStack>
          ))}
        </YStack>
      )}
    </Card>
  );
}
