"use client";

import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { Brain, Check } from "lucide-react";
import { useCallback, useState } from "react";

const STORAGE_KEY = "harness_persona";

interface PersonaData {
  why: string;
  style: string;
  time: string;
}

export function PersonaQuickInit() {
  const t = useTranslations("learning_harness");
  const [step, setStep] = useState(0);
  const [data, setData] = useState<PersonaData>({ why: "", style: "", time: "" });
  const [saved, setSaved] = useState(false);

  const styles = t("persona_q2_options").split(",");

  const handleSave = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSaved(true);
  }, [data]);

  if (saved) {
    return (
      <div className="bg-[#E6FBF8] rounded-xl p-4 border border-[#C1ECFF] mb-4">
        <div className="flex items-center gap-2">
          <Check className="size-4 text-logo-cyan" />
          <span className="text-sm text-logo-cyan">{t("persona_saved")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-[#C1ECFF] mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="size-4 text-logo-cyan" />
        <p className="text-sm font-medium text-text-dark">{t("persona_title")}</p>
      </div>
      <p className="text-xs text-light-gray mb-4">{t("persona_subtitle")}</p>

      {step === 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-dark">{t("persona_q1")}</p>
          <Textarea
            value={data.why}
            onChange={(e) => setData((d) => ({ ...d, why: e.target.value }))}
            placeholder="例如：想在工作中用到..."
            className="text-sm"
            rows={2}
          />
          <Button
            type="button"
            variant="orange"
            size="sm"
            className="text-xs w-full"
            onClick={() => setStep(1)}
            disabled={!data.why.trim()}
          >
            下一題
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <p className="text-xs text-text-dark">{t("persona_q2")}</p>
          <div className="flex flex-wrap gap-2">
            {styles.map((s) => (
              <button key={s} type="button" onClick={() => setData((d) => ({ ...d, style: s }))}>
                <Badge
                  variant={data.style === s ? "default" : "very-light-blue"}
                  size="sm"
                  className={cn(
                    "text-xs cursor-pointer",
                    data.style === s && "bg-logo-cyan text-white"
                  )}
                >
                  {s}
                </Badge>
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="orange"
            size="sm"
            className="text-xs w-full"
            onClick={() => setStep(2)}
            disabled={!data.style}
          >
            下一題
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <p className="text-xs text-text-dark">{t("persona_q3")}</p>
          <div className="flex flex-wrap gap-2">
            {["早上", "中午", "下午", "晚上"].map((time) => (
              <button key={time} type="button" onClick={() => setData((d) => ({ ...d, time }))}>
                <Badge
                  variant={data.time === time ? "default" : "very-light-blue"}
                  size="sm"
                  className={cn(
                    "text-xs cursor-pointer",
                    data.time === time && "bg-logo-cyan text-white"
                  )}
                >
                  {time}
                </Badge>
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="orange"
            size="sm"
            className="text-xs w-full"
            onClick={handleSave}
            disabled={!data.time}
          >
            完成
          </Button>
        </div>
      )}
    </div>
  );
}
