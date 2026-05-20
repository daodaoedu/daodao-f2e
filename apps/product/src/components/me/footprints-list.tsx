"use client";

import { useMyFootprints } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const FootprintsList = () => {
  const { data, isLoading } = useMyFootprints();
  const t = useTranslations("user_profile");

  if (isLoading) {
    return <div className="flex justify-center py-16 text-[#9FB5B8] text-sm">{t("footprints_loading")}</div>;
  }

  const footprints = data?.data ?? [];

  if (footprints.length === 0) {
    return <div className="text-center py-16 text-[#9FB5B8] text-sm">{t("footprints_empty")}</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {footprints.map((item) => (
        <div key={item.id} className="bg-white rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            {item.practiceDeleted ? (
              <span className="text-sm font-medium text-[#9FB5B8] line-through">{t("footprints_deleted")}</span>
            ) : (
              <CustomLink
                href={`/practices/${item.practiceId}`}
                className="text-sm font-medium text-text-dark hover:underline line-clamp-1 flex-1"
              >
                {item.practiceTitle}
              </CustomLink>
            )}
            <span className="text-xs text-[#9FB5B8] shrink-0">{formatDate(item.createdAt)}</span>
          </div>
          <p className="text-sm text-text-dark/70 line-clamp-2 leading-relaxed">{item.content}</p>
        </div>
      ))}
    </div>
  );
};
