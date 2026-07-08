import { useCallback, useEffect, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { qrcodeApi } from '@/modules/qrcode/api/qrcode.api'
import type { ApiError } from '@/shared/types'
import type { QrTokenStatus } from '@/modules/qrcode/types'

/**
 * Drives the employee's QR screen: generates a token on mount, ticks down a
 * per-second countdown, and silently generates a fresh one the instant the
 * previous one expires — so the code on screen is always valid without the
 * employee having to do anything.
 *
 * It also polls `/qrcode/status/{token}` so the screen finds out once the
 * establishment has redeemed it, instead of just refreshing forever with no
 * feedback. Once status is 'used' both the countdown and the poll stop —
 * it's a terminal state until the employee explicitly generates a new code.
 *
 * On failure, the countdown loop pauses (hasErrorRef) instead of retrying
 * every second: expiresAtRef is left stale after an error, so an unguarded
 * loop would treat it as permanently expired and hammer the endpoint. It
 * only resumes when the user retries via `regenerate`.
 */
export function useQrToken() {
  const [token, setToken] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<QrTokenStatus>('pending')
  const expiresAtRef = useRef(0)
  const generatingRef = useRef(false)
  const hasErrorRef = useRef(false)

  const generate = useCallback(async () => {
    if (generatingRef.current) {
      return
    }
    generatingRef.current = true
    setError(null)
    hasErrorRef.current = false

    try {
      const result = await qrcodeApi.generate()
      expiresAtRef.current = Date.now() + result.expires_in * 1000
      setToken(result.token)
      setStatus('pending')
      setSecondsLeft(result.expires_in)
    } catch (err) {
      hasErrorRef.current = true
      setError(
        (isAxiosError<ApiError>(err) ? err.response?.data.message : undefined) ??
          'Não foi possível gerar o QR Code. Verifique sua conexão.',
      )
    } finally {
      generatingRef.current = false
    }
  }, [])

  useEffect(() => {
    const id = setTimeout(() => void generate(), 0)
    return () => clearTimeout(id)
  }, [generate])

  useEffect(() => {
    if (status === 'used') {
      return
    }

    const interval = setInterval(() => {
      if (hasErrorRef.current) {
        return
      }

      const remaining = Math.max(0, Math.ceil((expiresAtRef.current - Date.now()) / 1000))
      setSecondsLeft(remaining)

      if (remaining <= 0) {
        void generate()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [generate, status])

  useEffect(() => {
    if (!token || status === 'used') {
      return
    }

    const interval = setInterval(() => {
      void qrcodeApi
        .status(token)
        .then((result) => setStatus(result.status))
        .catch(() => {})
    }, 2000)

    return () => clearInterval(interval)
  }, [token, status])

  return {
    token,
    secondsLeft,
    isLoading: token === null && !error,
    error,
    status,
    regenerate: generate,
  }
}
