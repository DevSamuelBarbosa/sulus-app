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
    // Tracks whether start() actually resolved, i.e. the scanner is really
    // running. Without this guard, calling stop() while start() is still
    // pending — e.g. React StrictMode's mount→cleanup→mount dance racing a
    // slow/absent desktop camera — throws synchronously ("Cannot stop,
    // scanner is not running or paused"), which isn't a rejected promise
    // and so isn't caught by a plain .catch(), crashing past this
    // component entirely.
    let started = false

    const safeStop = () => {
      try {
        return scanner.stop().catch(() => {})
      } catch {
        return Promise.resolve()
      }
    }

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
            void safeStop()
          }
        },
        () => {
          // Per-frame decode miss — expected while the user is framing the code.
        },
      )
      .then(() => {
        if (stopped) {
          // Cleanup already ran before start() resolved — release the
          // camera immediately instead of leaving it running orphaned.
          void safeStop()
          return
        }
        started = true
        setUnavailable(false)
      })
      .catch(() => {
        // Camera unavailable, no device, or permission denied — e.g. most
        // desktops reaching this screen instead of a phone.
        if (!stopped) {
          setUnavailable(true)
        }
      })

    return () => {
      stopped = true
      if (started) {
        void safeStop()
      }
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
