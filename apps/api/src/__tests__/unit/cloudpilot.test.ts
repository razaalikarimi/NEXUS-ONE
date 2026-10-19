// ============================================================
// CloudPilot Unit Tests — Placement Arbitrage & Cost Optimizer
// ============================================================

import { describe, it, expect } from 'vitest';
import { cloudPilotEngine } from '../../services/cloudpilot/engine.js';

describe('CloudPilotEngine — Multi-Cloud Placement Arbitrage', () => {
  it('computes realistic pricing and identifies spot savings for stateless API workloads', () => {
    const result = cloudPilotEngine.evaluateMultiCloudPlacement({
      vCpu: 8,
      memoryGb: 32,
      gpuCount: 0,
      targetRegion: 'us-east',
      storageGb: 200,
      workloadType: 'stateless_api',
    });

    expect(result.options).toHaveLength(3); // AWS, GCP, Azure
    expect(result.cheapestProvider).toBeDefined();
    expect(result.maximumMonthlySavings).toBeGreaterThan(100);

    const cheapest = result.options[0]!;
    expect(cheapest.recommendedPricingModel).toBe('spot');
    expect(cheapest.spotMonthlyCost).toBeLessThan(cheapest.onDemandMonthlyCost);
    expect(result.recommendationSummary).toContain(cheapest.provider.toUpperCase());
  });

  it('selects reserved instance pricing model for 24/7 transaction database workloads', () => {
    const result = cloudPilotEngine.evaluateMultiCloudPlacement({
      vCpu: 16,
      memoryGb: 64,
      gpuCount: 0,
      targetRegion: 'us-east',
      storageGb: 500,
      workloadType: 'transaction_db',
    });

    for (const opt of result.options) {
      expect(opt.recommendedPricingModel).toBe('reserved');
      expect(opt.reservedMonthlyCost).toBeLessThan(opt.onDemandMonthlyCost);
    }
  });
});

describe('CloudPilotEngine — Workload Rightsizing Recommendations', () => {
  it('generates idle shutdown recommendation for zombie workloads with near-zero utilization', () => {
    const recs = cloudPilotEngine.generateWorkloadRecommendations({
      workloadId: 'wl-zombie-1',
      name: 'abandoned-qa-runner',
      serviceType: 'compute',
      provider: 'aws',
      currentSku: 'm5.2xlarge',
      currentMonthlyCost: 380,
      avgCpuUtilizationPct: 2.1,
      avgMemoryUtilizationPct: 8.5,
      isStateless: true,
      daysActive: 21,
    });

    expect(recs).toHaveLength(1);
    expect(recs[0]?.recommendationType).toBe('idle_shutdown');
    expect(recs[0]?.savingsMonthly).toBe(380);
    expect(recs[0]?.savingsPct).toBe(100);
  });

  it('recommends rightsizing SKU when CPU utilization is under 30%', () => {
    const recs = cloudPilotEngine.generateWorkloadRecommendations({
      workloadId: 'wl-oversized-2',
      name: 'internal-portal-api',
      serviceType: 'compute',
      provider: 'aws',
      currentSku: 'c6i.4xlarge',
      currentMonthlyCost: 1420,
      avgCpuUtilizationPct: 18.5,
      avgMemoryUtilizationPct: 28.0,
      isStateless: false,
      daysActive: 45,
    });

    const rightsizingRec = recs.find((r) => r.recommendationType === 'rightsizing');
    expect(rightsizingRec).toBeDefined();
    expect(rightsizingRec?.savingsMonthly).toBeGreaterThan(500);
    expect(rightsizingRec?.savingsPct).toBeGreaterThanOrEqual(40);
  });

  it('recommends 1-year reserved savings plan for continuous high-utilization stateful services', () => {
    const recs = cloudPilotEngine.generateWorkloadRecommendations({
      workloadId: 'wl-db-3',
      name: 'postgres-primary-prod',
      serviceType: 'database',
      provider: 'gcp',
      currentSku: 'n2-highmem-16',
      currentMonthlyCost: 1850,
      avgCpuUtilizationPct: 65.0,
      avgMemoryUtilizationPct: 78.0,
      isStateless: false,
      daysActive: 90,
    });

    const riRec = recs.find((r) => r.recommendationType === 'reservation');
    expect(riRec).toBeDefined();
    expect(riRec?.savingsPct).toBe(36);
    expect(riRec?.savingsMonthly).toBeGreaterThan(600);
  });
});
