import { createError } from 'h3'
import { isSupportedManagementToken } from '../managementToken'

type ErrorField = 'message' | 'statusMessage'

export function requireManagementToken(
  rawToken: unknown,
  options: {
    missingMessage: string
    invalidMessage: string
    errorField: ErrorField
  }
): string {
  if (typeof rawToken !== 'string' || !rawToken.trim()) {
    throw createError({
      statusCode: 400,
      [options.errorField]: options.missingMessage,
    } as any)
  }

  const token = rawToken.trim()
  if (!isSupportedManagementToken(token)) {
    throw createError({
      statusCode: 400,
      [options.errorField]: options.invalidMessage,
    } as any)
  }

  return token
}
