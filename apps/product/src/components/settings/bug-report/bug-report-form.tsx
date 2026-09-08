"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { CheckCircle, ImagePlus, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

const AREA_KEYS = ["ui", "performance", "auth", "data", "other"] as const;
type Area = (typeof AREA_KEYS)[number];

interface PreviewFile {
  file: File;
  url: string;
}

export function BugReportForm() {
  const t = useTranslations("app_product");
  const [area, setArea] = useState<Area | null>(null);
  const [description, setDescription] = useState("");
  const [screenshots, setScreenshots] = useState<PreviewFile[]>([]);
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddScreenshot = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const remaining = 3 - screenshots.length;
      const newFiles = Array.from(files).slice(0, remaining);
      const previews = newFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setScreenshots((prev) => [...prev, ...previews]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [screenshots.length]
  );

  const handleRemoveScreenshot = useCallback((index: number) => {
    setScreenshots((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!area) {
      toast.error(t("bug_validation_area"));
      return;
    }
    if (!description.trim()) {
      toast.error(t("bug_validation_description"));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("area", area);
      formData.append("description", description);
      if (link) formData.append("link", link);
      formData.append("referrer", window.location.href);
      formData.append("userAgent", navigator.userAgent);
      for (const s of screenshots) {
        formData.append("screenshots", s.file);
      }

      const res = await fetch("/api/feedback/bug-report", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Submit failed");
      setIsSuccess(true);
    } catch {
      toast.error(t("operation_failed_retry"));
    } finally {
      setIsSubmitting(false);
    }
  }, [area, description, link, screenshots, t]);

  const handleReset = useCallback(() => {
    setArea(null);
    setDescription("");
    for (const s of screenshots) URL.revokeObjectURL(s.url);
    setScreenshots([]);
    setLink("");
    setIsSuccess(false);
  }, [screenshots]);

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <CheckCircle className="size-16 text-logo-cyan" />
        <h2 className="text-lg font-medium text-text-dark">{t("bug_success_title")}</h2>
        <p className="text-sm text-light-gray text-center">{t("bug_success_message")}</p>
        <Button variant="outline" onClick={handleReset} className="mt-4">
          {t("bug_success_another")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Area pills */}
      <fieldset>
        <legend className="text-sm font-medium text-text-dark mb-2">{t("bug_area_label")}</legend>
        <div className="flex flex-wrap gap-2">
          {AREA_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setArea(key)}
              className={cn(
                "px-3.5 py-1.5 text-sm rounded-full border transition-colors",
                area === key
                  ? "bg-logo-cyan text-white border-logo-cyan"
                  : "bg-white text-text-dark border-[#E4EAE9] hover:border-logo-cyan/50"
              )}
            >
              {t(`bug_area_${key}`)}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Description */}
      <div>
        <label htmlFor="bug-description" className="text-sm font-medium text-text-dark mb-2 block">
          {t("bug_description_label")}
        </label>
        <textarea
          id="bug-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("bug_description_placeholder")}
          rows={5}
          className="w-full rounded-lg border border-[#E4EAE9] bg-white px-3 py-2.5 text-sm text-text-dark placeholder:text-[#9FB5B8] focus:outline-none focus:ring-2 focus:ring-logo-cyan/30 focus:border-logo-cyan resize-none"
        />
      </div>

      {/* Screenshots */}
      <div>
        <p className="text-sm font-medium text-text-dark mb-2">{t("bug_screenshots_label")}</p>
        <div className="flex flex-wrap gap-2">
          {screenshots.map((s, i) => (
            <div key={s.url} className="relative size-20 rounded-lg overflow-hidden border border-[#E4EAE9]">
              <img src={s.url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveScreenshot(i)}
                className="absolute top-0.5 right-0.5 size-5 flex items-center justify-center rounded-full bg-black/50 text-white"
                aria-label="Remove"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {screenshots.length < 3 && (
            <button
              type="button"
              onClick={handleAddScreenshot}
              className="size-20 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#D9E1E0] text-[#9FB5B8] hover:border-logo-cyan/50 hover:text-logo-cyan transition-colors"
            >
              <ImagePlus className="size-5" />
              <span className="text-[10px]">{t("bug_screenshots_add")}</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Link */}
      <div>
        <label htmlFor="bug-link" className="text-sm font-medium text-text-dark mb-2 block">
          {t("bug_link_label")}
        </label>
        <input
          id="bug-link"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder={t("bug_link_placeholder")}
          className="w-full rounded-lg border border-[#E4EAE9] bg-white px-3 py-2.5 text-sm text-text-dark placeholder:text-[#9FB5B8] focus:outline-none focus:ring-2 focus:ring-logo-cyan/30 focus:border-logo-cyan"
        />
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full h-11 bg-logo-cyan hover:bg-logo-cyan/90 text-white"
      >
        {isSubmitting ? t("bug_submitting") : t("bug_submit")}
      </Button>
    </div>
  );
}
