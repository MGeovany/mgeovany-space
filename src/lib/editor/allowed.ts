export const EDITOR_ALLOWED_EMAILS = new Set(['marlongeo1999@gmail.com'])

export function isAllowedEditorEmail(email: string | null | undefined) {
  if (!email) return false
  return EDITOR_ALLOWED_EMAILS.has(email.toLowerCase())
}
