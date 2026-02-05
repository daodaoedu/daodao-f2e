import { getUserByIdentifier } from "@daodao/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PracticeSection } from "@/components/practice";
import { IslandHeader, UserInfoCard } from "@/components/user";

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

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/users/[identifier]">): Promise<Metadata> {
  const { identifier } = await params;

  // 獲取用戶資料以生成 metadata（使用緩存版本）
  const userResponse = await getCachedUserByIdentifier(identifier);

  // 如果請求失敗或沒有資料，返回預設 metadata
  if (!userResponse.data || !userResponse.response.ok) {
    return {
      title: "用戶個人頁面",
      description: "查看用戶的個人資訊和實踐記錄",
    };
  }

  const userData = userResponse.data?.data ?? userResponse.data;
  const userName = userData?.name || "未命名用戶";
  const userDescription = userData?.selfIntroduction || "查看用戶的個人資訊和實踐記錄";
  const userPhotoURL = userData?.photoURL;

  return {
    title: `${userName} 的個人頁面`,
    description: userDescription,
    openGraph: {
      title: `${userName} 的個人頁面`,
      description: userDescription,
      ...(userPhotoURL && {
        images: [
          {
            url: userPhotoURL,
            width: 1200,
            height: 630,
            alt: `${userName} 的頭像`,
          },
        ],
      }),
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${userName} 的個人頁面`,
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
  const { identifier } = await params;

  // 使用緩存版本避免重複請求（與 generateMetadata 共享）
  const userResponse = await getCachedUserByIdentifier(identifier);

  // 如果請求失敗或沒有資料，顯示 404
  if (!userResponse.data || !userResponse.response.ok) {
    notFound();
  }

  const userData = userResponse.data?.data;
  // 轉換為大寫以符合統一格式 (L/C/A/D/O)，同時相容舊的小寫資料
  const resultType = (userData.latestQuizResult?.resultType ?? "").toUpperCase();
  const userId = userData.id;

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-[#B8E8FD]">
      <IslandHeader resultType={resultType} userId={userId} />

      <main className="max-w-[640px] mx-auto px-5 pb-[64px]">
        {/* 用戶個人資訊卡片 */}
        <UserInfoCard
          name={userData.name || "未命名用戶"}
          location={userData.location || undefined}
          selfIntroduction={userData.selfIntroduction || undefined}
          photoURL={userData.photoURL || undefined}
          socialLinks={userData.contactList || undefined}
        />

        {/* 「主題實踐」區塊 */}
        <PracticeSection userId={userId} />
      </main>
    </div>
  );
}
