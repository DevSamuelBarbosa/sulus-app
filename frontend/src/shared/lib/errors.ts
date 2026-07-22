import { isAxiosError } from 'axios'
import type { ApiError } from '@/shared/types'

/**
 * Extracts a human-readable message from an API error for display in a
 * toast: the first Laravel validation error if there is one (most specific),
 * else the response's `message`, else a caller-provided fallback.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError<ApiError>(error)) {
    return fallback
  }

  const data = error.response?.data
  const firstValidationError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined

  return firstValidationError ?? data?.message ?? fallback
}
