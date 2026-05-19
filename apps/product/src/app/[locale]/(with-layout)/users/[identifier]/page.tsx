import { getUserByIdentifier, getUserProfileByIdentifier } from "@daodao/api";
import { getTranslations } from "@daodao/i18n/server";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { IslandHeader, UserInfoCard, UserProfileTabs } from "@/components/user";

/**
 * 個人頁面
 * 支援 userId 和 customId 兩種識別符
 *
 * 路由範例：
 * - /users/123 (userId)
 * - /users/john-doe (customId)
 */

// 使用 React.cache() 避免在 generateMetadata 和 page 中重複請求
const getCachedUserByIdentifier = cache(getUserByIdentifier);

// SSR 需手動轉發 auth_token cookie，否則 fetch 不會帶入認證資訊
const fetchCurrentUserSSR = cache(async (authToken: string) => {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/api/v1/users/me`, {
      headers: { Cookie: `auth_token=${authToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = await response.json();
    return { data: body };
  } catch {
    return null;
  }
});

// 取得個人檔案頁資料（新版 profile endpoint）
const getCachedUserProfile = cache(async (identifier: string) => {
  try {
    return await getUserProfileByIdentifier(identifier);
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/users/[identifier]">): Promise<Metadata> {
  const { identifier, locale } = await params;
  const t = await getTranslations({ locale, namespace: "user_profile" });

  // 獲取用戶資料以生成 metadata（使用緩存版本）
  const userResponse = await getCachedUserByIdentifier(identifier);

  // 如果請求失敗或沒有資料，返回預設 metadata
  if (!userResponse.data || !userResponse.response.ok) {
    return {
      title: t("meta_page_title_default"),
      description: t("meta_page_description"),
    };
  }

  const userData = userResponse.data?.data ?? userResponse.data;
  const userName = userData?.name || t("unnamed_user");
  const userDescription = userData?.selfIntroduction || t("meta_page_description");
  const userPhotoURL = userData?.photoURL;

  return {
    title: t("meta_page_title", { name: userName }),
    description: userDescription,
    openGraph: {
      title: t("meta_page_title", { name: userName }),
      description: userDescription,
      ...(userPhotoURL && {
        images: [
          {
            url: userPhotoURL,
            width: 1200,
            height: 630,
            alt: t("meta_avatar_alt", { name: userName }),
          },
        ],
      }),
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: t("meta_page_title", { name: userName }),
      description: userDescription,
      ...(userPhotoURL && {
        images: [userPhotoURL],
      }),
    },
  };
}

export default async function UserProfilePage({
  params,
}: PageProps<"/[locale]/users/[identifier]">) {
  const { identifier, locale } = await params;
  const t = await getTranslations({ locale, namespace: "user_profile" });

  // 取得 auth_token cookie（需在 Server Component 內呼叫，不可放在 module-level cache 內）
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value ?? "";

  // 並行取得：個人檔案資料、舊版用戶資料（用於 metadata / fallback）、當前登入用戶
  const [userResponse, profileResponse, currentUserResponse] = await Promise.all([
    getCachedUserByIdentifier(identifier),
    getCachedUserProfile(identifier),
    authToken ? fetchCurrentUserSSR(authToken) : Promise.resolve(null),
  ]);

  // 如果請求失敗或沒有資料，顯示 404
  if (!userResponse.data || !userResponse.response.ok) {
    notFound();
  }

  const userData = userResponse.data?.data;
  const profileData = profileResponse?.data;

  // 轉換為大寫以符合統一格式 (L/C/A/D/O)，同時相容舊的小寫資料
  const resultType = (userData.latestQuizResult?.resultType ?? "").toUpperCase();
  const userId = userData.id;

  // 當前登入使用者資訊
  // getCurrentUser 回傳 { data: FormattedUserResponse }，其中 data.data 是 FormattedUserResponse
  const currentUserId = currentUserResponse?.data?.data?.id ?? null;
  const isAuthenticated = currentUserId !== null;
  const isOwnProfile = isAuthenticated && currentUserId === userId;

  // 社群連結（從 profile API 優先，fallback 到舊版）
  const contactList = profileData?.contactList ?? userData.contactList;

  // 連接數 / 追蹤者數 / 隱藏設定（僅在 profile API 有資料時顯示）
  const connectionsCount = profileData?.connectionsCount;
  const followersCount = profileData?.followersCount;
  const hideConnectionsCount = profileData?.hideConnectionsCount ?? false;
  const recentPracticeCount = profileData?.recentPracticeCount;
  const commonCirclesCount = profileData?.commonCirclesCount ?? null;

  // 個人標語
  const personalSlogan = profileData?.personalSlogan ?? userData.personalSlogan ?? undefined;

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-[#B8E8FD]">
      <IslandHeader resultType={resultType} userId={userId} />

      <main className="max-w-[640px] mx-auto px-5 pb-[64px]">
        {/* 用戶個人資訊卡片 */}
        <UserInfoCard
          name={userData.name || t("unnamed_user")}
          customId={userData.customId || undefined}
          location={
            (locale === "en" ? userData.locationNameEn : userData.locationNameZh) || undefined
          }
          selfIntroduction={userData.selfIntroduction || undefined}
          photoURL={userData.photoURL || undefined}
          socialLinks={contactList || undefined}
          personalSlogan={personalSlogan}
          connectionsCount={connectionsCount}
          followersCount={followersCount}
          hideConnectionsCount={hideConnectionsCount}
          recentPracticeCount={recentPracticeCount}
          commonCirclesCount={commonCirclesCount}
          isOwnProfile={isOwnProfile}
          isAuthenticated={isAuthenticated}
          targetUserId={userId}
        />

        <UserProfileTabs
          targetUserId={userId}
          isOwnProfile={isOwnProfile}
        />
      </main>
    </div>
  );
}
