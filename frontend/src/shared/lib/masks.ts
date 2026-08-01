/**
 * Formatting helpers for masked inputs — see PhoneInput/CnpjInput/
 * DocumentInput. Each `sanitizeX` strips the raw value down to what's
 * actually stored (digits only, or uppercase alphanumeric for CNPJ), and
 * `formatX` applies the visual mask on top of that.
 */

export function sanitizePhoneDigits(input: string): string {
  return input.replace(/\D/g, '').slice(0, 11)
}

export function formatPhone(input: string): string {
  const digits = sanitizePhoneDigits(input)
  if (!digits) return ''

  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)
  const dddPart = digits.length > 2 ? `(${ddd}) ` : `(${ddd}`
  if (!rest) return dddPart

  // Adaptive split: an 8-digit landline is XXXX-XXXX, a 9-digit mobile is
  // XXXXX-XXXX — decided by how many digits have been typed so far.
  const splitAt = rest.length > 8 ? 5 : 4
  const prefix = rest.slice(0, splitAt)
  const suffix = rest.slice(splitAt)
  return suffix ? `${dddPart}${prefix}-${suffix}` : `${dddPart}${prefix}`
}

export function sanitizeCpfDigits(input: string): string {
  return input.replace(/\D/g, '').slice(0, 11)
}

export function formatCpf(input: string): string {
  const digits = sanitizeCpfDigits(input)
  let out = digits.slice(0, 3)
  if (digits.length > 3) out += '.' + digits.slice(3, 6)
  if (digits.length > 6) out += '.' + digits.slice(6, 9)
  if (digits.length > 9) out += '-' + digits.slice(9, 11)
  return out
}

// CNPJ accepts letters too: Receita Federal's upcoming alphanumeric CNPJ
// keeps the same XX.XXX.XXX/XXXX-XX layout, but the first 12 characters may
// be letters or digits — only the 2 trailing check digits stay numeric.
export function sanitizeCnpjChars(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14)
}

export function formatCnpj(input: string): string {
  const chars = sanitizeCnpjChars(input)
  let out = chars.slice(0, 2)
  if (chars.length > 2) out += '.' + chars.slice(2, 5)
  if (chars.length > 5) out += '.' + chars.slice(5, 8)
  if (chars.length > 8) out += '/' + chars.slice(8, 12)
  if (chars.length > 12) out += '-' + chars.slice(12, 14)
  return out
}

/**
 * A combined CPF-or-CNPJ "document" field (e.g. an employee can be pessoa
 * física or pessoa jurídica). Mode is decided by what's been typed so far:
 * once it's longer than a CPF or contains a letter, it's treated as a CNPJ.
 */
export function isCnpjDocument(raw: string): boolean {
  return raw.length > 11 || /[A-Z]/.test(raw)
}

export function sanitizeDocumentChars(input: string): string {
  return sanitizeCnpjChars(input)
}

export function formatDocument(input: string): string {
  const raw = sanitizeDocumentChars(input)
  return isCnpjDocument(raw) ? formatCnpj(raw) : formatCpf(raw)
}
