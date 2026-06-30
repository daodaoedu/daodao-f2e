"use client";

import { useTranslations } from "@daodao/i18n";
import type { UseFormReturn } from "react-hook-form";
import { BgRadialAnimation } from "@/components/layout/bg-radial-animation";
import {
  ExecutionDurationCard,
  ExecutionTimingCard,
  PracticeOverviewCard,
  ResourceCard,
} from "@/components/practice";
import {
  type PrivacyStatus,
  PrivacyStatusSelector,
} from "@/components/practice/shared/privacy-status-selector";
import type { ManualPracticeFormValues } from "../schema";

interface Step5Props {
  form: UseFormReturn<ManualPracticeFormValues>;
  privacyStatus?: PrivacyStatus;
  onPrivacyStatusChange?: (value: PrivacyStatus) => void;
}

export const Step5 = ({ form, privacyStatus, onPrivacyStatusChange }: Step5Props) => {
  const t = useTranslations("app_product");
  const formValues = form.getValues();
  const {
    name,
    actionDescription,
    durationMinutes,
    frequency,
    durationDays,
    startDate,
    executionTiming,
    customTiming,
    tags,
    resources,
  } = formValues;

  return (
    <div>
      {/* Header Section */}
      <div className="text-center py-4">
        <p className="text-sm md:text-base text-text-dark mb-1 md:mb-0.5">
          {t("practice_created_is")}
        </p>
        <h1 className="text-2xl md:text-4xl font-medium text-text-dark relative">
          {name}
          <BgRadialAnimation className="-translate-y-[calc(50%-44px)]" variant="notebook" />
        </h1>
      </div>

      <div className="py-4">
        {/* Practice Overview Card */}
        <PracticeOverviewCard
          actionDescription={actionDescription}
          frequency={frequency}
          durationMinutes={durationMinutes}
          tags={tags}
        />

        {/* Execution Timing and Duration Cards */}
        <div className="grid grid-cols-2 gap-4 mb-3.5">
          <ExecutionTimingCard executionTiming={executionTiming} customTiming={customTiming} />
          <ExecutionDurationCard durationDays={durationDays} startDate={startDate} />
        </div>
      </div>

      {/* Resources Section */}
      {Array.isArray(resources) && resources.length > 0 && (
        <div>
          <h3 className="text-sm text-center font-medium text-text-dark mt-4 mb-3.5">
            {t("practice_resource_intro")}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={{
                  id: resource.id,
                  name: resource.name,
                  url: resource.url,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Privacy Status */}
      <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
        <PrivacyStatusSelector
          value={privacyStatus ?? "private"}
          onChange={onPrivacyStatusChange ?? (() => {})}
        />
      </div>
    </div>
  );
};
