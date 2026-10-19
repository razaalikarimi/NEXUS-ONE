// ============================================================
// CloudPilot — Multi-Cloud Workload Placement & Cost Engine
// ============================================================
// Multi-cloud placement arbitrage across AWS, GCP, and Azure,
// workload rightsizing analysis, and spot / reservation modeling.
// ============================================================

export type CloudProvider = 'aws' | 'gcp' | 'azure';

export interface PlacementRequirement {
  vCpu: number;
  memoryGb: number;
  gpuCount: number;
  targetRegion: string;
  storageGb: number;
  workloadType: 'stateless_api' | 'batch_training' | 'transaction_db' | 'background_queue';
}

export interface ProviderPlacementOption {
  provider: CloudProvider;
  instanceFamily: string;
  sku: string;
  vCpu: number;
  memoryGb: number;
  onDemandMonthlyCost: number;
  spotMonthlyCost: number;
  reservedMonthlyCost: number;
  networkEgressGbCost: number;
  recommendedPricingModel: 'on_demand' | 'spot' | 'reserved';
  projectedCost: number;
  efficiencyScore: number; // 0 - 100
}

export interface PlacementAnalysisResult {
  requirements: PlacementRequirement;
  cheapestProvider: CloudProvider;
  bestOverallProvider: CloudProvider;
  options: ProviderPlacementOption[];
  maximumMonthlySavings: number;
  recommendationSummary: string;
}

export interface WorkloadMetrics {
  workloadId: string;
  name: string;
  serviceType: string;
  provider: CloudProvider;
  currentSku: string;
  currentMonthlyCost: number;
  avgCpuUtilizationPct: number;
  avgMemoryUtilizationPct: number;
  isStateless: boolean;
  daysActive: number;
}

export interface GeneratedRecommendation {
  workloadId: string;
  recommendationType: 'rightsizing' | 'spot_migration' | 'idle_shutdown' | 'reservation';
  title: string;
  description: string;
  recommendedSku?: string;
  currentMonthlyCost: number;
  projectedMonthlyCost: number;
  savingsMonthly: number;
  savingsPct: number;
}

export class CloudPilotEngine {
  /**
   * Evaluates placement across AWS, GCP, and Azure for a set of workload specs.
   */
  public evaluateMultiCloudPlacement(
    req: PlacementRequirement,
  ): PlacementAnalysisResult {
    const baseHourRatePerCpu = 0.045; // ~$0.045 / vCPU-hr
    const baseHourRatePerGbRam = 0.0055; // ~$0.0055 / GB-hr
    const baseHourRateGpu = 1.25; // ~$1.25 / GPU-hr
    const hoursPerMonth = 730;

    const computeMonthlyBase =
      (req.vCpu * baseHourRatePerCpu +
        req.memoryGb * baseHourRatePerGbRam +
        req.gpuCount * baseHourRateGpu) *
      hoursPerMonth;

    // Provider pricing variance multipliers
    const providerSpecs: Array<{
      provider: CloudProvider;
      multiplier: number;
      family: string;
      skuPrefix: string;
    }> = [
      { provider: 'aws', multiplier: 1.0, family: 'c6i / m6i', skuPrefix: 'c6i' },
      { provider: 'gcp', multiplier: 0.94, family: 'c2 / n2', skuPrefix: 'c2-standard' },
      { provider: 'azure', multiplier: 0.97, family: 'Dsv5', skuPrefix: 'D8s_v5' },
    ];

    const options: ProviderPlacementOption[] = providerSpecs.map((p) => {
      const onDemandMonthly = Math.round(computeMonthlyBase * p.multiplier * 100) / 100;
      const spotMonthly = Math.round(onDemandMonthly * 0.35 * 100) / 100; // 65% spot discount
      const reservedMonthly = Math.round(onDemandMonthly * 0.64 * 100) / 100; // 36% RI discount

      let recommendedPricingModel: 'on_demand' | 'spot' | 'reserved' = 'on_demand';
      let projectedCost = onDemandMonthly;

      if (req.workloadType === 'stateless_api' || req.workloadType === 'background_queue' || req.workloadType === 'batch_training') {
        recommendedPricingModel = 'spot';
        projectedCost = spotMonthly;
      } else if (req.workloadType === 'transaction_db') {
        recommendedPricingModel = 'reserved';
        projectedCost = reservedMonthly;
      }

      const efficiencyScore = Math.round((1 - projectedCost / (onDemandMonthly * 1.5)) * 100);

      return {
        provider: p.provider,
        instanceFamily: p.family,
        sku: `${p.skuPrefix}.${req.vCpu}xl`,
        vCpu: req.vCpu,
        memoryGb: req.memoryGb,
        onDemandMonthlyCost: onDemandMonthly,
        spotMonthlyCost: spotMonthly,
        reservedMonthlyCost: reservedMonthly,
        networkEgressGbCost: 0.08,
        recommendedPricingModel,
        projectedCost,
        efficiencyScore: Math.min(100, Math.max(10, efficiencyScore)),
      };
    });

    options.sort((a, b) => a.projectedCost - b.projectedCost);
    const cheapest = options[0]!;
    const expensive = options[options.length - 1]!;
    const maxSavings = Math.round((expensive.onDemandMonthlyCost - cheapest.projectedCost) * 100) / 100;

    return {
      requirements: req,
      cheapestProvider: cheapest.provider,
      bestOverallProvider: cheapest.provider,
      options,
      maximumMonthlySavings: maxSavings,
      recommendationSummary: `Deploying on ${cheapest.provider.toUpperCase()} (${cheapest.sku}) utilizing ${cheapest.recommendedPricingModel.toUpperCase()} yields maximum efficiency: $${cheapest.projectedCost.toFixed(2)}/mo vs $${expensive.onDemandMonthlyCost.toFixed(2)}/mo baseline ($${maxSavings.toFixed(2)}/mo savings).`,
    };
  }

  /**
   * Generates actionable rightsizing and cost optimization recommendations
   * based on historical CPU/RAM utilization and workload patterns.
   */
  public generateWorkloadRecommendations(
    workload: WorkloadMetrics,
  ): GeneratedRecommendation[] {
    const recs: GeneratedRecommendation[] = [];

    // 1. Idle shutdown recommendation
    if (workload.avgCpuUtilizationPct < 5 && workload.avgMemoryUtilizationPct < 15) {
      recs.push({
        workloadId: workload.workloadId,
        recommendationType: 'idle_shutdown',
        title: `Decommission Idle Instance (${workload.name})`,
        description: `Average CPU utilization (${workload.avgCpuUtilizationPct.toFixed(1)}%) is near-zero over past ${workload.daysActive} days. Decommission or schedule nightly sleep window.`,
        currentMonthlyCost: workload.currentMonthlyCost,
        projectedMonthlyCost: 0,
        savingsMonthly: workload.currentMonthlyCost,
        savingsPct: 100,
      });
      return recs;
    }

    // 2. Downsizing / Rightsizing recommendation
    if (workload.avgCpuUtilizationPct < 30 && workload.avgMemoryUtilizationPct < 40) {
      const projected = Math.round(workload.currentMonthlyCost * 0.52 * 100) / 100;
      const savings = Math.round((workload.currentMonthlyCost - projected) * 100) / 100;
      const savingsPct = Math.round((savings / workload.currentMonthlyCost) * 100);

      recs.push({
        workloadId: workload.workloadId,
        recommendationType: 'rightsizing',
        title: `Rightsize Overprovisioned SKU (${workload.currentSku})`,
        description: `Workload runs comfortably at <30% CPU utilization. Downsize to half-size instance without SLA degradation.`,
        recommendedSku: `${workload.currentSku}-downsized`,
        currentMonthlyCost: workload.currentMonthlyCost,
        projectedMonthlyCost: projected,
        savingsMonthly: savings,
        savingsPct,
      });
    }

    // 3. Spot migration for stateless workloads
    if (workload.isStateless && workload.currentMonthlyCost > 100) {
      const projected = Math.round(workload.currentMonthlyCost * 0.35 * 100) / 100;
      const savings = Math.round((workload.currentMonthlyCost - projected) * 100) / 100;
      const savingsPct = Math.round((savings / workload.currentMonthlyCost) * 100);

      recs.push({
        workloadId: workload.workloadId,
        recommendationType: 'spot_migration',
        title: `Migrate to Spot / Preemptible Fleet`,
        description: `Stateless API service is fault-tolerant with multi-replica auto-scaler. Switch from On-Demand to Spot instances.`,
        recommendedSku: `${workload.currentSku} (Spot)`,
        currentMonthlyCost: workload.currentMonthlyCost,
        projectedMonthlyCost: projected,
        savingsMonthly: savings,
        savingsPct,
      });
    }

    // 4. Reserved Instance / Savings Plan for steady-state workloads
    if (!workload.isStateless && workload.daysActive >= 30 && workload.avgCpuUtilizationPct >= 40) {
      const projected = Math.round(workload.currentMonthlyCost * 0.64 * 100) / 100;
      const savings = Math.round((workload.currentMonthlyCost - projected) * 100) / 100;
      const savingsPct = 36;

      recs.push({
        workloadId: workload.workloadId,
        recommendationType: 'reservation',
        title: `Purchase 1-Year Reserved Savings Plan`,
        description: `Continuous database workload with stable 24/7 utilization. Lock in 36% discount with 1-Year Compute Savings Plan.`,
        recommendedSku: `${workload.currentSku} (1-Yr RI)`,
        currentMonthlyCost: workload.currentMonthlyCost,
        projectedMonthlyCost: projected,
        savingsMonthly: savings,
        savingsPct,
      });
    }

    return recs;
  }
}

export const cloudPilotEngine = new CloudPilotEngine();
