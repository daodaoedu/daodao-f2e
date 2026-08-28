"use client";

import { ArrowRightOutlineSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTagEditSheet } from "@/hooks/use-tag-edit-sheet";
import { deriveResourceName } from "@/lib/practice-create";
import { getEffectiveSegments } from "./derive";
import { ResourceItem } from "./resource-item";
import {
  RESOURCE_NAME_MAX_LENGTH,
  RESOURCES_MAX,
  type WizardFormValues,
  type WizardResource,
} from "./schema";
import { resolveResourceName } from "./use-resource-name";

export interface StepTagsResourcesProps {
  form: UseFormReturn<WizardFormValues>;
}

/** 供父層在離開 Step 3 前把尚未按「加入」的暫存資源補進表單；回傳 false = 暫存輸入驗證失敗 */
export interface StepTagsResourcesHandle {
  commitPending: () => boolean;
}

type TFunction = ReturnType<typeof useTranslations<"practice">>;

const normalizeUrl = (url: string) => url.trim().toLowerCase().replace(/\/$/, "");

const newResourceId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Date.now().toString();

/** 驗證連結格式；回傳錯誤訊息或 null（空字串由呼叫端決定是否允許） */
const validateUrl = (url: string, t: TFunction): string | null => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return t("wizard_resource_url_invalid");
  }
  if (parsed.protocol !== "https:") return t("wizard_resource_url_https");
  return null;
};

const isDuplicateUrl = (resources: WizardResource[], url: string, excludeId?: string) => {
  const target = normalizeUrl(url);
  return resources.some(
    (r) => r.id !== excludeId && r.url !== "" && normalizeUrl(r.url) === target
  );
};

const isDuplicateName = (resources: WizardResource[], name: string, excludeId?: string) => {
  const target = name.trim().toLowerCase();
  return resources.some((r) => r.id !== excludeId && r.name.trim().toLowerCase() === target);
};

/** Step 3｜標籤與資源 */
export const StepTagsResources = forwardRef<StepTagsResourcesHandle, StepTagsResourcesProps>(
  ({ form }, ref) => {
    const t = useTranslations("practice");
    const [urlInput, setUrlInput] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [isManual, setIsManual] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [inputError, setInputError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    // 擷取中重複點擊「加入」不產生重複資源
    const fetchingRef = useRef(false);

    const tags = form.watch("tags") ?? [];
    const resources = form.watch("resources") ?? [];
    const isSegmented = form.watch("isSegmented");
    const segmentCount = isSegmented
      ? getEffectiveSegments(form.getValues(), t("wizard_name_fallback")).length
      : 0;

    const { openTagEditSheet } = useTagEditSheet({
      initialTags: tags,
      onComplete: (data) => {
        form.setValue("tags", data.selectedTags, { shouldDirty: true });
      },
    });

    const setResources = (next: WizardResource[]) => {
      form.setValue("resources", next, { shouldDirty: true });
    };

    const resetInputs = () => {
      setUrlInput("");
      setNameInput("");
      setIsManual(false);
      setInputError(null);
      form.clearErrors("resources");
    };

    /** 把一筆通過格式驗證的資源寫入表單（含上限與去重）；回傳是否成功 */
    const appendResource = (name: string, url: string): boolean => {
      const current = form.getValues("resources") ?? [];
      if (current.length >= RESOURCES_MAX) {
        setInputError(t("wizard_resource_max", { max: RESOURCES_MAX }));
        return false;
      }
      if (url && isDuplicateUrl(current, url)) {
        setInputError(t("wizard_resource_duplicate_url"));
        return false;
      }
      if (!url && isDuplicateName(current, name)) {
        setInputError(t("wizard_resource_duplicate_name"));
        return false;
      }
      setResources([...current, { id: newResourceId(), name, url, segmentIndexes: [] }]);
      resetInputs();
      return true;
    };

    /** 手動模式「新增」：名稱必填；連結有值則一併驗證寫入 */
    const commitManual = (): boolean => {
      const name = nameInput.trim().slice(0, RESOURCE_NAME_MAX_LENGTH);
      const url = urlInput.trim();
      if (!name) {
        setInputError(t("wizard_resource_name_required"));
        return false;
      }
      if (url) {
        const urlError = validateUrl(url, t);
        if (urlError) {
          setInputError(urlError);
          return false;
        }
      }
      return appendResource(name, url);
    };

    /** 連結模式「加入」：驗證 → 擷取名稱 → 寫入 */
    const commitLink = async () => {
      if (fetchingRef.current) return;
      const url = urlInput.trim();
      if (!url) {
        setInputError(t("wizard_resource_url_empty"));
        return;
      }
      const urlError = validateUrl(url, t);
      if (urlError) {
        setInputError(urlError);
        return;
      }
      const current = form.getValues("resources") ?? [];
      if (current.length >= RESOURCES_MAX) {
        setInputError(t("wizard_resource_max", { max: RESOURCES_MAX }));
        return;
      }
      if (isDuplicateUrl(current, url)) {
        setInputError(t("wizard_resource_duplicate_url"));
        return;
      }

      fetchingRef.current = true;
      setIsFetching(true);
      setInputError(null);
      try {
        const name = await resolveResourceName(url);
        if (name === null) {
          // 推導鏈拿不到名稱：保留連結、切手動模式請使用者命名
          setIsManual(true);
          setInputError(t("wizard_resource_fetch_failed"));
          return;
        }
        appendResource(name, url);
      } finally {
        fetchingRef.current = false;
        setIsFetching(false);
      }
    };

    /**
     * 離開 Step 3 前補交暫存輸入。
     * 連結模式的擷取是非同步的，這裡改以純推導鏈同步取名（不等 og:title），避免使用者貼了連結卻被靜默丟棄。
     */
    const commitPending = (): boolean => {
      if (isFetching) return false;
      const url = urlInput.trim();
      const name = nameInput.trim();
      if (!url && !name) return true;

      if (isManual) return commitManual();

      const urlError = validateUrl(url, t);
      if (urlError) {
        setInputError(urlError);
        return false;
      }
      // 同步路徑：已知網域／路徑／網域推導（不含 og:title）
      const derived = deriveResourceName(url);
      if (!derived) {
        setIsManual(true);
        setInputError(t("wizard_resource_fetch_failed"));
        return false;
      }
      return appendResource(derived, url);
    };

    useImperativeHandle(ref, () => ({ commitPending }));

    // --- 卡片操作 ---------------------------------------------------------

    const handleRemove = (id: string) => {
      setResources(resources.filter((r) => r.id !== id));
      if (editingId === id) setEditingId(null);
    };

    const handleSave = (id: string, draft: { name: string; url: string }): string | null => {
      if (!draft.name) return t("wizard_resource_name_required");
      if (draft.url) {
        const urlError = validateUrl(draft.url, t);
        if (urlError) return urlError;
        if (isDuplicateUrl(resources, draft.url, id)) return t("wizard_resource_duplicate_url");
      }
      setResources(
        resources.map((r) =>
          r.id === id
            ? { ...r, name: draft.name.slice(0, RESOURCE_NAME_MAX_LENGTH), url: draft.url }
            : r
        )
      );
      setEditingId(null);
      return null;
    };

    const handleToggleSegment = (id: string, index: number) => {
      setResources(
        resources.map((r) => {
          if (r.id !== id) return r;
          const has = r.segmentIndexes.includes(index);
          const next = has
            ? r.segmentIndexes.filter((i) => i !== index)
            : [...r.segmentIndexes, index].sort((a, b) => a - b);
          return { ...r, segmentIndexes: next };
        })
      );
    };

    const handleAssignAll = (id: string) => {
      setResources(resources.map((r) => (r.id === id ? { ...r, segmentIndexes: [] } : r)));
    };

    // --- 輸入事件 ---------------------------------------------------------

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (isManual) {
        commitManual();
      } else {
        void commitLink();
      }
    };

    const toggleMode = () => {
      setIsManual((prev) => !prev);
      setInputError(null);
    };

    const urlEmpty = urlInput.trim() === "";

    return (
      <div className="space-y-8">
        {/* 標籤 */}
        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel className="mb-3 block text-base font-normal text-text-dark">
                {t("wizard_tags_label")}
              </FormLabel>
              {tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline-blue" size="lg" className="rounded-lg">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <Button type="button" onClick={openTagEditSheet} className="w-full">
                {t("wizard_tags_edit")}
                <ArrowRightOutlineSvg className="size-4.5" />
              </Button>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 資源 */}
        <FormField
          control={form.control}
          name="resources"
          render={() => (
            <FormItem>
              <FormLabel className="mb-3 block text-base font-normal text-text-dark">
                {t("wizard_resources_label")}
              </FormLabel>

              <div className="space-y-3">
                {isManual && (
                  <div className="flex gap-2">
                    <Input
                      value={nameInput}
                      maxLength={RESOURCE_NAME_MAX_LENGTH}
                      placeholder={t("wizard_resource_name_placeholder")}
                      invalid={Boolean(inputError)}
                      onChange={(e) => {
                        setNameInput(e.target.value);
                        if (inputError) setInputError(null);
                      }}
                      onKeyDown={handleInputKeyDown}
                      className="min-w-0 flex-1"
                    />
                    <Button type="button" onClick={commitManual} className="shrink-0">
                      {t("wizard_resource_manual_add")}
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    type="url"
                    inputMode="url"
                    value={urlInput}
                    placeholder={
                      isManual
                        ? t("wizard_resource_edit_url_placeholder")
                        : t("wizard_resource_url_placeholder")
                    }
                    invalid={Boolean(inputError) && !isManual}
                    disabled={isFetching}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      if (inputError) setInputError(null);
                    }}
                    onKeyDown={handleInputKeyDown}
                    className="min-w-0 flex-1"
                  />
                  {!isManual && (
                    <Button
                      type="button"
                      onClick={() => void commitLink()}
                      disabled={isFetching}
                      aria-busy={isFetching}
                      className={cn("shrink-0", urlEmpty && !isFetching && "opacity-50")}
                    >
                      {isFetching ? t("wizard_resource_fetching") : t("wizard_resource_add")}
                    </Button>
                  )}
                </div>

                {inputError && (
                  <p className="text-sm text-red" role="alert">
                    {inputError}
                  </p>
                )}

                <Button
                  type="button"
                  variant="link"
                  onClick={toggleMode}
                  className="h-10 px-0 text-sm text-logo-cyan"
                >
                  {isManual ? t("wizard_resource_link_switch") : t("wizard_resource_manual_switch")}
                </Button>
              </div>

              <FormMessage className="mt-2" />

              {resources.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {resources.map((resource) => (
                    <li key={resource.id}>
                      <ResourceItem
                        resource={resource}
                        isEditing={editingId === resource.id}
                        segmentCount={segmentCount}
                        onStartEdit={() => setEditingId(resource.id)}
                        onCancelEdit={() => setEditingId(null)}
                        onSave={(draft) => handleSave(resource.id, draft)}
                        onRemove={() => handleRemove(resource.id)}
                        onToggleSegment={(index) => handleToggleSegment(resource.id, index)}
                        onAssignAll={() => handleAssignAll(resource.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </FormItem>
          )}
        />
      </div>
    );
  }
);
StepTagsResources.displayName = "StepTagsResources";
