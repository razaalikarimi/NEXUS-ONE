import { describe, it, expect } from 'vitest';
import { PulseOpsTelemetryService } from '../../services/pulseops/telemetry.js';

describe('PulseOps Telemetry & Incident Intelligence Service', () => {
  it('generates consistent fingerprints for identical error signatures regardless of dynamic UUIDs', () => {
    const error1 = 'Connection timed out for tenant 123e4567-e89b-12d3-a456-426614174000 at port 5432';
    const error2 = 'Connection timed out for tenant 987fcdeb-51a2-43f1-b456-426614174111 at port 5432';

    const stack1 = `Error: Connection timed out
      at Pool.connect (/app/node_modules/pg/lib/pool.js:142:15)
      at Query.run (/app/dist/services/db.js:28:9)`;
    const stack2 = `Error: Connection timed out
      at Pool.connect (/app/node_modules/pg/lib/pool.js:142:15)
      at Query.run (/app/dist/services/db.js:99:12)`;

    const fp1 = PulseOpsTelemetryService.generateFingerprint(error1, stack1);
    const fp2 = PulseOpsTelemetryService.generateFingerprint(error2, stack2);

    expect(fp1).toBe(fp2);
    expect(fp1).toHaveLength(16);
  });

  it('differentiates distinct exception classes into unique fingerprints', () => {
    const fpDB = PulseOpsTelemetryService.generateFingerprint('Connection refused on database host', 'at Pool.connect');
    const fpOOM = PulseOpsTelemetryService.generateFingerprint('JavaScript heap out of memory', 'at Array.push');

    expect(fpDB).not.toBe(fpOOM);
  });

  it('synthesizes accurate AI root cause assessments for database & connection timeouts', () => {
    const result = PulseOpsTelemetryService.synthesizeAIAssessment(
      'ETIMEDOUT: Connection pool connection timed out after 5000ms',
      'at Pool.acquireConnection',
    );

    expect(result.category).toBe('Network / Upstream Dependency Failure');
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.recommendedActions).toHaveLength(3);
    expect(result.recommendedActions[0]).toContain('VPC');
  });

  it('synthesizes accurate AI root cause assessments for out-of-memory exceptions', () => {
    const result = PulseOpsTelemetryService.synthesizeAIAssessment(
      'FatalError: JavaScript heap out of memory',
      'at JSON.parse (<anonymous>)',
    );

    expect(result.category).toBe('Resource Exhaustion (OOM)');
    expect(result.likelyRootCause).toContain('memory');
    expect(result.recommendedActions[1]).toContain('container memory limits');
  });

  it('synthesizes accurate AI root cause assessments for auth & permission violations', () => {
    const result = PulseOpsTelemetryService.synthesizeAIAssessment(
      'Unauthorized: JWT signature verification failed',
    );

    expect(result.category).toBe('Authentication & Security Policy Violation');
    expect(result.recommendedActions[0]).toContain('signing keys');
  });
});
