"use client";

import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { Link2Icon, PencilIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RESOURCE_NAME_MAX_LENGTH, type WizardResource } from "./schema";

export interface ResourceItemProps {
  resource: WizardResource;
  /** 是否處於編輯狀態（同時僅一張卡可編輯，由父層控制） */
  isEditing: boolean;
  /** 拆段時的段數；0 或 undefined = 不顯示指派列 */
  segmentCount?: number;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  /** 回傳錯誤訊息 = 驗證失敗，卡片內顯示；回傳 null = 儲存成功 */
  onSave: (draft: { name: string; url: string }) => string | null;
  onRemove: () => void;
  onToggleSegment: (index: number) => void;
  onAssignAll: () => void;
}

const ChipButton = ({
  selected,
  onClick,
  children,
  ariaLabel,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}) => (
  <Button
    type="button"
    variant={selected ? "default" : "outline"}
    size="sm"
    aria-pressed={selected}
    aria-label={ariaLabel}
    onClick={onClick}
    className="h-10 min-w-10 rounded-full px-3"
  >
    {children}
  </Button>
);

/** 單筆資源卡片：顯示／就地編輯／段落指派 */
export const ResourceItem = ({
  resource,
  isEditing,
  segmentCount = 0,
  onStartEdit,
  onCancelEdit,
  onSave,
  onRemove,
  onToggleSegment,
  onAssignAll,
}: ResourceItemProps) => {
  const t = useTranslations("practice");
  const [draftName, setDraftName] = useState(resource.name);
  const [draftUrl, setDraftUrl] = useState(resource.url);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // 進入編輯時同步草稿並聚焦名稱欄
  useEffect(() => {
    if (isEditing) {
      setDraftName(resource.name);
      setDraftUrl(resource.url);
      setError(null);
      nameInputRef.current?.focus();
    }
  }, [isEditing, resource.name, resource.url]);

  const handleSave = () => {
    const result = onSave({ name: draftName.trim(), url: draftUrl.trim() });
    setError(result);
  };

  const handleCancel = () => {
    setError(null);
    onCancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const isAll = resource.segmentIndexes.length === 0;
  const showAssign = segmentCount > 0;

  return (
    <div className="rounded-lg border border-logo-cyan bg-white p-3">
      {isEditing ? (
        <div className="space-y-2">
          <Input
            ref={nameInputRef}
            value={draftName}
            maxLength={RESOURCE_NAME_MAX_LENGTH}
            placeholder={t("wizard_resource_name_placeholder")}
            invalid={Boolean(error)}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Input
            type="url"
            value={draftUrl}
            placeholder={t("wizard_resource_edit_url_placeholder")}
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {error && (
            <p className="text-sm text-red" role="alert">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t("wizard_resource_cancel")}
            </Button>
            <Button type="button" onClick={handleSave}>
              {t("wizard_resource_done")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-light-cyan text-logo-cyan">
            <Link2Icon className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1 text-sm text-text-dark">
            {resource.url ? (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                title={resource.url}
                className="inline-flex max-w-full items-center gap-1 hover:text-logo-cyan hover:underline"
              >
                <span className="line-clamp-1 break-all">{resource.name}</span>
                <Link2Icon className="size-4 shrink-0 text-logo-cyan" aria-hidden="true" />
              </a>
            ) : (
              <span className="line-clamp-1 break-all">{resource.name}</span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("wizard_resource_edit")}
            onClick={onStartEdit}
            className="shrink-0"
          >
            <PencilIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("wizard_resource_remove")}
            onClick={onRemove}
            className="shrink-0"
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      )}

      {showAssign && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-bg-gray pt-3">
          <span className="text-sm text-text-dark">{t("wizard_resource_assign_label")}</span>
          <ChipButton selected={isAll} onClick={onAssignAll}>
            {t("wizard_resource_assign_all")}
          </ChipButton>
          {Array.from({ length: segmentCount }, (_, i) => i).map((index) => {
            const selected = resource.segmentIndexes.includes(index);
            return (
              <ChipButton
                key={index}
                selected={selected}
                onClick={() => onToggleSegment(index)}
                ariaLabel={`${t("wizard_resource_assign_label")} ${index + 1}`}
              >
                <Badge
                  variant={selected ? "secondary" : "outline-logo"}
                  size="sm"
                  className={cn("size-5 justify-center px-0", selected && "text-logo-cyan")}
                >
                  {index + 1}
                </Badge>
              </ChipButton>
            );
          })}
        </div>
      )}
    </div>
  );
};
