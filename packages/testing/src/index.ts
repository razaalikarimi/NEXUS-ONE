// ============================================================
// @nexus-one/testing — Test Utilities and Factories
// ============================================================
// Shared test helpers, deterministic factories, and fixtures.
// All test data is clearly labelled as synthetic.
// ============================================================

/**
 * Create a test user object with deterministic defaults.
 * All fields can be overridden.
 */
export function createTestUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-user-001',
    email: 'test@nexusone.dev',
    name: 'Test User',
    passwordHash: '$2b$12$placeholder.hash.not.real',
    avatar: null,
    emailVerified: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

/**
 * Create a test organization object.
 */
export function createTestOrg(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-org-001',
    name: 'Test Organization',
    slug: 'test-org',
    plan: 'free',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

/**
 * Create a test workspace object.
 */
export function createTestWorkspace(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-ws-001',
    orgId: 'test-org-001',
    name: 'Default Workspace',
    slug: 'default',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

/**
 * Generate a unique ID for tests (deterministic with prefix).
 */
let testIdCounter = 0;
export function nextTestId(prefix = 'test'): string {
  testIdCounter++;
  return `${prefix}-${String(testIdCounter).padStart(6, '0')}`;
}

/**
 * Reset test ID counter between test suites.
 */
export function resetTestIds(): void {
  testIdCounter = 0;
}

/**
 * Wait for a specified duration (useful for timing tests).
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
