import { client, getApiBaseUrl } from '../client';

export interface OnboardingFlowStep {
  id: number;
  questionText: string;
  questionType: 'single' | 'multi' | 'text';
  options: string[];
  fieldKey?: string;
  sortOrder: number;
}

export interface ActiveOnboardingFlow {
  id: number;
  name: string;
  steps: OnboardingFlowStep[];
}

/**
 * 取得目前啟用的 Onboarding 流程（公開，不需登入）
 */
export async function getActiveOnboardingFlow(): Promise<ActiveOnboardingFlow | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/onboarding/flows/active`);
    if (!res.ok) return null;
    const json = await res.json() as { data: ActiveOnboardingFlow | null };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/**
 * 記錄用戶對 Onboarding 流程步驟的回答（需登入）
 */
export async function submitOnboardingFlowResponse(
  flowId: number,
  stepId: number,
  answer: string[],
): Promise<void> {
  // Uses openapi-fetch client which has auth middleware
  await (client as any).POST(`/api/v1/onboarding/flows/${flowId}/responses`, {
    body: { stepId, answer },
  });
}
