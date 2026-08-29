"use client";

import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { Label } from "@daodao/ui/components/label";
import { toast } from "@daodao/ui/components/sonner";
import { useState } from "react";
import type { SpaceCreateKind } from "./space-fab";

interface SpaceCreateSheetProps {
  kind: Exclude<SpaceCreateKind, "practice"> | null;
  onClose: () => void;
}

/**
 * The create panel for 活動課程 / 共同挑戰 (FRD 3.3). The actual backend
 * write flow is out of scope for v0.1 (FRD 2.2), so submitting only shows a
 * coming-soon toast.
 */
export const SpaceCreateSheet = ({ kind, onClose }: SpaceCreateSheetProps) => {
  const t = useTranslations("space");
  const [name, setName] = useState("");

  const isCourse = kind === "course";

  return (
    <Dialog
      open={kind !== null}
      onOpenChange={(open) => {
        if (!open) {
          setName("");
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[420px] rounded-[28px]">
        <DialogHeader>
          <p className="text-xs font-medium text-primary-base">
            {isCourse ? t("fab_course") : t("fab_challenge")}
          </p>
          <DialogTitle className="text-xl text-text-dark">
            {isCourse ? t("sheet_course_title") : t("sheet_challenge_title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-dark/60">
            {isCourse ? t("sheet_course_hint") : t("sheet_challenge_hint")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="space-create-name" className="text-sm text-text-dark">
            {t("sheet_name_label")}
          </Label>
          <Input
            id="space-create-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setName("");
              onClose();
            }}
          >
            {t("sheet_cancel")}
          </Button>
          <Button
            className="rounded-full"
            disabled={name.trim().length === 0}
            onClick={() => {
              toast.info(t("sheet_coming_soon"));
              setName("");
              onClose();
            }}
          >
            {t("sheet_submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
