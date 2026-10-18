import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateSessionToken,
  generateApiKey,
  hashApiKey,
  hasPermission,
  isRoleAtLeast,
} from '../src/index.js';

describe('@nexus-one/auth', () => {
  describe('password hashing', () => {
    it('hashes passwords deterministically and verifies match', async () => {
      const plaintext = 'NexusPassword123!';
      const hash = await hashPassword(plaintext, 8); // faster rounds for tests

      expect(hash).not.toEqual(plaintext);
      expect(hash).toMatch(/^\$2[aby]\$/);

      const isValid = await verifyPassword(plaintext, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('WrongPassword!', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('tokens', () => {
    it('generates secure random hex tokens', () => {
      const token1 = generateToken(16);
      const token2 = generateToken(16);

      expect(token1).toHaveLength(32);
      expect(token2).toHaveLength(32);
      expect(token1).not.toEqual(token2);
    });

    it('generates session token with correct length', () => {
      const sessionToken = generateSessionToken();
      expect(sessionToken).toHaveLength(64);
    });
  });

  describe('api keys', () => {
    it('generates valid API key and matching hash', () => {
      const { rawKey, hashedKey, prefix } = generateApiKey();

      expect(prefix).toMatch(/^nx_[a-f0-9]{8}$/);
      expect(rawKey.startsWith(`${prefix}_`)).toBe(true);
      expect(hashApiKey(rawKey)).toEqual(hashedKey);
    });
  });

  describe('RBAC permissions', () => {
    it('enforces role hierarchy', () => {
      expect(isRoleAtLeast('owner', 'admin')).toBe(true);
      expect(isRoleAtLeast('admin', 'admin')).toBe(true);
      expect(isRoleAtLeast('member', 'admin')).toBe(false);
      expect(isRoleAtLeast('viewer', 'member')).toBe(false);
    });

    it('checks permissions accurately per role', () => {
      expect(hasPermission('owner', 'org:delete')).toBe(true);
      expect(hasPermission('admin', 'org:delete')).toBe(false);
      expect(hasPermission('admin', 'member:invite')).toBe(true);
      expect(hasPermission('member', 'member:invite')).toBe(false);
      expect(hasPermission('member', 'workspace:read')).toBe(true);
      expect(hasPermission('viewer', 'workspace:create')).toBe(false);
      expect(hasPermission('viewer', 'workspace:read')).toBe(true);
    });
  });
});
