import axios from 'axios'
import { USE_PREVIEW_MOCK } from '@/config'

export const TOKEN_KEY = 'daodao_admin_token'

const SAFE_METHODS = new Set(['get', 'head', 'options'])

/** 預覽模式下畫面顯示的是 mock ID，寫入請求若打到真實後端會誤改無關資料，一律擋下 */
export function isBlockedInPreviewMode(previewMock: boolean, method?: string) {
  return previewMock && !SAFE_METHODS.has((method ?? 'get').toLowerCase())
}

function attachInterceptors(client: ReturnType<typeof axios.create>) {
  client.interceptors.request.use((config) => {
    if (isBlockedInPreviewMode(USE_PREVIEW_MOCK, config.method)) {
      return Promise.reject(new Error('預覽模式（VITE_USE_PREVIEW_MOCK）不會寫入真實後端'))
    }
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      // 預覽模式沒有登入狀態，401 不可導回 /login，否則 /login → /dashboard → 401 會無限循環
      if (!USE_PREVIEW_MOCK && (err.response?.status === 401 || err.response?.status === 403)) {
        localStorage.removeItem(TOKEN_KEY)
        if (!window.location.pathname.endsWith('/login')) {
          window.location.href = `${import.meta.env.BASE_URL}login`
        }
      }
      return Promise.reject(err)
    },
  )
}

const apiClient = axios.create({ baseURL: '/', timeout: 30000, withCredentials: true })
attachInterceptors(apiClient)

// Playground / LLM calls can take up to 2 minutes
export const slowApiClient = axios.create({ baseURL: '/', timeout: 120000, withCredentials: true })
attachInterceptors(slowApiClient)

export default apiClient
