// Cryptographic token generation for sessions, invitations, and resets

import { randomBytes } from 'node:crypto';

/**
 * Generate a cryptographically secure random token.
 * @param length - Number of bytes (output will be 2x length in hex)
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a session token (64 hex chars = 32 bytes of entropy).
 */
export function generateSessionToken(): string {
  return generateToken(32);
}

/**
 * Generate a shorter token for email verification or password resets.
 */
export function generateVerificationToken(): string {
  return generateToken(24);
}

/**
 * Generate an API key prefix for display purposes.
 * Format: nx_<8 random chars>
 */
export function generateApiKeyPrefix(): string {
  return `nx_${randomBytes(4).toString('hex')}`;
}
