import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/shared/types'

const TOKEN_KEY = 'sulus.token'

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
}

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
})

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      tokenStorage.clear()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    // The tenant (company/establishment) can be deactivated or deleted
    // mid-session — the backend re-checks this on every request (see
    // EnsureRole::hasActiveProfile), not just at login, so an already-issued
    // token can start failing this way at any point. Kick the user out the
    // same way LoginPage already handles it for a fresh login attempt.
    if (error.response?.status === 403 && error.response.data?.code === 'account_inactive') {
      tokenStorage.clear()
      if (window.location.pathname !== '/conta-desativada') {
        window.location.assign('/conta-desativada')
      }
    }

    return Promise.reject(error)
  },
)
