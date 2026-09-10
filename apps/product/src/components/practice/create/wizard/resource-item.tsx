"use client";

import { BookSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { Link2Icon, PencilIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RESOURCE_NAME_MAX_LENGTH, type WizardResource } from "./schema";
import {
  WIZARD_INPUT,
  WIZARD_RESOURCE_CARD,
  WIZARD_RESOURCE_LINK,
  WIZARD_RESOURCE_PLAIN,
} from "./wizard-styles";

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

const editInputClass = cn(
  "h-8 px-2.5 py-1 text-sm focus-visible:px-2.5 focus-visible:py-1 rounded-[6px]",
  WIZARD_INPUT,
  "rounded-[6px]"
);

/** 指派列的小膠囊（POC：26px 高、12px 字） */
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
    className={cn(
      "h-[26px] min-w-[26px] rounded-full px-2.5 text-xs",
      !selected &&
        "border-bg-gray text-text-dark hover:border-logo-cyan hover:bg-white hover:text-logo-cyan"
    )}
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
    <div className={cn(WIZARD_RESOURCE_CARD, showAssign && "flex-col items-stretch gap-2")}>
      <div className="flex items-center gap-3">
        <BookSvg width={24} height={23} className="shrink-0 opacity-85" aria-hidden="true" />
        {isEditing ? (
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Input
              ref={nameInputRef}
              value={draftName}
              maxLength={RESOURCE_NAME_MAX_LENGTH}
              placeholder={t("wizard_resource_edit_name_placeholder")}
              invalid={Boolean(error)}
              className={cn(editInputClass, "border-logo-cyan")}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Input
              type="url"
              value={draftUrl}
              placeholder={t("wizard_resource_edit_url_placeholder")}
              className={cn(editInputClass, "text-[13px]")}
              onChange={(e) => setDraftUrl(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {error && (
              <p className="text-xs text-red" role="alert">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="h-[30px] border-bg-gray px-3.5 text-[13px] text-light-gray hover:border-logo-cyan"
              >
                {t("wizard_resource_cancel")}
              </Button>
              <Button type="button" onClick={handleSave} className="h-[30px] px-4 text-[13px]">
                {t("wizard_resource_done")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {resource.url ? (
              <>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={resource.url}
                  className={WIZARD_RESOURCE_LINK}
                >
                  {resource.name}
                </a>
                <Link2Icon className="size-4 shrink-0 text-logo-cyan" aria-hidden="true" />
              </>
            ) : (
              <span className={WIZARD_RESOURCE_PLAIN}>{resource.name}</span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("wizard_resource_edit")}
              onClick={onStartEdit}
              className="-my-2 -mr-2 size-10 shrink-0 text-light-gray hover:text-logo-cyan"
            >
              <PencilIcon className="size-[15px]" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("wizard_resource_remove")}
              onClick={onRemove}
              className="-my-2 -mr-2 size-10 shrink-0 text-light-gray hover:text-red"
            >
              <XIcon className="size-3.5" />
            </Button>
          </>
        )}
      </div>

      {showAssign && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-very-light-gray pt-2">
          <span className="text-xs text-light-gray">{t("wizard_resource_assign_label")}</span>
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
                  size="xs"
                  className={cn(
                    "size-4 justify-center px-0 text-[10px]",
                    selected && "text-logo-cyan"
                  )}
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
