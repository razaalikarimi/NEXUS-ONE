// ============================================================
// SentinelX Unit Tests — Behavioral Risk Scoring & Geovelocity
// ============================================================

import { describe, it, expect } from 'vitest';
import { sentinelXEngine, type RuleDefinition } from '../../services/sentinelx/engine.js';

describe('SentinelXEngine — Geovelocity Distance Math', () => {
  it('calculates zero distance for identical origin and destination', () => {
    const dist = sentinelXEngine.calculateDistanceKm('US', 'US');
    expect(dist).toBe(0);
  });

  it('calculates realistic trans-continental distance between US and Romania', () => {
    const dist = sentinelXEngine.calculateDistanceKm('US', 'RO');
    expect(dist).toBeGreaterThan(8000);
    expect(dist).toBeLessThan(11000);
  });
});

describe('SentinelXEngine — Rule Evaluation & Policy Enforcement', () => {
  const testRules: RuleDefinition[] = [
    {
      id: 'rule-geo-1',
      name: 'Supersonic Impossible Travel',
      ruleType: 'geovelocity',
      conditions: {},
      scoreImpact: 50,
      actionTrigger: 'block',
      isActive: true,
    },
    {
      id: 'rule-vel-2',
      name: 'Transaction Velocity Spike',
      ruleType: 'velocity',
      conditions: { maxEventsPerWindow: 5 },
      scoreImpact: 35,
      actionTrigger: 'challenge_2fa',
      isActive: true,
    },
    {
      id: 'rule-amt-3',
      name: 'High-Value Transfer Outlier',
      ruleType: 'high_amount',
      conditions: { amountThreshold: 2500 },
      scoreImpact: 25,
      actionTrigger: 'flag_review',
      isActive: true,
    },
    {
      id: 'rule-ip-4',
      name: 'Tor Anonymizer Exit Node',
      ruleType: 'ip_reputation',
      conditions: {},
      scoreImpact: 40,
      actionTrigger: 'challenge_2fa',
      isActive: true,
    },
  ];

  it('allows benign baseline transactions with zero risk score', () => {
    const result = sentinelXEngine.evaluateEvent(
      {
        eventType: 'transaction',
        entityId: 'usr-normal-1',
        entityType: 'user',
        ipAddress: '72.14.201.1',
        geoCountry: 'US',
        amount: 85,
        velocityCount10m: 1,
        priorCountry: 'US',
        hoursSincePriorEvent: 24,
      },
      testRules
    );

    expect(result.riskScore).toBe(0);
    expect(result.riskLevel).toBe('low');
    expect(result.actionTaken).toBe('allow');
    expect(result.triggeredRules).toHaveLength(0);
  });

  it('triggers high-value rule when transaction exceeds threshold', () => {
    const result = sentinelXEngine.evaluateEvent(
      {
        eventType: 'transaction',
        entityId: 'usr-normal-1',
        entityType: 'user',
        ipAddress: '72.14.201.1',
        geoCountry: 'US',
        amount: 3200,
        velocityCount10m: 1,
        priorCountry: 'US',
      },
      testRules
    );

    expect(result.riskScore).toBe(25);
    expect(result.riskLevel).toBe('low');
    expect(result.actionTaken).toBe('flag_review');
    expect(result.triggeredRules).toHaveLength(1);
    expect(result.triggeredRules[0]?.ruleType).toBe('high_amount');
  });

  it('detects impossible travel anomaly and aggregates multiple rule triggers into critical block', () => {
    const result = sentinelXEngine.evaluateEvent(
      {
        eventType: 'transaction',
        entityId: 'usr-attacker-9',
        entityType: 'payment_method',
        ipAddress: '198.51.100.24',
        geoCountry: 'RO',
        amount: 4999,
        velocityCount10m: 7, // > 5 -> Triggers velocity (+35)
        priorCountry: 'US',
        hoursSincePriorEvent: 0.5, // >8000km in 30min -> Triggers geovelocity (+50)
      },
      testRules
    );

    // 50 (geovelocity) + 35 (velocity) + 25 (high_amount) = 110 -> Capped at 100
    expect(result.riskScore).toBe(100);
    expect(result.riskLevel).toBe('critical');
    expect(result.actionTaken).toBe('block');
    expect(result.triggeredRules.length).toBeGreaterThanOrEqual(3);
    expect(result.explanation).toContain('CRITICAL');
  });

  it('flags Tor exit node traffic with 2FA step-up challenge', () => {
    const result = sentinelXEngine.evaluateEvent(
      {
        eventType: 'auth_attempt',
        entityId: 'usr-anon-1',
        entityType: 'user',
        ipAddress: '185.220.101.5',
        geoCountry: 'DE',
        isTorExitNode: true,
      },
      testRules
    );

    expect(result.riskScore).toBe(40);
    expect(result.riskLevel).toBe('medium');
    expect(result.actionTaken).toBe('challenge_2fa');
    expect(result.triggeredRules[0]?.ruleName).toBe('Tor Anonymizer Exit Node');
  });
});
