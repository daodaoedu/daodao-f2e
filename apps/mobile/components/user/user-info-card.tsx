import { MapPin } from "@tamagui/lucide-icons";
import { Linking, Pressable } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { Avatar, Card, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import type { IContactList } from "@/types/user";

// ── Social Icons ──

function LineIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#06C755" />
      <Path
        d="M26 14.5C26 10.08 21.52 6.5 16 6.5C10.48 6.5 6 10.08 6 14.5C6 18.48 9.66 21.78 14.52 22.4C14.88 22.48 15.38 22.64 15.5 22.94C15.6 23.22 15.56 23.64 15.54 23.92L15.4 24.76C15.36 25.04 15.16 25.94 16 25.6C16.84 25.26 21.68 22.28 23.9 19.72C25.34 18.14 26 16.4 26 14.5Z"
        fill="white"
      />
    </Svg>
  );
}

function FacebookIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#1877F2" />
      <Path
        d="M22 16C22 12.68 19.32 10 16 10C12.68 10 10 12.68 10 16C10 18.98 12.14 21.46 15 21.92V17.5H13.5V16H15V14.88C15 13.42 15.88 12.62 17.2 12.62C17.82 12.62 18.48 12.72 18.48 12.72V14.16H17.76C17.06 14.16 16.84 14.58 16.84 15.02V16H18.42L18.16 17.5H16.84V21.92C19.7 21.46 22 18.98 22 16Z"
        fill="white"
      />
    </Svg>
  );
}

function InstagramIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#E4405F" />
      <Path
        d="M16 11.5C13.52 11.5 11.5 13.52 11.5 16C11.5 18.48 13.52 20.5 16 20.5C18.48 20.5 20.5 18.48 20.5 16C20.5 13.52 18.48 11.5 16 11.5ZM16 19C14.34 19 13 17.66 13 16C13 14.34 14.34 13 16 13C17.66 13 19 14.34 19 16C19 17.66 17.66 19 16 19Z"
        fill="white"
      />
      <Circle cx="20.75" cy="11.25" r="1" fill="white" />
      <Path
        d="M20 9H12C10.34 9 9 10.34 9 12V20C9 21.66 10.34 23 12 23H20C21.66 23 23 21.66 23 20V12C23 10.34 21.66 9 20 9ZM21.5 20C21.5 20.83 20.83 21.5 20 21.5H12C11.17 21.5 10.5 20.83 10.5 20V12C10.5 11.17 11.17 10.5 12 10.5H20C20.83 10.5 21.5 11.17 21.5 12V20Z"
        fill="white"
      />
    </Svg>
  );
}

function ThreadsIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#000000" />
      <Path
        d="M20.2 14.1C20.1 13.3 19.7 12.6 19.1 12.1C18.4 11.5 17.5 11.2 16.6 11.3C15.5 11.4 14.5 12 13.9 12.9C13.3 13.8 13.1 14.9 13.4 15.9C13.7 16.9 14.4 17.7 15.3 18.2C16.2 18.6 17.2 18.6 18.1 18.2C19 17.8 19.7 17 20 16.1C20.3 15.4 20.3 14.7 20.2 14.1ZM16 20.5C14.3 20.5 12.7 19.8 11.5 18.6C10.3 17.4 9.6 15.8 9.6 14.1C9.6 12.4 10.3 10.8 11.5 9.6C12.7 8.4 14.3 7.7 16 7.7C17.7 7.7 19.3 8.4 20.5 9.6C21.7 10.8 22.4 12.4 22.4 14.1C22.4 15.8 21.7 17.4 20.5 18.6C19.3 19.8 17.7 20.5 16 20.5ZM16 6.5C13.9 6.5 11.9 7.3 10.4 8.8C8.9 10.3 8.1 12.3 8.1 14.4C8.1 16.5 8.9 18.5 10.4 20C11.9 21.5 13.9 22.3 16 22.3C18.1 22.3 20.1 21.5 21.6 20C23.1 18.5 23.9 16.5 23.9 14.4C23.9 12.3 23.1 10.3 21.6 8.8C20.1 7.3 18.1 6.5 16 6.5Z"
        fill="white"
      />
    </Svg>
  );
}

function LinkedInIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#0A66C2" />
      <Path
        d="M11.5 9.5C11.5 10.6 10.6 11.5 9.5 11.5C8.4 11.5 7.5 10.6 7.5 9.5C7.5 8.4 8.4 7.5 9.5 7.5C10.6 7.5 11.5 8.4 11.5 9.5ZM11.5 13H7.5V24.5H11.5V13ZM17.5 13H13.5V24.5H17.5V18.4C17.5 15 21.9 14.7 21.9 18.4V24.5H26V17.1C26 11.2 19.1 11.4 17.5 14.3V13Z"
        fill="white"
      />
    </Svg>
  );
}

function GithubIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#24292F" />
      <Path
        d="M16 7C11.03 7 7 11.03 7 16C7 19.98 9.58 23.35 13.16 24.54C13.58 24.62 13.72 24.36 13.72 24.14V22.36C11.06 22.88 10.56 21.06 10.56 21.06C10.18 20.02 9.62 19.76 9.62 19.76C8.84 19.24 9.68 19.24 9.68 19.24C10.54 19.3 10.98 20.12 10.98 20.12C11.74 21.42 12.98 21.04 13.74 20.82C13.82 20.26 14.06 19.88 14.32 19.66C12.22 19.44 10 18.62 10 15.18C10 14.2 10.34 13.4 10.98 12.78C10.88 12.56 10.58 11.64 11.08 10.42C11.08 10.42 11.8 10.18 13.72 11.32C14.44 11.12 15.22 11.02 16 11.02C16.78 11.02 17.56 11.12 18.28 11.32C20.2 10.18 20.92 10.42 20.92 10.42C21.42 11.64 21.12 12.56 21.02 12.78C21.66 13.4 22 14.2 22 15.18C22 18.64 19.78 19.44 17.66 19.66C17.98 19.94 18.28 20.48 18.28 21.32V24.14C18.28 24.36 18.42 24.64 18.86 24.54C22.42 23.35 25 19.98 25 16C25 11.03 20.97 7 16 7Z"
        fill="white"
      />
    </Svg>
  );
}

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

function getSocialIcon(platform: SocialPlatformType) {
  switch (platform) {
    case "line":
      return <LineIcon />;
    case "facebook":
      return <FacebookIcon />;
    case "instagram":
      return <InstagramIcon />;
    case "threads":
      return <ThreadsIcon />;
    case "linkedin":
      return <LinkedInIcon />;
    case "github":
      return <GithubIcon />;
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
  const displayName = name || "未命名用戶";

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
