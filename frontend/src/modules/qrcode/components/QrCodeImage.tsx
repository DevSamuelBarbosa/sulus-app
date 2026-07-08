import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QrCodeImageProps {
  value: string
  size?: number
}

/** Renders an opaque token as a scannable QR code (no PII ever encoded in it). */
export function QrCodeImage({ value, size = 260 }: QrCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    QRCode.toDataURL(value, { width: size, margin: 1 }).then((url) => {
      if (!cancelled) {
        setDataUrl(url)
      }
    })

    return () => {
      cancelled = true
    }
  }, [value, size])

  if (!dataUrl) {
    return (
      <div className="grid place-items-center text-sm text-muted-foreground" style={{ width: size, height: size }}>
        Gerando…
      </div>
    )
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code do benefício"
      width={size}
      height={size}
      className="rounded-lg"
    />
  )
}
