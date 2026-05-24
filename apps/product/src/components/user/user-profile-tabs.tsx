"use client";

import { useCurrentUser } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { usePathname, useRouter, useSearchParams } from "@daodao/i18n/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@daodao/ui/components/tabs";
import { PersonaProfileMe } from "@/components/persona/persona-profile-me";
import { PersonaProfileUser } from "@/components/persona/persona-profile-user";
import { PracticeSection } from "@/components/practice";

enum TabEnum {
  Practice = "practice",
  Persona = "persona",
}

interface UserProfileTabsProps {
  targetUserId: string;
  isOwnProfile: boolean;
}

export function UserProfileTabs({
  targetUserId,
  isOwnProfile: isOwnProfileFromServer,
}: UserProfileTabsProps) {
  const t = useTranslations("persona");
  const tUser = useTranslations("user_profile");
  const { data: currentUserData, isLoading: isCurrentUserLoading } = useCurrentUser();
  // SSR 無法可靠取得 auth cookie，改用 client-side hook 判斷是否為本人 profile
  const isOwnProfile = currentUserData?.data?.id
    ? currentUserData.data.id === targetUserId
    : isOwnProfileFromServer;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabValue = searchParams.get("tab");
  const currentTab = Object.values(TabEnum).includes(tabValue as TabEnum)
    ? (tabValue as TabEnum)
    : TabEnum.Practice;

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="mt-4">
      <TabsList className="w-full">
        <TabsTrigger
          value={TabEnum.Practice}
          className="flex-1 data-[state=inactive]:text-basic-400"
        >
          {tUser("tab_practices")}
        </TabsTrigger>
        <TabsTrigger
          value={TabEnum.Persona}
          className="flex-1 data-[state=inactive]:text-basic-400"
        >
          {t("tabLabel")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value={TabEnum.Practice} className="px-0 md:px-0 lg:px-0 pt-4 md:pt-4 lg:pt-4">
        <PracticeSection userId={targetUserId} />
      </TabsContent>

      <TabsContent value={TabEnum.Persona} className="px-0 md:px-0 lg:px-0 pt-4 md:pt-4 lg:pt-4">
        {isCurrentUserLoading ? (
          <div className="flex flex-col gap-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-white/60 h-16 animate-pulse" />
            ))}
          </div>
        ) : isOwnProfile ? (
          <PersonaProfileMe />
        ) : (
          <PersonaProfileUser targetUserId={targetUserId} />
        )}
      </TabsContent>
    </Tabs>
  );
}
