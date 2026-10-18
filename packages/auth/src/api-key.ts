// ============================================================
// @nexus-one/auth — API Key Generation & Hashing
// ============================================================

import { createHash, randomBytes } from 'node:crypto';

export interface GeneratedApiKey {
  rawKey: string;
  hashedKey: string;
  prefix: string;
}

/**
 * Generates an API key with format `nx_<prefix>_<secret>`
 * Computes SHA-256 hash for database storage.
 */
export function generateApiKey(): GeneratedApiKey {
  const prefixId = randomBytes(4).toString('hex');
  const secret = randomBytes(24).toString('hex');
  const prefix = `nx_${prefixId}`;
  const rawKey = `${prefix}_${secret}`;
  const hashedKey = hashApiKey(rawKey);

  return {
    rawKey,
    hashedKey,
    prefix,
  };
}

/**
 * Computes deterministic SHA-256 hash of raw API key for secure lookup.
 */
export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}
