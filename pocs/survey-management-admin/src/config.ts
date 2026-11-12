const DEFAULT_SURVEY_BASE = 'https://app.daodao.so/survey/r'
const rawSurveyBase = import.meta.env.VITE_SURVEY_PUBLIC_BASE ?? DEFAULT_SURVEY_BASE
const APP_BASE = rawSurveyBase.replace(/\/survey\/r\/?$/, '').replace(/\/$/, '')

export const APP_BASE_URL = APP_BASE || 'https://app.daodao.so'

export const SURVEY_PUBLIC_BASE = `${APP_BASE_URL}/survey/r`

export const getPracticePublicUrl = (practiceId: string) =>
  `${APP_BASE_URL}/practices/${practiceId}`

/**
 * 本機預覽模式：明確設定 VITE_USE_PREVIEW_MOCK=true 才啟用，且僅限 dev build。
 * 啟用後略過登入並以前端 mock 取代 email 模板／dashboard／共同挑戰 API；
 * 預設關閉，一般 `pnpm dev` 仍走真實登入與後端。
 */
export function isPreviewMockEnabled(env: { DEV: boolean; VITE_USE_PREVIEW_MOCK?: string }) {
  return env.DEV && env.VITE_USE_PREVIEW_MOCK === 'true'
}

export const USE_PREVIEW_MOCK = isPreviewMockEnabled(import.meta.env)
