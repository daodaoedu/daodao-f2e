"use client";

import {
  type LighthouseTemplate,
  useLighthouseOrganizationCohorts,
  useLighthouseOrganizations,
  useLighthouseTemplates,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { BookOpenText, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { templateMatches } from "@/utils/template-library";
import { TemplateCard } from "./template-card";
import { TemplateEditorDialog, type TemplateSaveKind } from "./template-editor-dialog";

type EditorState = { open: boolean; template: LighthouseTemplate | null };
type CompleteState = { template: LighthouseTemplate; kind: TemplateSaveKind } | null;

/**
 * 模板庫（FRD frd-templates-org-archive.md §3.1）：列表 + 搜尋 + 數量、建立／編輯 wizard、完成視窗。
 * 排序沿後端（最後更新在前）；搜尋在前端做（模板量小、即時回應）。
 */
export function TemplatesManager() {
  const t = useTranslations("lighthouse");
  const { organizations } = useLighthouseOrganizations();
  const organization = organizations?.[0];
  const templatesQuery = useLighthouseTemplates(organization?.id);
  const cohortsQuery = useLighthouseOrganizationCohorts(organization?.id);
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<EditorState>({ open: false, template: null });
  const [complete, setComplete] = useState<CompleteState>(null);

  const templates = templatesQuery.data?.data ?? [];
  const draftLabel = t("template_draft_badge");
  const filtered = useMemo(
    () =>
      templates.filter((template) =>
        templateMatches(template, query, template.status === "draft" ? draftLabel : "")
      ),
    [templates, query, draftLabel]
  );
  const searching = query.trim().length > 0;

  function handleSaved(template: LighthouseTemplate, kind: TemplateSaveKind) {
    void templatesQuery.mutate();
    setEditor({ open: false, template: null });
    setComplete({ template, kind });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10 md:py-14">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
            {t("templates_eyebrow")}
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
            {t("templates_title")}
          </h1>
          <p className="mt-3 max-w-2xl text-[#5A7B79]">{t("templates_description")}</p>
        </div>
        <Button
          className="rounded-full"
          onClick={() => setEditor({ open: true, template: null })}
          disabled={!organization}
        >
          <Plus className="size-4" aria-hidden="true" />
          {t("template_create")}
        </Button>
      </header>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#78928F]"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("template_search_placeholder")}
            aria-label={t("template_search_placeholder")}
            className="h-[42px] rounded-full pr-10 pl-10"
          />
          {searching && (
            <button
              type="button"
              className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 place-items-center rounded-full text-[#78928F] hover:bg-[#EDF8F6]"
              aria-label={t("search_clear")}
              title={t("search_clear")}
              onClick={() => setQuery("")}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        {!templatesQuery.isLoading && (
          <p className="text-[13px] text-[#5A7B79]" aria-live="polite">
            {searching
              ? t("template_found", { count: filtered.length })
              : t("template_count", { count: templates.length })}
          </p>
        )}
      </div>

      {templatesQuery.isLoading && <p className="mt-8 text-sm text-[#5A7B79]">{t("loading")}</p>}

      {!templatesQuery.isLoading && templates.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-[#B9DCD8] px-6 py-16 text-center">
          <BookOpenText className="mx-auto size-8 text-[#0D7773]" aria-hidden="true" />
          <p className="mt-4 font-semibold">{t("templates_empty")}</p>
          <Button
            className="mt-4 rounded-full"
            onClick={() => setEditor({ open: true, template: null })}
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("template_create")}
          </Button>
        </div>
      )}

      {!templatesQuery.isLoading && templates.length > 0 && filtered.length === 0 && (
        <div className="mt-8 rounded-[20px] border border-dashed border-[#B9DCD8] bg-[#F7FCFB] px-6 py-10 text-center">
          <p className="text-base font-semibold">{t("template_no_match_title")}</p>
          <p className="mt-1 text-sm text-[#5A7B79]">{t("template_no_match_hint")}</p>
        </div>
      )}

      {organization && filtered.length > 0 && (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              organizationId={organization.id}
              template={template}
              cohorts={cohortsQuery.cohorts ?? []}
              refresh={() => templatesQuery.mutate()}
              onEdit={(target) => setEditor({ open: true, template: target })}
            />
          ))}
        </div>
      )}

      {organization && (
        <TemplateEditorDialog
          organizationId={organization.id}
          open={editor.open}
          template={editor.template}
          onOpenChange={(open) => setEditor((current) => ({ ...current, open }))}
          onSaved={handleSaved}
        />
      )}

      <Dialog open={complete !== null} onOpenChange={(open) => !open && setComplete(null)}>
        <DialogContent className="w-[min(420px,92vw)] sm:max-w-none rounded-3xl border-0 bg-white p-6">
          <DialogHeader className="items-start text-left">
            <DialogTitle className="text-left text-xl font-semibold text-[#0D3036]">
              {complete?.kind === "draft"
                ? t("template_complete_draft_title")
                : t("template_complete_title")}
            </DialogTitle>
            <DialogDescription className="text-left text-sm text-[#5A7B79]">
              {complete?.kind === "draft"
                ? t("template_complete_draft_message", { name: complete.template.title })
                : complete?.kind === "updated"
                  ? t("template_complete_updated_message", { name: complete.template.title })
                  : t("template_complete_created_message", {
                      name: complete?.template.title ?? "",
                    })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-[#CDEBE8]"
              onClick={() => {
                setComplete(null);
                setEditor({ open: true, template: null });
              }}
            >
              {t("template_create_another")}
            </Button>
            <Button type="button" className="rounded-full" onClick={() => setComplete(null)}>
              {t("template_view_mine")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
