"use client";

import { usePathname, useRouter, useSearchParams } from "@daodao/i18n/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@daodao/ui/components/tabs";
import { useTranslations } from "next-intl";
import { PersonaProfileMe } from "@/components/persona/persona-profile-me";
import { PersonaProfileUser } from "@/components/persona/persona-profile-user";
import { PracticeSection } from "@/components/practice";

enum TabEnum {
  Practice = "practice",
  Persona = "persona",
}

interface UserProfileTabsProps {
  targetUserId: number;
  isOwnProfile: boolean;
  viewerUserId?: number;
}

export function UserProfileTabs({
  targetUserId,
  isOwnProfile,
  viewerUserId,
}: UserProfileTabsProps) {
  const t = useTranslations("persona");
  const tUser = useTranslations("user_profile");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = (searchParams.get("tab") as TabEnum) ?? TabEnum.Practice;

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="mt-4">
      <TabsList className="w-full">
        <TabsTrigger value={TabEnum.Practice} className="flex-1">
          {tUser("tab_practices")}
        </TabsTrigger>
        <TabsTrigger value={TabEnum.Persona} className="flex-1">
          {t("tabLabel")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value={TabEnum.Practice}>
        <PracticeSection userId={targetUserId} />
      </TabsContent>

      <TabsContent value={TabEnum.Persona}>
        {isOwnProfile ? (
          <PersonaProfileMe />
        ) : (
          <PersonaProfileUser targetUserId={targetUserId} viewerUserId={viewerUserId} />
        )}
      </TabsContent>
    </Tabs>
  );
}
