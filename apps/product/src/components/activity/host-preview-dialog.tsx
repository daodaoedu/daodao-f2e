"use client";

import type { ActivityHostPreviewType } from "@daodao/api";
import { useActivityHostPreview } from "@daodao/api";
import { DefaultAvatarSvg } from "@daodao/assets";
import { useAuthContext } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Spinner } from "@daodao/ui/components/spinner";
import { ExternalLink, MessageCircle, X } from "lucide-react";

interface HostPreviewDialogProps {
  userId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HostPreviewDialog = ({ userId, open, onOpenChange }: HostPreviewDialogProps) => {
  const t = useTranslations("explore_activities");
  const { isAuthenticated } = useAuthContext();
  const { data, isLoading, error } = useActivityHostPreview(open ? userId : null);
  const host = data?.data as ActivityHostPreviewType | undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[380px] rounded-[20px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle className="sr-only">{t("detail_host_label")}</DialogTitle>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/80 text-text-dark/60 transition-colors hover:text-text-dark"
        >
          <X className="size-4" />
        </button>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : error || !host ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-text-dark/60">{t("host_load_error")}</p>
            </div>
          ) : (
            <HostContent host={host} isAuthenticated={isAuthenticated} t={t} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const HostContent = ({
  host,
  isAuthenticated,
  t,
}: {
  host: ActivityHostPreviewType;
  isAuthenticated: boolean;
  t: ReturnType<typeof useTranslations<"explore_activities">>;
}) => (
  <div className="flex flex-col items-center gap-4">
    {host.avatar ? (
      <img src={host.avatar} alt={host.name} className="size-16 rounded-full object-cover" />
    ) : (
      <DefaultAvatarSvg className="size-16 rounded-full" />
    )}

    <div className="text-center">
      <p className="text-lg font-semibold text-bg-dark">{host.name}</p>
      {host.organizationName && (
        <p className="mt-1 text-sm text-text-dark/60">
          {t("host_role", { org: host.organizationName })}
        </p>
      )}
    </div>

    <p className="text-center text-sm leading-relaxed text-text-dark/70">
      {host.selfIntroduction || t("host_no_intro")}
    </p>

    <div className="flex w-full justify-around rounded-xl bg-[#F5FAF9] px-4 py-3.5">
      <StatItem label={t("host_stat_activities")} value={String(host.hostedActivityCount)} />
      <StatItem label={t("host_stat_learned_with")} value={String(host.learnedWithCount)} />
      <StatItem
        label={t("host_stat_joined_year")}
        value={host.joinedYear ? t("host_stat_year_value", { year: host.joinedYear }) : "—"}
      />
    </div>

    <div className="flex w-full flex-col gap-2.5 pt-1">
      {host.identifier && (
        <Link
          href={`/users/${host.identifier}`}
          className="flex h-10 items-center justify-center gap-2 rounded-full bg-logo-cyan text-sm font-semibold text-white transition-colors hover:bg-logo-cyan/90"
        >
          <ExternalLink className="size-3.5" />
          {t("host_view_island")}
        </Link>
      )}
      <button
        type="button"
        disabled
        className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#DCEBEA] text-sm font-medium text-text-dark/40"
        title={isAuthenticated ? t("host_message_soon") : undefined}
      >
        <MessageCircle className="size-3.5" />
        {isAuthenticated ? t("host_message") : t("host_message_guest")}
      </button>
    </div>
  </div>
);

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-lg font-bold text-bg-dark">{value}</span>
    <span className="text-[11px] text-text-dark/50">{label}</span>
  </div>
);
