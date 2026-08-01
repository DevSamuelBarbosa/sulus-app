import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { formatCnpj, sanitizeCnpjChars } from '@/shared/lib/masks'

interface CnpjInputProps extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value: string
  onChange: (chars: string) => void
}

/**
 * Value/onChange carry the raw uppercase alphanumeric characters — the mask
 * is purely visual. Letters are allowed ahead of Receita Federal's upcoming
 * alphanumeric CNPJ (see sanitizeCnpjChars).
 */
export function CnpjInput({ value, onChange, ...props }: CnpjInputProps) {
  return (
    <Input
      {...props}
      value={formatCnpj(value)}
      onChange={(e) => onChange(sanitizeCnpjChars(e.target.value))}
    />
  )
}
