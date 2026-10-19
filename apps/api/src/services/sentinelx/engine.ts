// ============================================================
// SentinelX — Autonomous Fraud, Risk & Security Intelligence Engine
// ============================================================
// Real-time behavioral anomaly detection, geovelocity calculation,
// multi-rule scoring matrix, and autonomous policy enforcement.
// ============================================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskAction = 'allow' | 'flag_review' | 'challenge_2fa' | 'block';

export interface EvaluationContext {
  eventType: string;
  entityId: string;
  entityType: string;
  ipAddress: string;
  geoCountry: string;
  amount?: number;
  currency?: string;
  deviceFingerprint?: string;
  isTorExitNode?: boolean;
  velocityCount10m?: number;
  priorCountry?: string;
  hoursSincePriorEvent?: number;
  metadata?: Record<string, unknown>;
}

export interface RuleDefinition {
  id: string;
  name: string;
  ruleType: 'velocity' | 'geovelocity' | 'high_amount' | 'ip_reputation' | 'device_anomaly';
  conditions: Record<string, unknown>;
  scoreImpact: number;
  actionTrigger: RiskAction;
  isActive: boolean;
}

export interface EvaluationResult {
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  actionTaken: RiskAction;
  triggeredRules: Array<{
    ruleId: string;
    ruleName: string;
    ruleType: string;
    scoreAdded: number;
    reason: string;
  }>;
  explanation: string;
  latencyMs: number;
}

const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  US: [37.0902, -95.7129],
  GB: [55.3781, -3.436],
  DE: [51.1657, 10.4515],
  RO: [45.9432, 24.9668],
  CN: [35.8617, 104.1954],
  RU: [61.524, 105.3188],
  NG: [9.082, 8.6753],
  BR: [-14.235, -51.9253],
  IN: [20.5937, 78.9629],
};

export class SentinelXEngine {
  /**
   * Calculates great circle distance in km between two country centroids.
   */
  public calculateDistanceKm(countryA: string, countryB: string): number {
    if (countryA === countryB) return 0;
    const coordA = COUNTRY_COORDINATES[countryA] || [0, 0];
    const coordB = COUNTRY_COORDINATES[countryB] || [0, 0];

    const R = 6371; // Earth radius in km
    const dLat = ((coordB[0] - coordA[0]) * Math.PI) / 180;
    const dLon = ((coordB[1] - coordA[1]) * Math.PI) / 180;
    const lat1 = (coordA[0] * Math.PI) / 180;
    const lat2 = (coordB[0] * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Evaluates an incoming event against an active ruleset.
   */
  public evaluateEvent(
    context: EvaluationContext,
    rules: RuleDefinition[],
  ): EvaluationResult {
    const startTime = performance.now();
    let accumulatedScore = 0;
    let highestAction: RiskAction = 'allow';
    const triggeredRules: EvaluationResult['triggeredRules'] = [];

    const actionPriority: Record<RiskAction, number> = {
      allow: 1,
      challenge_2fa: 2,
      flag_review: 3,
      block: 4,
    };

    for (const rule of rules) {
      if (!rule.isActive) continue;

      let matched = false;
      let reason = '';

      switch (rule.ruleType) {
        case 'velocity': {
          const threshold = Number(rule.conditions['maxEventsPerWindow'] ?? 5);
          const count = context.velocityCount10m ?? 1;
          if (count > threshold) {
            matched = true;
            reason = `Event velocity exceeded: ${count} events in 10min window (threshold: ${threshold})`;
          }
          break;
        }

        case 'geovelocity': {
          if (context.priorCountry && context.priorCountry !== context.geoCountry) {
            const distance = this.calculateDistanceKm(context.priorCountry, context.geoCountry);
            const hours = context.hoursSincePriorEvent ?? 1;
            const speedKmH = distance / Math.max(0.01, hours);

            if (speedKmH > 850 && distance > 500) {
              matched = true;
              reason = `Impossible travel detected: ${context.priorCountry} -> ${context.geoCountry} (${distance}km in ${hours.toFixed(1)}h = ${Math.round(speedKmH)} km/h)`;
            }
          }
          break;
        }

        case 'high_amount': {
          const threshold = Number(rule.conditions['amountThreshold'] ?? 2500);
          if (context.amount !== undefined && context.amount >= threshold) {
            matched = true;
            reason = `Transaction amount $${context.amount.toLocaleString()} exceeds high-risk threshold of $${threshold.toLocaleString()}`;
          }
          break;
        }

        case 'ip_reputation': {
          if (context.isTorExitNode) {
            matched = true;
            reason = 'Origin IP identified as verified Tor anonymity network exit node';
          } else if (rule.conditions['blockedCountries']) {
            const blocked = (rule.conditions['blockedCountries'] as string[]) || [];
            if (blocked.includes(context.geoCountry)) {
              matched = true;
              reason = `Origin country ${context.geoCountry} is on sanction/blacklist restriction policy`;
            }
          }
          break;
        }

        case 'device_anomaly': {
          if (context.metadata?.['isNewDevice'] === true) {
            matched = true;
            reason = 'Unrecognized hardware fingerprint without previously verified session tokens';
          }
          break;
        }
      }

      if (matched) {
        accumulatedScore += rule.scoreImpact;
        if (actionPriority[rule.actionTrigger] > actionPriority[highestAction]) {
          highestAction = rule.actionTrigger;
        }
        triggeredRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ruleType: rule.ruleType,
          scoreAdded: rule.scoreImpact,
          reason,
        });
      }
    }

    const finalScore = Math.min(100, Math.max(0, accumulatedScore));

    // Determine risk level based on normalized 0-100 score
    let riskLevel: RiskLevel = 'low';
    if (finalScore >= 85) riskLevel = 'critical';
    else if (finalScore >= 60) riskLevel = 'high';
    else if (finalScore >= 30) riskLevel = 'medium';

    // If accumulated score reaches critical threshold, force block
    if (finalScore >= 85 && highestAction !== 'block') {
      highestAction = 'block';
    } else if (finalScore >= 60 && highestAction === 'allow') {
      highestAction = 'flag_review';
    } else if (finalScore >= 30 && highestAction === 'allow') {
      highestAction = 'challenge_2fa';
    }

    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

    const explanation =
      triggeredRules.length === 0
        ? 'No risk anomalies identified. Transaction authorized under baseline security profile.'
        : `Triggered ${triggeredRules.length} security rules (${triggeredRules.map((r) => r.ruleName).join(', ')}). Computed aggregate risk score: ${finalScore}/100 [${riskLevel.toUpperCase()}]. Action: ${highestAction.toUpperCase()}.`;

    return {
      riskScore: finalScore,
      riskLevel,
      actionTaken: highestAction,
      triggeredRules,
      explanation,
      latencyMs: Math.max(1, latencyMs),
    };
  }
}

export const sentinelXEngine = new SentinelXEngine();
