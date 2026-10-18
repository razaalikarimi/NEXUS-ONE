import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  createOrgSchema,
  slugSchema,
  inviteMemberSchema,
} from '../src/index.js';

describe('@nexus-one/validators', () => {
  describe('registerSchema', () => {
    it('validates correct registration payloads', () => {
      const valid = {
        email: 'developer@nexusone.dev',
        password: 'SecurePassword123!',
        name: 'Nexus Developer',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      const invalid = {
        email: 'invalid-email',
        password: 'SecurePassword123!',
        name: 'Nexus Developer',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects weak passwords', () => {
      const weak = {
        email: 'test@nexusone.dev',
        password: 'short',
        name: 'Nexus User',
      };
      const result = registerSchema.safeParse(weak);
      expect(result.success).toBe(false);
    });
  });

  describe('slugSchema', () => {
    it('accepts alphanumeric lowercase with hyphens', () => {
      expect(slugSchema.safeParse('acme-corp').success).toBe(true);
      expect(slugSchema.safeParse('starlight-labs-2').success).toBe(true);
    });

    it('rejects uppercase, spaces, and special symbols', () => {
      expect(slugSchema.safeParse('Acme-Corp').success).toBe(false);
      expect(slugSchema.safeParse('acme corp').success).toBe(false);
      expect(slugSchema.safeParse('acme_corp').success).toBe(false);
    });
  });

  describe('inviteMemberSchema', () => {
    it('validates supported roles', () => {
      expect(
        inviteMemberSchema.safeParse({ email: 'user@nexus.io', role: 'admin' }).success,
      ).toBe(true);
      expect(
        inviteMemberSchema.safeParse({ email: 'user@nexus.io', role: 'invalid_role' }).success,
      ).toBe(false);
    });
  });
});
