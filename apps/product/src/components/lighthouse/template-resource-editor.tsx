"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";
import {
  inferResourceName,
  normalizeResourceUrl,
  TEMPLATE_RESOURCES_MAX,
  validateResourceUrl,
} from "@/utils/template-library";

export interface TemplateResourceDraft {
  key: string;
  name: string;
  url: string;
}

interface TemplateResourceEditorProps {
  resources: TemplateResourceDraft[];
  onChange: (resources: TemplateResourceDraft[]) => void;
}

const FETCH_DELAY_MS = 350;

/**
 * Step 3 資源管理（FR-TPL-03）：貼 HTTPS 連結自動推論名稱、手動命名、去重、卡片編輯與移除。
 * 名稱推論在前端以網域對照表完成（原型同款），不打外部網站。
 */
export function TemplateResourceEditor({ resources, onChange }: TemplateResourceEditorProps) {
  const t = useTranslations("lighthouse");
  const [link, setLink] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState("");
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const full = resources.length >= TEMPLATE_RESOURCES_MAX;

  function duplicateUrl(url: string, exceptKey?: string): boolean {
    const key = normalizeResourceUrl(url);
    return resources.some(
      (item) => item.key !== exceptKey && item.url && normalizeResourceUrl(item.url) === key
    );
  }
  function duplicateName(name: string, exceptKey?: string): boolean {
    const key = name.trim().toLowerCase();
    return resources.some(
      (item) => item.key !== exceptKey && item.name.trim().toLowerCase() === key
    );
  }

  async function addByLink() {
    if (full) {
      setError(t("template_resource_err_full", { max: TEMPLATE_RESOURCES_MAX }));
      return;
    }
    const problem = validateResourceUrl(link);
    if (problem === "empty") return setError(t("template_resource_err_empty"));
    if (problem === "invalid") return setError(t("template_resource_err_invalid"));
    if (problem === "https") return setError(t("template_resource_err_https"));
    if (duplicateUrl(link)) return setError(t("template_resource_err_dup_url"));
    setError(null);
    setFetching(true);
    await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS));
    const name = inferResourceName(link.trim());
    setFetching(false);
    if (!name) {
      setManualMode(true);
      setError(t("template_resource_err_no_name"));
      return;
    }
    if (duplicateName(name)) return setError(t("template_resource_err_dup_name"));
    onChange([...resources, { key: `new-${Date.now()}`, name, url: link.trim() }]);
    setLink("");
  }

  function addManual() {
    if (full) {
      setError(t("template_resource_err_full", { max: TEMPLATE_RESOURCES_MAX }));
      return;
    }
    const name = manualName.trim();
    if (!name) return setError(t("template_resource_err_manual_empty"));
    if (duplicateName(name)) return setError(t("template_resource_err_dup_name"));
    const url = link.trim();
    if (url) {
      const problem = validateResourceUrl(url);
      if (problem === "invalid") return setError(t("template_resource_err_invalid"));
      if (problem === "https") return setError(t("template_resource_err_https"));
      if (duplicateUrl(url)) return setError(t("template_resource_err_dup_url"));
    }
    setError(null);
    onChange([...resources, { key: `new-${Date.now()}`, name, url }]);
    setManualName("");
    setLink("");
  }

  function startEdit(resource: TemplateResourceDraft) {
    setEditingKey(resource.key);
    setEditName(resource.name);
    setEditUrl(resource.url);
    setEditError(null);
  }

  function saveEdit() {
    if (!editingKey) return;
    const name = editName.trim();
    if (!name) return setEditError(t("template_resource_err_manual_empty"));
    if (duplicateName(name, editingKey)) return setEditError(t("template_resource_err_dup_name"));
    const url = editUrl.trim();
    if (url) {
      const problem = validateResourceUrl(url);
      if (problem === "invalid") return setEditError(t("template_resource_err_invalid"));
      if (problem === "https") return setEditError(t("template_resource_err_https"));
      if (duplicateUrl(url, editingKey)) return setEditError(t("template_resource_err_dup_url"));
    }
    onChange(resources.map((item) => (item.key === editingKey ? { ...item, name, url } : item)));
    setEditingKey(null);
  }

  return (
    <div className="rounded-2xl bg-[#F7FCFB] p-4">
      <h4 className="text-sm font-semibold">{t("template_resources_title")}</h4>
      <p className="mt-1 text-xs text-[#78928F]">{t("template_resources_hint")}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder={t("template_resource_link_placeholder")}
          value={link}
          onChange={(event) => {
            setLink(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void (manualMode ? addManual() : addByLink());
            }
          }}
          aria-label={t("template_resource_link_placeholder")}
        />
        {!manualMode && (
          <Button
            type="button"
            className={cn("shrink-0 rounded-full", !link.trim() && "opacity-55")}
            disabled={fetching}
            onClick={() => void addByLink()}
          >
            {fetching ? t("template_resource_fetching") : t("template_resource_add_link")}
          </Button>
        )}
      </div>
      {manualMode && (
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Input
            maxLength={100}
            placeholder={t("template_resource_manual_placeholder")}
            value={manualName}
            onChange={(event) => {
              setManualName(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addManual();
              }
            }}
            aria-label={t("template_resource_manual_placeholder")}
          />
          <Button type="button" className="shrink-0 rounded-full bg-[#0D7773]" onClick={addManual}>
            {t("template_resource_add_manual")}
          </Button>
        </div>
      )}
      <button
        type="button"
        className="mt-2 text-xs text-[#0D7773] underline-offset-2 hover:underline"
        onClick={() => {
          setManualMode((value) => !value);
          setError(null);
        }}
      >
        {manualMode ? t("template_resource_link_toggle") : t("template_resource_manual_toggle")}
      </button>
      {error && <p className="mt-2 text-xs text-[#C03A3A]">{error}</p>}

      {resources.length > 0 && (
        <ul className="mt-3 space-y-2">
          {resources.map((resource) => (
            <li
              key={resource.key}
              className="rounded-xl border border-[#DDEFED] bg-white px-3 py-2.5"
            >
              {editingKey === resource.key ? (
                <div className="space-y-2">
                  <Input
                    maxLength={100}
                    placeholder={t("template_resource_name")}
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        saveEdit();
                      }
                      if (event.key === "Escape") setEditingKey(null);
                    }}
                    aria-label={t("template_resource_name")}
                  />
                  <Input
                    placeholder={t("template_resource_url_placeholder")}
                    value={editUrl}
                    onChange={(event) => setEditUrl(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        saveEdit();
                      }
                      if (event.key === "Escape") setEditingKey(null);
                    }}
                    aria-label={t("template_resource_url_placeholder")}
                  />
                  {editError && <p className="text-xs text-[#C03A3A]">{editError}</p>}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setEditingKey(null)}
                    >
                      {t("cancel")}
                    </Button>
                    <Button type="button" size="sm" className="rounded-full" onClick={saveEdit}>
                      {t("template_name_done")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{resource.name}</p>
                    <p className="truncate text-xs text-[#78928F]">
                      {resource.url || t("template_resource_manual_tag")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-[#0D7773]"
                      onClick={() => startEdit(resource)}
                    >
                      {t("edit")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full text-[#78928F]"
                      aria-label={t("template_resource_remove")}
                      onClick={() =>
                        onChange(resources.filter((item) => item.key !== resource.key))
                      }
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
