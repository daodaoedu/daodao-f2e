"use client";

import { getCohortTemplateResources, saveCohortTemplateResources } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "./confirm-dialog";
import { LIGHTHOUSE_SCOPE } from "./lighthouse-scope";
import { type TemplateResourceDraft, TemplateResourceEditor } from "./template-resource-editor";

type Props = {
  organizationId: number;
  templateId: number;
  cohortId: number;
  cohortName: string;
  onClose: () => void;
};

export function CohortResourceDialog({
  organizationId,
  templateId,
  cohortId,
  cohortName,
  onClose,
}: Props) {
  const t = useTranslations("lighthouse");
  const [resources, setResources] = useState<TemplateResourceDraft[]>([]);
  const [savedResources, setSavedResources] = useState("[]");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [editing, setEditing] = useState(false);
  const [pendingInput, setPendingInput] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const hasChanges = JSON.stringify(resources) !== savedResources;

  function requestClose() {
    if (saving) return;
    if (hasChanges || editing || pendingInput) setConfirmClose(true);
    else onClose();
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    void getCohortTemplateResources(organizationId, templateId, cohortId)
      .then((response) => {
        if (!active) return;
        if (response.error || !response.data) {
          setFailed(true);
          setLoading(false);
          return;
        }
        const loadedResources = response.data.data.map(({ id, name, url, relevantDate }) => ({
          key: String(id),
          name,
          url,
          relevantDate,
        }));
        setResources(loadedResources);
        setSavedResources(JSON.stringify(loadedResources));
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setFailed(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [organizationId, templateId, cohortId, retry]);

  async function save() {
    if (
      resources.some((item) => !item.name.trim() || (item.url && !/^https?:\/\//i.test(item.url)))
    ) {
      toast.error(t("cohort_resources_invalid"));
      return;
    }
    setSaving(true);
    try {
      const response = await saveCohortTemplateResources(
        organizationId,
        templateId,
        cohortId,
        resources.map(({ name, url, relevantDate }) => ({
          name: name.trim(),
          url: url.trim(),
          relevantDate: relevantDate ?? null,
        }))
      );
      if (response.error || !response.data) {
        toast.error(t("save_failed"));
        return;
      }
      const saved = response.data.data.map(({ id, name, url, relevantDate }) => ({
        key: String(id),
        name,
        url,
        relevantDate,
      }));
      setResources(saved);
      setSavedResources(JSON.stringify(saved));
      toast.success(t("cohort_resources_saved"));
    } catch {
      toast.error(t("save_failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <DialogContent
          className={`w-[min(680px,94vw)] sm:max-w-none rounded-3xl bg-white px-6 pb-6 gap-4 ${LIGHTHOUSE_SCOPE}`}
        >
          <DialogHeader className="items-start text-left">
            <DialogTitle className="pr-12 text-left">
              {t("cohort_resources_title", { cohort: cohortName })}
            </DialogTitle>
            <DialogDescription>{t("cohort_resources_scope")}</DialogDescription>
          </DialogHeader>
          {loading && <p>{t("cohort_resources_loading")}</p>}
          {failed && (
            <div>
              <p role="alert">{t("cohort_resources_load_failed")}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRetry((value) => value + 1)}
              >
                {t("cohort_resources_retry")}
              </Button>
            </div>
          )}
          {!loading && !failed && (
            <fieldset disabled={saving} className="min-w-0 max-h-[50vh] overflow-y-auto">
              <TemplateResourceEditor
                resources={resources}
                onChange={setResources}
                showRelevantDate
                maxResources={50}
                onEditingChange={setEditing}
                onPendingInputChange={setPendingInput}
              />
            </fieldset>
          )}
          {!loading && !failed && hasChanges && (
            <output className="text-sm text-[#A05C00]">{t("cohort_resources_unsaved")}</output>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={saving} onClick={requestClose}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              disabled={loading || failed || saving || !hasChanges || editing || pendingInput}
              onClick={() => void save()}
            >
              {t("save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmClose}
        title={t("cohort_resources_discard_title")}
        description={t("cohort_resources_discard_description")}
        confirmLabel={t("cohort_resources_discard")}
        cancelLabel={t("cohort_resources_keep_editing")}
        onConfirm={onClose}
        onOpenChange={setConfirmClose}
      />
    </>
  );
}
