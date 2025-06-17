enum EmbedColorType {
  Success = 5763207,
  Failure = 15548997,
  Info = 1752301,
  Default = 9868950,
}

function getColor(type?: EmbedColorType) {
  if (type && EmbedColorType[type]) return type;
  return EmbedColorType.Default;
}

const defaultAvatarUrl =
  "https://raw.githubusercontent.com/daodaoedu/daodao-f2e/main/public/daodao-logo.webp";

const defaultUsername = "島島阿學";

interface CreateDiscordNotificationRequestProps {
  title: string;
  avatarUrl?: string;
  username?: string;
  description?: string;
  authorName?: string;
  authorUrl?: string;
  authorIconUrl?: string;
  type?: EmbedColorType;
}

export default function createDiscordNotificationRequest({
  title,
  avatarUrl = defaultAvatarUrl,
  username = defaultUsername,
  description,
  authorName,
  authorUrl,
  authorIconUrl,
  type,
}: CreateDiscordNotificationRequestProps) {
  const color = getColor(type);

  const author = {
    name: authorName,
    url: authorUrl,
    icon_url: authorIconUrl,
  };

  const embed = {
    author,
    title,
    description,
    color,
  };

  const payload = {
    avatar_url: avatarUrl,
    username,
    embeds: [embed],
  };

  return {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(payload),
  };
}
