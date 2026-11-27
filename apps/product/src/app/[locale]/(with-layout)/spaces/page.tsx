"use client";

import { useMySpaces } from "@daodao/api";
import { SpacesOutlineSvg } from "@daodao/assets";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Spinner } from "@daodao/ui/components/spinner";
import { useState } from "react";
import { ListPageShell } from "@/components/layout/list-page-shell";
import { SpaceCard, type SpaceCreateKind, SpaceCreateSheet, SpaceFab } from "@/components/spaces";

/** 空間主頁 (FRD 3.1/3.2/3.3): the aggregated space list with the create FAB. */
export default function SpacesPage() {
  const t = useTranslations("space");
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { data, isLoading } = useMySpaces();
  const [createKind, setCreateKind] = useState<Exclude<SpaceCreateKind, "practice"> | null>(null);

  const spaces = data?.data;

  const handleCreateSelect = (kind: SpaceCreateKind) => {
    if (kind === "practice") {
      router.push("/practices/create");
      return;
    }
    setCreateKind(kind);
  };

  return (
    <ListPageShell
      title={t("page_title")}
      subtitle={t("list_subtitle", { count: spaces?.total ?? 0 })}
      icon={<SpacesOutlineSvg className="size-6 shrink-0 text-logo-cyan" aria-hidden="true" />}
    >
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner aria-label={t("loading")} />
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {spaces?.items.map((space) => (
            <SpaceCard key={space.id ?? space.kind} space={space} />
          ))}
        </ul>
      )}
      <SpaceFab isAdmin={isAdmin} onSelect={handleCreateSelect} />
      <SpaceCreateSheet kind={createKind} onClose={() => setCreateKind(null)} />
    </ListPageShell>
  );
}
