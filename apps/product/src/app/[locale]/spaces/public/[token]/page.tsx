"use client";

import { usePublicSpace } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Spinner } from "@daodao/ui/components/spinner";
import { useParams } from "next/navigation";
import { SpaceBlockView } from "@/components/spaces";

/**
 * 公開連結的訪客視角空間頁（FR-1.4）：免登入，只呈現已發佈內容
 * （server 以成員視角過濾草稿與未到時排程區塊）。
 */
export default function PublicSpacePage() {
  const t = useTranslations("space");
  const params = useParams<{ token: string }>();
  const { data, isLoading, error } = usePublicSpace(params.token);
  const space = data?.data;

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[640px] items-start justify-center px-4 pt-24">
        <Spinner aria-label={t("loading")} />
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[640px] items-start justify-center px-4 pt-24 text-sm text-text-dark/60">
        {t("empty_list")}
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-[640px] px-4 pb-16 pt-10">
      <header className="mb-5 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold text-basic-600">{space.name}</h1>
          {space.subtitle && (
            <p className="truncate text-[13px] text-text-dark/60">{space.subtitle}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-primary-lightest px-3 py-1 text-xs font-medium text-basic-600">
          {t("members_label", { count: space.memberCount })}
        </span>
      </header>
      <div className="flex flex-col gap-4">
        {space.homePage?.blocks.map((block) => (
          <section
            key={block.id}
            data-block-id={block.id}
            className="rounded-2xl border border-[#E4EAE9] bg-white px-5 py-4"
          >
            <h3 className="mb-2.5 text-base font-semibold text-basic-600">{block.title}</h3>
            <SpaceBlockView block={block} />
          </section>
        ))}
      </div>
    </div>
  );
}
