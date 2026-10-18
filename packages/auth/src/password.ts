// Password hashing using bcrypt

import bcrypt from 'bcrypt';

const DEFAULT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt.
 * Never store plaintext passwords.
 */
export async function hashPassword(
  password: string,
  rounds: number = DEFAULT_ROUNDS,
): Promise<string> {
  return bcrypt.hash(password, rounds);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 * Returns true if the password matches.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
