import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface QrScannerProps {
  active: boolean
  onScan: (text: string) => void
}

const REGION_ID = 'benefits-qr-scanner'

/**
 * `navigator.mediaDevices` isn't exposed at all (not just permission-denied)
 * outside a secure context — HTTPS or `localhost`. On a plain-HTTP LAN
 * address, html5-qrcode throws synchronously when it touches this, which
 * without a guard crashes past this component's local .catch() entirely.
 */
function isCameraSupported(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
}

/**
 * Thin wrapper around html5-qrcode's camera scanner. Stops itself after the
 * first successful read — the parent decides whether/when to restart it
 * (`active`), since a token is single-use and shouldn't be re-scanned into a
 * second validation while the confirmation card is showing.
 */
export function QrScanner({ active, onScan }: QrScannerProps) {
  const onScanRef = useRef(onScan)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    if (!active) {
      return
    }

    if (!isCameraSupported()) {
      setTimeout(() => setUnavailable(true), 0)
      return
    }

    let scanner: Html5Qrcode
    let stopped = false

    try {
      scanner = new Html5Qrcode(REGION_ID)
    } catch {
      setTimeout(() => setUnavailable(true), 0)
      return
    }

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          if (!stopped) {
            stopped = true
            onScanRef.current(decodedText)
            void scanner.stop().catch(() => {})
          }
        },
        () => {
          // Per-frame decode miss — expected while the user is framing the code.
        },
      )
      .then(() => setUnavailable(false))
      .catch(() => {
        // Camera unavailable or permission denied.
        setUnavailable(true)
      })

    return () => {
      stopped = true
      void scanner.stop().catch(() => {})
    }
  }, [active])

  if (unavailable) {
    return (
      <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
        Câmera indisponível neste dispositivo ou conexão — use o código manual abaixo.
      </p>
    )
  }

  return <div id={REGION_ID} className="mx-auto w-full max-w-sm overflow-hidden rounded-lg" />
}
