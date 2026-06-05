"use client";

import { Input } from "@daodao/ui/components/input";
import { Label } from "@daodao/ui/components/label";
import { Switch } from "@daodao/ui/components/switch";
import type { useSurveyWizard } from "../../hooks/use-survey-wizard";

export function SurveySettingsStep({ wizard }: { wizard: ReturnType<typeof useSurveyWizard> }) {
  const { state, updateConfig } = wizard;
  const config = state.survey.config ?? {};

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Label>匿名填寫</Label>
          <p className="text-xs text-muted-foreground">不記錄填寫者身份</p>
        </div>
        <Switch
          checked={config.isAnonymous ?? false}
          onCheckedChange={(v: boolean) => updateConfig({ isAnonymous: v })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>顯示進度條</Label>
          <p className="text-xs text-muted-foreground">填寫時顯示完成進度</p>
        </div>
        <Switch
          checked={config.showProgressBar ?? true}
          onCheckedChange={(v: boolean) => updateConfig({ showProgressBar: v })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxResponses">最大回應數（留空不限制）</Label>
        <Input
          id="maxResponses"
          type="number"
          min={1}
          placeholder="不限制"
          value={config.maxResponses ?? ""}
          onChange={(e) =>
            updateConfig({ maxResponses: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">截止日期（選填）</Label>
        <Input
          id="deadline"
          type="datetime-local"
          value={config.deadlineAt ?? ""}
          onChange={(e) => updateConfig({ deadlineAt: e.target.value || null })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="successMsg">感謝訊息</Label>
        <Input
          id="successMsg"
          value={config.successMessage ?? "感謝你的回應！"}
          onChange={(e) => updateConfig({ successMessage: e.target.value })}
        />
      </div>
    </div>
  );
}
