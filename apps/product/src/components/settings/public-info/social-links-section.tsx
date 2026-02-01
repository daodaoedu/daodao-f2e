"use client";

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
  return (
    <div className="bg-white rounded-xl p-4 space-y-4">
      <h3 className="text-base font-medium text-text-dark mb-4">其他社群</h3>

      {/* 個人網址 */}
      <FormField
        control={form.control}
        name="personalUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">個人網址</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="請輸入個人網址"
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
                placeholder="請輸入 Facebook 網址"
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
                placeholder="請輸入 Instagram 網址"
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
                placeholder="請輸入 LinkedIn 網址"
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
                placeholder="請輸入 Github 網址"
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
                placeholder="請輸入 Discord User ID"
                className={cn(
                  form.formState.errors.discord && "border-red focus-visible:border-red"
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
