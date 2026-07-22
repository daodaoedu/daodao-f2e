"use client";

import {
  addLighthouseOrganizationMember,
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
import { Building2, Plus, UserMinus } from "lucide-react";
import { useState } from "react";

export function OrganizationSettings() {
  const t = useTranslations("lighthouse");
  const organizationsQuery = useLighthouseOrganizations();
  const organization = organizationsQuery.organizations?.[0];
  const membersQuery = useLighthouseOrganizationMembers(organization?.id);
  const [busy, setBusy] = useState(false);
  async function save(formData: FormData) {
    if (!organization) return;
    setBusy(true);
    const response = await updateLighthouseOrganization(organization.id, {
      name: String(formData.get("name") ?? "").trim(),
      bio: String(formData.get("bio") ?? "").trim() || null,
      externalLink: String(formData.get("externalLink") ?? "").trim() || null,
    });
    setBusy(false);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await organizationsQuery.mutate();
    toast.success(t("organization_saved"));
  }
  async function add(formData: FormData) {
    if (!organization) return;
    const userId = Number(formData.get("userId"));
    if (!userId) return;
    const response = await addLighthouseOrganizationMember(organization.id, { userId });
    if (response.error) {
      toast.error(t("organization_member_add_failed"));
      return;
    }
    await membersQuery.mutate();
    toast.success(t("organization_member_added"));
  }
  async function remove(userId: number) {
    if (!organization || !window.confirm(t("organization_member_remove_confirm"))) return;
    const response = await removeLighthouseOrganizationMember(organization.id, userId);
    if (response.error) {
      toast.error(t("organization_member_remove_failed"));
      return;
    }
    await membersQuery.mutate();
  }
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 md:px-10 md:py-14">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
          {t("organization_eyebrow")}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          {t("organization_title")}
        </h1>
        <p className="mt-3 text-[#5A7B79]">{t("organization_description")}</p>
      </header>
      {organization && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form action={save} className="rounded-3xl border border-[#CDEBE8] bg-white p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[#E7FAF7] text-[#0D7773]">
                <Building2 className="size-5" />
              </span>
              <h2 className="text-xl font-semibold">{t("organization_profile")}</h2>
            </div>
            <label htmlFor="organization-name" className="mt-6 grid gap-2 text-sm font-medium">
              {t("organization_name")}
              <Input id="organization-name" name="name" required defaultValue={organization.name} />
            </label>
            <label htmlFor="organization-bio" className="mt-4 grid gap-2 text-sm font-medium">
              {t("organization_bio")}
              <Textarea id="organization-bio" name="bio" defaultValue={organization.bio ?? ""} />
            </label>
            <label htmlFor="organization-link" className="mt-4 grid gap-2 text-sm font-medium">
              {t("organization_external_link")}
              <Input
                id="organization-link"
                name="externalLink"
                type="url"
                defaultValue={organization.externalLink ?? ""}
              />
            </label>
            <Button type="submit" className="mt-5" disabled={busy}>
              {t("save")}
            </Button>
          </form>
          <section className="rounded-3xl border border-[#CDEBE8] bg-white p-6">
            <h2 className="text-xl font-semibold">{t("organization_members")}</h2>
            <form action={add} className="mt-5 flex gap-2">
              <Input
                name="userId"
                type="number"
                min={1}
                required
                placeholder={t("user_id")}
                aria-label={t("user_id")}
              />
              <Button type="submit" size="icon" aria-label={t("add_member")}>
                <Plus className="size-4" />
              </Button>
            </form>
            <ul className="mt-5 divide-y divide-[#DDEFED]">
              {membersQuery.data?.data.map((member) => (
                <li key={member.id} className="flex items-center gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {member.nickname || `${t("user_id")} ${member.userId}`}
                    </p>
                    <p className="mt-1 text-xs text-[#78928F]">
                      {t(`organization_role_${member.role}`)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t("remove")}
                    onClick={() => void remove(member.userId)}
                  >
                    <UserMinus className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
