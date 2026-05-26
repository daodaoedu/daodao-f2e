"use client"

import { useMemo } from "react"
import { useSurveyWizard } from "../../hooks/use-survey-wizard"
import { cn } from "@daodao/ui/lib/utils"
import { Button } from "@daodao/ui/components/button"
import { Progress } from "@daodao/ui/components/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@daodao/ui/components/card"
import { SurveyPurposeStep } from "./SurveyPurposeStep"
import { SurveyAIGeneratedStep } from "./SurveyAIGeneratedStep"
import { SurveyEditStep } from "./SurveyEditStep"
import { SurveySettingsStep } from "./SurveySettingsStep"
import { SurveyPublishStep } from "./SurveyPublishStep"

type WizardProps = ReturnType<typeof useSurveyWizard>

const STEP_COMPONENTS: Record<string, React.ComponentType<{ wizard: WizardProps }>> = {
  purpose: SurveyPurposeStep,
  generate: SurveyAIGeneratedStep,
  edit: SurveyEditStep,
  settings: SurveySettingsStep,
  publish: SurveyPublishStep,
}

export function SurveyWizard() {
  const wizard = useSurveyWizard()
  const { currentStep, currentStepIndex, totalSteps, steps } = wizard

  const progress = useMemo(
    () => Math.round(((currentStepIndex + 1) / totalSteps) * 100),
    [currentStepIndex, totalSteps]
  )

  const StepComponent = STEP_COMPONENTS[currentStep]

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-background py-8 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            {steps.map((step, i) => (
              <span
                key={step.id}
                className={cn(i <= currentStepIndex ? "text-primary" : "text-muted-foreground/50")}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {steps[currentStepIndex]?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {StepComponent && <StepComponent wizard={wizard} />}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={wizard.prevStep} disabled={currentStep === "purpose"}>
              上一步
            </Button>
            <div className="flex gap-2">
              {currentStep !== "publish" && (
                <Button variant="outline" onClick={wizard.saveDraft}>儲存草稿</Button>
              )}
              {currentStep !== "publish" && (
                <Button onClick={wizard.nextStep}>下一步</Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
