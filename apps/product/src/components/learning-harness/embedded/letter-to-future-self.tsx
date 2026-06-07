"use client";

import { useTranslations } from "@daodao/i18n";
import { getStorage, StorageEnum } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { Textarea } from "@daodao/ui/components/textarea";
import { formatISO } from "date-fns";
import { Check, Mail } from "lucide-react";
import { useCallback, useState } from "react";

interface HarnessLetterData {
  text: string;
  date: string;
}

const letterStorage = getStorage<HarnessLetterData>(StorageEnum.HarnessLetter);

export function LetterToFutureSelf() {
  const t = useTranslations("learning_harness");
  const [letter, setLetter] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    if (!letter.trim()) return;
    letterStorage.set({ text: letter, date: formatISO(Date.now()) });
    setSaved(true);
  }, [letter]);

  if (saved) {
    return (
      <div className="bg-[#E6FBF8] rounded-xl p-4 border border-[#C1ECFF] mt-4">
        <div className="flex items-center gap-2">
          <Check className="size-4 text-logo-cyan" />
          <span className="text-sm text-logo-cyan">{t("letter_saved")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-[#E6FBF8] rounded-xl p-4 border border-[#C1ECFF] mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="size-4 text-logo-cyan" />
        <p className="text-sm font-medium text-text-dark">{t("letter_title")}</p>
      </div>
      <Textarea
        value={letter}
        onChange={(e) => setLetter(e.target.value)}
        placeholder={t("letter_placeholder")}
        className="text-sm mb-3"
        rows={3}
      />
      <Button
        type="button"
        variant="orange"
        size="sm"
        className="text-xs w-full"
        onClick={handleSave}
        disabled={!letter.trim()}
      >
        封存
      </Button>
    </div>
  );
}
