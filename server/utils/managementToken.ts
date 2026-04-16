import { isUuid } from './submitUtils'
import { generateOpaqueToken, sha256Hex } from './crypto'

const MANAGEMENT_TOKEN_RE = /^[A-Za-z0-9_-]{32,128}$/

export function generateManagementToken(): string {
  return generateOpaqueToken(32)
}

export async function hashManagementToken(token: string): Promise<string> {
  return sha256Hex(`wdtm:management:${token}`)
}

export function isSupportedManagementToken(token: string): boolean {
  return MANAGEMENT_TOKEN_RE.test(token) || isUuid(token)
}
