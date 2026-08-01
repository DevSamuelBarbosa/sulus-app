import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { formatPhone, sanitizePhoneDigits } from '@/shared/lib/masks'

interface PhoneInputProps extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> {
  value: string
  onChange: (digits: string) => void
}

/** Value/onChange carry raw digits only — the mask is purely visual. */
export function PhoneInput({ value, onChange, ...props }: PhoneInputProps) {
  return (
    <Input
      {...props}
      type="tel"
      inputMode="numeric"
      value={formatPhone(value)}
      onChange={(e) => onChange(sanitizePhoneDigits(e.target.value))}
    />
  )
}
