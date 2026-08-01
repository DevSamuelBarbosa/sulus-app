import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { formatDocument, sanitizeDocumentChars } from '@/shared/lib/masks'

interface DocumentInputProps extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value: string
  onChange: (raw: string) => void
}

/**
 * CPF-or-CNPJ combo field — value/onChange carry the raw uppercase
 * alphanumeric characters, the mask (and whether it's read as CPF or CNPJ)
 * is purely visual and adapts as the value grows. See formatDocument.
 */
export function DocumentInput({ value, onChange, ...props }: DocumentInputProps) {
  return (
    <Input
      {...props}
      value={formatDocument(value)}
      onChange={(e) => onChange(sanitizeDocumentChars(e.target.value))}
    />
  )
}
