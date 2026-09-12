"use client";

import {
  removeLighthouseOrganizationMember,
  updateLighthouseOrganization,
  useLighthouseOrganizationMembers,
  useLighthouseOrganizations,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { Building2, Plus, UserMinus, Users } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "./confirm-dialog";
import { OrganizationAiKeyCard } from "./organization-ai-key-card";

type SaveState = "idle" | "saving" | "saved" | "failed";
const ORGANIZATION_BIO_MAX = 2000;

/**
 * 組織設定（FRD frd-templates-org-archive.md §3.2）：
 * - 組織資訊：可編輯、儲存中／成功／失敗四態，失敗保留輸入（FR-ORG-01）
 * - 組織成員：唯讀列表；新增依 FRD 為「即將推出」disabled（FR-ORG-02）；移除保留並改用確認框
 * - AI API key：見 OrganizationAiKeyCard（FR-ORG-03）
 */
export function OrganizationSettings() {
  const t = useTranslations("lighthouse");
  const organizationsQuery = useLighthouseOrganizations();
  const organization = organizationsQuery.organizations?.[0];
  const membersQuery = useLighthouseOrganizationMembers(organization?.id);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<{ userId: number; name: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(formData: FormData) {
    if (!organization) return;
    const name = String(formData.get("name") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();
    const externalLink = String(formData.get("externalLink") ?? "").trim();
    if (!name) {
      setFieldError(t("organization_name_required"));
      setSaveState("failed");
      return;
    }
    if (externalLink && !isValidUrl(externalLink)) {
      setFieldError(t("organization_external_link_invalid"));
      setSaveState("failed");
      return;
    }
    setFieldError(null);
    setSaveState("saving");
    const response = await updateLighthouseOrganization(organization.id, {
      name,
      bio: bio || null,
      externalLink: externalLink || null,
    });
    if (response.error) {
      setSaveState("failed");
      toast.error(t("save_failed"));
      return;
    }
    await organizationsQuery.mutate();
    setSaveState("saved");
    toast.success(t("organization_saved"));
  }

  async function remove() {
    if (!organization || !removing) return;
    setBusy(true);
    const response = await removeLighthouseOrganizationMember(organization.id, removing.userId);
    setBusy(false);
    setRemoving(null);
    if (response.error) {
      toast.error(t("organization_member_remove_failed"));
      return;
    }
    await membersQuery.mutate();
    toast.success(t("organization_member_removed"));
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 md:px-10 md:py-14">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
          {t("organization_eyebrow")}
        </p>
        <h1 className="mt-3 text-2xl font-semibold leading-[1.45] tracking-[-0.04em] md:text-3xl">
          {t("organization_title")}
        </h1>
        <p className="mt-3 text-[#5A7B79]">{t("organization_description")}</p>
      </header>
      {organization && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            action={save}
            className="rounded-3xl border border-[#CDEBE8] bg-white p-6"
            onChange={() => saveState !== "saving" && setSaveState("idle")}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[#E7FAF7] text-[#0D7773]">
                <Building2 className="size-5" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-semibold">{t("organization_profile")}</h2>
            </div>
            <label htmlFor="organization-name" className="mt-6 grid gap-2 text-sm font-medium">
              {t("organization_name")}
              <Input id="organization-name" name="name" required defaultValue={organization.name} />
            </label>
            <label htmlFor="organization-bio" className="mt-4 grid gap-2 text-sm font-medium">
              {t("organization_bio")}
              <Textarea
                id="organization-bio"
                name="bio"
                rows={4}
                maxLength={ORGANIZATION_BIO_MAX}
                defaultValue={organization.bio ?? ""}
              />
            </label>
            <label htmlFor="organization-link" className="mt-4 grid gap-2 text-sm font-medium">
              {t("organization_external_link")}
              <Input
                id="organization-link"
                name="externalLink"
                type="url"
                placeholder="https://"
                defaultValue={organization.externalLink ?? ""}
              />
            </label>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button type="submit" className="rounded-full" disabled={saveState === "saving"}>
                {saveState === "saving" ? t("saving") : t("save")}
              </Button>
              <output
                aria-live="polite"
                className={cn(
                  "text-sm",
                  saveState === "saved" && "text-[#0D7773]",
                  saveState === "failed" && "text-[#C03A3A]",
                  (saveState === "idle" || saveState === "saving") && "text-[#78928F]"
                )}
              >
                {saveState === "saved" && t("organization_saved")}
                {saveState === "failed" && (fieldError ?? t("save_failed"))}
                {saveState === "idle" &&
                  organization.updatedAt &&
                  t("organization_updated_at", { time: formatTime(organization.updatedAt) })}
              </output>
            </div>
          </form>

          <section className="rounded-3xl border border-[#CDEBE8] bg-white p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[#E7FAF7] text-[#0D7773]">
                <Users className="size-5" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-semibold">{t("organization_members")}</h2>
            </div>
            {/* FR-ORG-02：新增成員尚未開放，欄位與按鈕 disabled，明確標示即將推出 */}
            <div className="mt-5 flex gap-2">
              <Input
                name="email"
                type="email"
                disabled
                placeholder={t("organization_member_email_placeholder")}
                aria-label={t("organization_member_email_placeholder")}
                className="cursor-not-allowed bg-[#F6F9F8]"
              />
              <Button
                type="button"
                size="icon"
                disabled
                aria-label={t("add_member")}
                title={t("organization_member_coming_soon")}
                className="rounded-full"
              >
                <Plus className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-[#78928F]">{t("organization_member_coming_soon")}</p>
            <ul className="mt-5 divide-y divide-[#DDEFED]">
              {membersQuery.data?.data.map((member) => {
                const name = member.nickname || `${t("user_id")} ${member.userId}`;
                return (
                  <li key={member.id} className="flex items-center gap-3 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{name}</p>
                      <p className="mt-1 text-xs text-[#78928F]">
                        {t(`organization_role_${member.role}`)}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={t("remove")}
                      title={t("remove")}
                      disabled={busy}
                      onClick={() => setRemoving({ userId: member.userId, name })}
                    >
                      <UserMinus className="size-4" aria-hidden="true" />
                    </Button>
                  </li>
                );
              })}
              {membersQuery.data && membersQuery.data.data.length === 0 && (
                <li className="py-4 text-sm text-[#78928F]">{t("organization_members_empty")}</li>
              )}
            </ul>
          </section>

          <div className="lg:col-span-2">
            <OrganizationAiKeyCard organizationId={organization.id} />
          </div>
        </div>
      )}
      <ConfirmDialog
        open={removing !== null}
        title={t("organization_member_remove_title")}
        description={
          removing ? t("organization_member_remove_message", { name: removing.name }) : undefined
        }
        confirmLabel={t("remove")}
        destructive
        busy={busy}
        onConfirm={remove}
        onOpenChange={(open) => !open && setRemoving(null)}
      />
    </div>
  );
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("zh-TW", { hour12: false });
}
