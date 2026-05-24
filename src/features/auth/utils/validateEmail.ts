import { env } from '@/config/env'

/**
 * Valida que el correo pertenezca al dominio institucional UdeA.
 * Por defecto: @udea.edu.co (configurable vía VITE_ALLOWED_EMAIL_DOMAIN).
 */
export function isInstitutionalEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const domain = env.allowedEmailDomain.toLowerCase()
  return email.toLowerCase().endsWith(`@${domain}`)
}

export function getAllowedDomainLabel(): string {
  return `@${env.allowedEmailDomain}`
}
