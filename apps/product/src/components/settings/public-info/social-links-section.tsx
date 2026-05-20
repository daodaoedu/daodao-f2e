"use client";

import { useTranslations } from "@daodao/i18n";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { PublicInfoFormValues } from "./schema";

interface ISocialLinksSectionProps {
  form: UseFormReturn<PublicInfoFormValues>;
}

export const SocialLinksSection = ({ form }: ISocialLinksSectionProps) => {
  const t = useTranslations("public_info_settings");
  return (
    <div className="bg-white rounded-xl p-4 space-y-4">
      <h3 className="text-base font-medium text-text-dark mb-4">{t("social_links_title")}</h3>

      {/* 個人網址 */}
      <FormField
        control={form.control}
        name="personalUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">{t("personal_url_label")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("personal_url_placeholder")}
                type="url"
                className={cn(
                  form.formState.errors.personalUrl && "border-red focus-visible:border-red"
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Facebook */}
      <FormField
        control={form.control}
        name="facebook"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">Facebook</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("facebook_placeholder")}
                type="url"
                className={cn(
                  form.formState.errors.facebook && "border-red focus-visible:border-red"
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Instagram */}
      <FormField
        control={form.control}
        name="instagram"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">Instagram</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("instagram_placeholder")}
                type="url"
                className={cn(
                  form.formState.errors.instagram && "border-red focus-visible:border-red"
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* LinkedIn */}
      <FormField
        control={form.control}
        name="linkedin"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">LinkedIn</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("linkedin_placeholder")}
                type="url"
                className={cn(
                  form.formState.errors.linkedin && "border-red focus-visible:border-red"
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Github */}
      <FormField
        control={form.control}
        name="github"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">Github</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("github_placeholder")}
                type="url"
                className={cn(
                  form.formState.errors.github && "border-red focus-visible:border-red"
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Discord */}
      <FormField
        control={form.control}
        name="discord"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">Discord</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("discord_placeholder")}
                className={cn(
                  form.formState.errors.discord && "border-red focus-visible:border-red"
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Line */}
      <FormField
        control={form.control}
        name="line"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">LINE</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("line_placeholder")}
                className={cn(form.formState.errors.line && "border-red focus-visible:border-red")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Threads */}
      <FormField
        control={form.control}
        name="threads"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">Threads</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("threads_placeholder")}
                type="url"
                className={cn(
                  form.formState.errors.threads && "border-red focus-visible:border-red"
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
