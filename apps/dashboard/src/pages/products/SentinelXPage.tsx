// ============================================================
// SentinelX — Autonomous Fraud, Risk & Security Intelligence
// ============================================================

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Modal, Input } from '@nexus-one/ui';

interface RiskEventItem {
  id: string;
  eventType: 'transaction' | 'auth_attempt' | 'api_key_usage' | 'payout';
  entityId: string;
  entityType: 'user' | 'payment_method' | 'api_consumer';
  ipAddress: string;
  geoCountry: string;
  amount?: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  actionTaken: 'allow' | 'flag_review' | 'challenge_2fa' | 'block';
  timestamp: string;
  details: string;
}

interface RiskRuleItem {
  id: string;
  name: string;
  ruleType: 'geovelocity' | 'velocity' | 'high_amount' | 'ip_reputation' | 'device_anomaly';
  description: string;
  scoreImpact: number;
  actionTrigger: 'allow' | 'flag_review' | 'challenge_2fa' | 'block';
  isActive: boolean;
  evalCount: number;
}

interface FraudCaseItem {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'under_investigation' | 'resolved_fraud' | 'resolved_benign';
  entityId: string;
  amount: number;
  assigneeName: string;
  timestamp: string;
  notes: string;
}

const INITIAL_EVENTS: RiskEventItem[] = [
  {
    id: 'ev-101',
    eventType: 'payout',
    entityId: 'acc_8849204',
    entityType: 'payment_method',
    ipAddress: '198.51.100.24',
    geoCountry: 'RO',
    amount: 4999,
    riskScore: 85,
    riskLevel: 'critical',
    actionTaken: 'block',
    timestamp: '2m ago',
    details: 'Impossible travel: US -> RO (8,420 km in 30min) + High velocity spike',
  },
  {
    id: 'ev-102',
    eventType: 'auth_attempt',
    entityId: 'usr_29104',
    entityType: 'user',
    ipAddress: '185.220.101.5',
    geoCountry: 'DE',
    riskScore: 65,
    riskLevel: 'high',
    actionTaken: 'challenge_2fa',
    timestamp: '8m ago',
    details: 'Confirmed Tor anonymity relay exit node with credential stuffing velocity',
  },
  {
    id: 'ev-103',
    eventType: 'transaction',
    entityId: 'usr_81920',
    entityType: 'user',
    ipAddress: '64.233.160.1',
    geoCountry: 'US',
    amount: 3200,
    riskScore: 35,
    riskLevel: 'medium',
    actionTaken: 'flag_review',
    timestamp: '22m ago',
    details: 'Transaction amount $3,200 exceeds $2,500 baseline threshold',
  },
  {
    id: 'ev-104',
    eventType: 'api_key_usage',
    entityId: 'gf_live_production_svc',
    entityType: 'api_consumer',
    ipAddress: '54.210.12.9',
    geoCountry: 'US',
    riskScore: 10,
    riskLevel: 'low',
    actionTaken: 'allow',
    timestamp: '45m ago',
    details: 'Valid signed HMAC signature from trusted VPC peering gateway',
  },
];

const INITIAL_RULES: RiskRuleItem[] = [
  {
    id: 'rule-1',
    name: 'Supersonic Impossible Travel',
    ruleType: 'geovelocity',
    description: 'Enforces hard block when consecutive events exceed 850 km/h commercial flight speed',
    scoreImpact: 50,
    actionTrigger: 'block',
    isActive: true,
    evalCount: 8904,
  },
  {
    id: 'rule-2',
    name: 'High-Frequency Velocity Spikes',
    ruleType: 'velocity',
    description: 'Detects automated card testing exceeding 5 transaction attempts in 10 minutes',
    scoreImpact: 35,
    actionTrigger: 'challenge_2fa',
    isActive: true,
    evalCount: 14210,
  },
  {
    id: 'rule-3',
    name: 'Tor Anonymizer Exit Relay Ingress',
    ruleType: 'ip_reputation',
    description: 'Enforces mandatory 2FA challenge on confirmed Tor exit node IP addresses',
    scoreImpact: 40,
    actionTrigger: 'challenge_2fa',
    isActive: true,
    evalCount: 6542,
  },
  {
    id: 'rule-4',
    name: 'High-Value Outlier Transfer',
    ruleType: 'high_amount',
    description: 'Flags transactions and payout requests exceeding $2,500 for human review',
    scoreImpact: 25,
    actionTrigger: 'flag_review',
    isActive: true,
    evalCount: 22100,
  },
];

const INITIAL_CASES: FraudCaseItem[] = [
  {
    id: 'case-901',
    title: 'Payout $4,999 to RO from US Account with Speed Anomaly',
    severity: 'critical',
    status: 'open',
    entityId: 'acc_8849204',
    amount: 4999,
    assigneeName: 'Alex Rivera',
    timestamp: '15m ago',
    notes: 'Blocked automatically at edge. Awaiting voice verification callback from account owner.',
  },
  {
    id: 'case-902',
    title: 'Tor Exit Node Password Reset Burst (10 attempts / 2min)',
    severity: 'high',
    status: 'under_investigation',
    entityId: 'usr_29104',
    amount: 0,
    assigneeName: 'Elena Chen',
    timestamp: '1h ago',
    notes: 'Account locked pending email & SMS verification response.',
  },
  {
    id: 'case-903',
    title: 'High-Value Corporate Card Purchase ($3,200 Hardware)',
    severity: 'medium',
    status: 'resolved_benign',
    entityId: 'usr_81920',
    amount: 3200,
    assigneeName: 'Marcus Vance',
    timestamp: '3h ago',
    notes: 'Verified legitimate corporate equipment purchase authorized by VP Engineering.',
  },
];

export function SentinelXPage() {
  const [activeTab, setActiveTab] = useState<'stream' | 'simulator' | 'rules' | 'cases'>('stream');
  const [events] = useState<RiskEventItem[]>(INITIAL_EVENTS);
  const [rules, setRules] = useState<RiskRuleItem[]>(INITIAL_RULES);
  const [cases, setCases] = useState<FraudCaseItem[]>(INITIAL_CASES);

  // Simulator State
  const [simAmount, setSimAmount] = useState<number>(4999);
  const [simGeoCountry, setSimGeoCountry] = useState<string>('RO');
  const [simPriorCountry, setSimPriorCountry] = useState<string>('US');
  const [simHours, setSimHours] = useState<number>(0.5);
  const [simVelocity, setSimVelocity] = useState<number>(8);
  const [simTor, setSimTor] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<{
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
    action: 'allow' | 'flag_review' | 'challenge_2fa' | 'block';
    reasons: string[];
    speedKmH: number;
    distanceKm: number;
  } | null>({
    score: 85,
    level: 'critical',
    action: 'block',
    reasons: [
      'Impossible travel detected: US -> RO (8,420 km in 0.5h = 16,840 km/h)',
      'Event velocity exceeded: 8 events in 10min window (threshold: 5)',
      'Transaction amount $4,999 exceeds high-risk threshold of $2,500',
    ],
    speedKmH: 16840,
    distanceKm: 8420,
  });

  // Create Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [newRuleName, setNewRuleName] = useState<string>('');
  const [newRuleType, setNewRuleType] = useState<RiskRuleItem['ruleType']>('velocity');
  const [newRuleImpact, setNewRuleImpact] = useState<number>(30);
  const [newRuleAction, setNewRuleAction] = useState<RiskRuleItem['actionTrigger']>('flag_review');

  // Case Resolution Modal
  const [selectedCase, setSelectedCase] = useState<FraudCaseItem | null>(null);
  const [resolutionVerdict, setResolutionVerdict] = useState<'resolved_fraud' | 'resolved_benign'>('resolved_fraud');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  const runSimulation = () => {
    let score = 0;
    const reasons: string[] = [];

    // Distance & Geovelocity
    let dist = 0;
    if (simPriorCountry !== simGeoCountry) {
      dist = 8420; // US to RO approx
    }
    const speed = dist / Math.max(0.01, simHours);
    if (speed > 850 && dist > 500) {
      score += 50;
      reasons.push(
        `Impossible travel detected: ${simPriorCountry} -> ${simGeoCountry} (${dist.toLocaleString()} km in ${simHours}h = ${Math.round(speed).toLocaleString()} km/h)`
      );
    }

    // Velocity
    if (simVelocity > 5) {
      score += 35;
      reasons.push(`Event velocity exceeded: ${simVelocity} events in 10min window (threshold: 5)`);
    }

    // High Amount
    if (simAmount >= 2500) {
      score += 25;
      reasons.push(`Transaction amount $${simAmount.toLocaleString()} exceeds high-risk threshold of $2,500`);
    }

    // Tor
    if (simTor) {
      score += 40;
      reasons.push('Origin IP identified as verified Tor anonymity network exit node');
    }

    const finalScore = Math.min(100, score);
    let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let action: 'allow' | 'flag_review' | 'challenge_2fa' | 'block' = 'allow';

    if (finalScore >= 85) {
      level = 'critical';
      action = 'block';
    } else if (finalScore >= 60) {
      level = 'high';
      action = 'flag_review';
    } else if (finalScore >= 30) {
      level = 'medium';
      action = 'challenge_2fa';
    }

    setSimResult({
      score: finalScore,
      level,
      action,
      reasons,
      speedKmH: Math.round(speed),
      distanceKm: dist,
    });
  };

  const applyPreset = (preset: 'impossible' | 'velocity' | 'tor' | 'clean') => {
    if (preset === 'impossible') {
      setSimAmount(4999);
      setSimGeoCountry('RO');
      setSimPriorCountry('US');
      setSimHours(0.5);
      setSimVelocity(7);
      setSimTor(false);
    } else if (preset === 'velocity') {
      setSimAmount(120);
      setSimGeoCountry('US');
      setSimPriorCountry('US');
      setSimHours(1);
      setSimVelocity(12);
      setSimTor(false);
    } else if (preset === 'tor') {
      setSimAmount(450);
      setSimGeoCountry('DE');
      setSimPriorCountry('DE');
      setSimHours(5);
      setSimVelocity(2);
      setSimTor(true);
    } else if (preset === 'clean') {
      setSimAmount(85);
      setSimGeoCountry('US');
      setSimPriorCountry('US');
      setSimHours(24);
      setSimVelocity(1);
      setSimTor(false);
    }
  };

  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleCreateRule = () => {
    if (!newRuleName.trim()) return;
    const rule: RiskRuleItem = {
      id: `rule-${Date.now()}`,
      name: newRuleName.trim(),
      ruleType: newRuleType,
      description: `Custom policy rule enforcing ${newRuleAction} on ${newRuleType} deviations.`,
      scoreImpact: newRuleImpact,
      actionTrigger: newRuleAction,
      isActive: true,
      evalCount: 0,
    };
    setRules([rule, ...rules]);
    setIsRuleModalOpen(false);
    setNewRuleName('');
  };

  const handleResolveCase = () => {
    if (!selectedCase) return;
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id
          ? {
              ...c,
              status: resolutionVerdict,
              notes: resolutionNotes || `Case resolved as ${resolutionVerdict}`,
            }
          : c
      )
    );
    setSelectedCase(null);
    setResolutionNotes('');
  };

  return (
    <div className="nx-product-shell">
      {/* Header */}
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-sentinelx)' }}>
            <span>🛡️ SentinelX</span>
            <span className="nx-pill-tag">Autonomous Fraud & Risk Engine</span>
          </div>
          <h1 className="nx-product-title">Fraud Intelligence & Policy Enforcement</h1>
          <p className="nx-product-desc">
            Deterministic risk DSL evaluation, impossible travel geovelocity detection, real-time behavioral anomalies, and autonomous case decisioning.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button variant="secondary" onClick={() => setActiveTab('simulator')}>
            ⚡ Open Fraud Simulator
          </Button>
          <Button variant="primary" onClick={() => setIsRuleModalOpen(true)}>
            + New Risk Rule
          </Button>
        </div>
      </div>

      {/* Live Protection Status Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(249, 115, 22, 0.08)',
          border: '1px solid rgba(249, 115, 22, 0.25)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--nx-sentinelx)', boxShadow: '0 0 8px var(--nx-sentinelx)' }} />
          <span>
            SentinelX Autonomous Shield: <strong>ACTIVE</strong> — Ingress edge proxy blocking critical threats in <strong>&lt; 3ms</strong>.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--nx-neutral-400)', fontSize: '0.8rem' }}>
          <span>Precision Rate: <strong>99.8%</strong></span>
          <span>False Positives: <strong>&lt; 0.02%</strong></span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="nx-product-grid-4">
        <Card>
          <div className="nx-stat-title">Evaluated Events</div>
          <div className="nx-stat-value">45,214 / hr</div>
          <div className="nx-stat-sub">Across all API & auth endpoints</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Threat Mitigation Rate</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-success-500)' }}>
            99.8%
          </div>
          <div className="nx-stat-sub">Clean transaction classification</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Prevented Fraud Loss</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-sentinelx)' }}>
            $284,500
          </div>
          <div className="nx-stat-sub">Past 30 calendar days</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Active Security Rules</div>
          <div className="nx-stat-value">{rules.filter((r) => r.isActive).length}</div>
          <div className="nx-stat-sub">Continuous policy enforcement</div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--nx-neutral-800)', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('stream')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'stream' ? '2px solid var(--nx-sentinelx)' : '2px solid transparent',
            color: activeTab === 'stream' ? 'var(--nx-neutral-0)' : 'var(--nx-neutral-400)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Live Threat Radar & Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'simulator' ? '2px solid var(--nx-sentinelx)' : '2px solid transparent',
            color: activeTab === 'simulator' ? 'var(--nx-neutral-0)' : 'var(--nx-neutral-400)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Interactive Fraud Simulator
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'rules' ? '2px solid var(--nx-sentinelx)' : '2px solid transparent',
            color: activeTab === 'rules' ? 'var(--nx-neutral-0)' : 'var(--nx-neutral-400)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Rule Policies Matrix ({rules.length})
        </button>
        <button
          onClick={() => setActiveTab('cases')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'cases' ? '2px solid var(--nx-sentinelx)' : '2px solid transparent',
            color: activeTab === 'cases' ? 'var(--nx-neutral-0)' : 'var(--nx-neutral-400)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Case Triage Queue ({cases.filter((c) => c.status === 'open' || c.status === 'under_investigation').length} Open)
        </button>
      </div>

      {/* TAB 1: LIVE THREAT RADAR */}
      {activeTab === 'stream' && (
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <CardTitle>Real-Time Ingress Threat Telemetry</CardTitle>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--nx-neutral-400)' }}>
                  Continuous evaluation stream assessing every auth attempt, transaction, and API key consumption.
                </p>
              </div>
              <Badge variant="success" size="sm">Streaming Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="nx-table-wrap">
              <table className="nx-table">
                <thead className="nx-table__header">
                  <tr>
                    <th className="nx-table__head-cell">Event Type</th>
                    <th className="nx-table__head-cell">Entity & Target</th>
                    <th className="nx-table__head-cell">Geo & IP</th>
                    <th className="nx-table__head-cell">Risk Score</th>
                    <th className="nx-table__head-cell">Decision Action</th>
                    <th className="nx-table__head-cell">Anomaly Details</th>
                    <th className="nx-table__head-cell">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="nx-table__body">
                  {events.map((ev) => (
                    <tr key={ev.id} className="nx-table__row">
                      <td className="nx-table__cell">
                        <Badge variant="default" size="sm">{ev.eventType.toUpperCase()}</Badge>
                      </td>
                      <td className="nx-table__cell">
                        <strong>{ev.entityId}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--nx-neutral-400)' }}>{ev.entityType}</div>
                      </td>
                      <td className="nx-table__cell">
                        <code>{ev.ipAddress}</code>
                        <div style={{ fontSize: '0.75rem', color: 'var(--nx-brand-400)' }}>Country: {ev.geoCountry}</div>
                      </td>
                      <td className="nx-table__cell">
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              ev.riskLevel === 'critical'
                                ? 'var(--nx-error-500)'
                                : ev.riskLevel === 'high'
                                ? 'var(--nx-warning-500)'
                                : ev.riskLevel === 'medium'
                                ? '#f59e0b'
                                : 'var(--nx-success-500)',
                          }}
                        >
                          {ev.riskScore} / 100 [{ev.riskLevel.toUpperCase()}]
                        </span>
                      </td>
                      <td className="nx-table__cell">
                        <Badge
                          variant={
                            ev.actionTaken === 'block'
                              ? 'error'
                              : ev.actionTaken === 'challenge_2fa'
                              ? 'warning'
                              : ev.actionTaken === 'flag_review'
                              ? 'info'
                              : 'success'
                          }
                          size="sm"
                        >
                          {ev.actionTaken.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="nx-table__cell" style={{ maxWidth: '320px', fontSize: '0.8rem', color: 'var(--nx-neutral-300)' }}>
                        {ev.details}
                      </td>
                      <td className="nx-table__cell" style={{ fontSize: '0.8rem', color: 'var(--nx-neutral-400)' }}>
                        {ev.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: INTERACTIVE FRAUD SIMULATOR */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Simulator Controls */}
          <Card>
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle>Scenario Configuration</CardTitle>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => applyPreset('impossible')}
                    style={{ background: 'none', border: '1px solid var(--nx-neutral-700)', color: 'var(--nx-neutral-200)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Impossible Flight
                  </button>
                  <button
                    onClick={() => applyPreset('velocity')}
                    style={{ background: 'none', border: '1px solid var(--nx-neutral-700)', color: 'var(--nx-neutral-200)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Card Velocity
                  </button>
                  <button
                    onClick={() => applyPreset('tor')}
                    style={{ background: 'none', border: '1px solid var(--nx-neutral-700)', color: 'var(--nx-neutral-200)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Tor Exit
                  </button>
                  <button
                    onClick={() => applyPreset('clean')}
                    style={{ background: 'none', border: '1px solid var(--nx-neutral-700)', color: 'var(--nx-neutral-200)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Clean User
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Transaction Amount ($ USD): ${simAmount.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="10000"
                    step="50"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--nx-sentinelx)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Prior Location
                    </label>
                    <select
                      value={simPriorCountry}
                      onChange={(e) => setSimPriorCountry(e.target.value)}
                      style={{ width: '100%', backgroundColor: 'var(--nx-neutral-900)', color: 'var(--nx-neutral-100)', border: '1px solid var(--nx-neutral-700)', padding: '0.5rem', borderRadius: '6px' }}
                    >
                      <option value="US">United States (US)</option>
                      <option value="GB">United Kingdom (GB)</option>
                      <option value="DE">Germany (DE)</option>
                      <option value="RO">Romania (RO)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Current Ingress Location
                    </label>
                    <select
                      value={simGeoCountry}
                      onChange={(e) => setSimGeoCountry(e.target.value)}
                      style={{ width: '100%', backgroundColor: 'var(--nx-neutral-900)', color: 'var(--nx-neutral-100)', border: '1px solid var(--nx-neutral-700)', padding: '0.5rem', borderRadius: '6px' }}
                    >
                      <option value="RO">Romania (RO)</option>
                      <option value="US">United States (US)</option>
                      <option value="DE">Germany (DE)</option>
                      <option value="GB">United Kingdom (GB)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Hours Since Last Event: {simHours}h
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="12"
                      step="0.1"
                      value={simHours}
                      onChange={(e) => setSimHours(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--nx-sentinelx)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      10-min Velocity Count: {simVelocity} events
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={simVelocity}
                      onChange={(e) => setSimVelocity(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--nx-sentinelx)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    id="torToggle"
                    checked={simTor}
                    onChange={(e) => setSimTor(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--nx-sentinelx)' }}
                  />
                  <label htmlFor="torToggle" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                    Originate from Verified Tor Anonymizer Exit Node
                  </label>
                </div>

                <Button variant="primary" onClick={runSimulation} style={{ marginTop: '0.5rem' }}>
                  ⚡ Evaluate Risk Scenario
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Simulator Evaluation Output */}
          <Card>
            <CardHeader>
              <CardTitle>Autonomous Policy Evaluation Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {simResult ? (
                <div>
                  {/* Verdict Banner */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      borderRadius: '8px',
                      backgroundColor:
                        simResult.level === 'critical'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : simResult.level === 'high'
                          ? 'rgba(249, 115, 22, 0.15)'
                          : simResult.level === 'medium'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(34, 197, 94, 0.15)',
                      border: `1.5px solid ${
                        simResult.level === 'critical'
                          ? 'var(--nx-error-500)'
                          : simResult.level === 'high'
                          ? 'var(--nx-warning-500)'
                          : simResult.level === 'medium'
                          ? '#f59e0b'
                          : 'var(--nx-success-500)'
                      }`,
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--nx-neutral-400)', textTransform: 'uppercase' }}>
                        DECISION & RISK RATING
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--nx-neutral-0)' }}>
                        {simResult.action.toUpperCase()} [{simResult.score}/100 • {simResult.level.toUpperCase()}]
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--nx-neutral-400)' }}>EVAL LATENCY</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--nx-success-500)' }}>1.4ms</div>
                    </div>
                  </div>

                  {/* Geovelocity Metrics */}
                  {simResult.distanceKm > 0 && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--nx-neutral-900)',
                        borderRadius: '6px',
                        border: '1px solid var(--nx-neutral-800)',
                        marginBottom: '1rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--nx-brand-400)', marginBottom: '0.25rem' }}>
                        🌐 Geovelocity Telemetry
                      </div>
                      <div>Geodesic Delta: <strong>{simResult.distanceKm.toLocaleString()} km</strong></div>
                      <div>Inferred Velocity: <strong>{simResult.speedKmH.toLocaleString()} km/h</strong> (Commercial Flight Max: 850 km/h)</div>
                    </div>
                  )}

                  {/* Triggered Rule Explanations */}
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--nx-neutral-300)' }}>
                    Triggered Rule Justifications ({simResult.reasons.length}):
                  </div>

                  {simResult.reasons.length === 0 ? (
                    <div style={{ color: 'var(--nx-success-500)', fontSize: '0.85rem' }}>
                      ✓ All security thresholds satisfied. Transaction cleared with baseline risk score.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {simResult.reasons.map((r, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.5rem 0.75rem',
                            backgroundColor: 'var(--nx-neutral-900)',
                            borderLeft: '3px solid var(--nx-sentinelx)',
                            borderRadius: '0 4px 4px 0',
                            fontSize: '0.8rem',
                            color: 'var(--nx-neutral-200)',
                          }}
                        >
                          ⚠️ {r}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: 'var(--nx-neutral-500)', fontSize: '0.9rem' }}>
                  Adjust parameters on the left and click &quot;Evaluate Risk Scenario&quot;.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: RULE POLICIES MATRIX */}
      {activeTab === 'rules' && (
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <CardTitle>Autonomous Risk Rules Matrix</CardTitle>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--nx-neutral-400)' }}>
                  Deterministic rules evaluated across all incoming transactions. Each rule contributes additive score impact.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setIsRuleModalOpen(true)}>
                + Create Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="nx-table-wrap">
              <table className="nx-table">
                <thead className="nx-table__header">
                  <tr>
                    <th className="nx-table__head-cell">Rule Name & Type</th>
                    <th className="nx-table__head-cell">Policy Description</th>
                    <th className="nx-table__head-cell">Score Impact</th>
                    <th className="nx-table__head-cell">Trigger Action</th>
                    <th className="nx-table__head-cell">Evaluations (24h)</th>
                    <th className="nx-table__head-cell">Status</th>
                    <th className="nx-table__head-cell">Toggle</th>
                  </tr>
                </thead>
                <tbody className="nx-table__body">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="nx-table__row">
                      <td className="nx-table__cell">
                        <strong>{rule.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--nx-neutral-500)' }}>{rule.ruleType.toUpperCase()}</div>
                      </td>
                      <td className="nx-table__cell" style={{ maxWidth: '300px', fontSize: '0.8rem', color: 'var(--nx-neutral-300)' }}>
                        {rule.description}
                      </td>
                      <td className="nx-table__cell">
                        <span style={{ fontWeight: 700, color: 'var(--nx-sentinelx)' }}>+{rule.scoreImpact} pts</span>
                      </td>
                      <td className="nx-table__cell">
                        <Badge
                          variant={
                            rule.actionTrigger === 'block'
                              ? 'error'
                              : rule.actionTrigger === 'challenge_2fa'
                              ? 'warning'
                              : rule.actionTrigger === 'flag_review'
                              ? 'info'
                              : 'success'
                          }
                          size="sm"
                        >
                          {rule.actionTrigger.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="nx-table__cell">{rule.evalCount.toLocaleString()}</td>
                      <td className="nx-table__cell">
                        <Badge variant={rule.isActive ? 'success' : 'default'} size="sm">
                          {rule.isActive ? 'ACTIVE' : 'DISABLED'}
                        </Badge>
                      </td>
                      <td className="nx-table__cell">
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            backgroundColor: rule.isActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                            color: rule.isActive ? 'var(--nx-error-500)' : 'var(--nx-success-500)',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {rule.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: CASE TRIAGE QUEUE */}
      {activeTab === 'cases' && (
        <Card>
          <CardHeader>
            <CardTitle>Fraud Investigation Cases</CardTitle>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--nx-neutral-400)' }}>
              Open case triage queue for security operations and fraud analysts.
            </p>
          </CardHeader>
          <CardContent>
            <div className="nx-table-wrap">
              <table className="nx-table">
                <thead className="nx-table__header">
                  <tr>
                    <th className="nx-table__head-cell">Case Title</th>
                    <th className="nx-table__head-cell">Severity</th>
                    <th className="nx-table__head-cell">Status</th>
                    <th className="nx-table__head-cell">Entity ID</th>
                    <th className="nx-table__head-cell">Exposure</th>
                    <th className="nx-table__head-cell">Assignee</th>
                    <th className="nx-table__head-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="nx-table__body">
                  {cases.map((cs) => (
                    <tr key={cs.id} className="nx-table__row">
                      <td className="nx-table__cell">
                        <strong>{cs.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--nx-neutral-400)' }}>{cs.notes}</div>
                      </td>
                      <td className="nx-table__cell">
                        <Badge
                          variant={
                            cs.severity === 'critical'
                              ? 'error'
                              : cs.severity === 'high'
                              ? 'warning'
                              : 'default'
                          }
                          size="sm"
                        >
                          {cs.severity.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="nx-table__cell">
                        <Badge
                          variant={
                            cs.status === 'open'
                              ? 'warning'
                              : cs.status === 'under_investigation'
                              ? 'info'
                              : cs.status === 'resolved_fraud'
                              ? 'error'
                              : 'success'
                          }
                          size="sm"
                        >
                          {cs.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="nx-table__cell">
                        <code>{cs.entityId}</code>
                      </td>
                      <td className="nx-table__cell">
                        {cs.amount > 0 ? (
                          <strong style={{ color: 'var(--nx-error-500)' }}>${cs.amount.toLocaleString()}</strong>
                        ) : (
                          <span style={{ color: 'var(--nx-neutral-500)' }}>N/A</span>
                        )}
                      </td>
                      <td className="nx-table__cell">{cs.assigneeName}</td>
                      <td className="nx-table__cell">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedCase(cs);
                            setResolutionNotes(cs.notes);
                          }}
                        >
                          Triage & Verdict →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Rule Modal */}
      <Modal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        title="Create New Risk Scoring Rule"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Rule Name
            </label>
            <Input
              placeholder="e.g. Rapid Micro-Deposit Velocity"
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Anomaly Category
              </label>
              <select
                value={newRuleType}
                onChange={(e) => setNewRuleType(e.target.value as RiskRuleItem['ruleType'])}
                style={{ width: '100%', backgroundColor: 'var(--nx-neutral-900)', color: 'var(--nx-neutral-100)', border: '1px solid var(--nx-neutral-700)', padding: '0.5rem', borderRadius: '6px' }}
              >
                <option value="velocity">Transaction Velocity Spike</option>
                <option value="geovelocity">Impossible Geovelocity Travel</option>
                <option value="high_amount">High-Value Outlier Amount</option>
                <option value="ip_reputation">IP Reputation / Tor Network</option>
                <option value="device_anomaly">Unseen Device Fingerprint</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Policy Action Trigger
              </label>
              <select
                value={newRuleAction}
                onChange={(e) => setNewRuleAction(e.target.value as RiskRuleItem['actionTrigger'])}
                style={{ width: '100%', backgroundColor: 'var(--nx-neutral-900)', color: 'var(--nx-neutral-100)', border: '1px solid var(--nx-neutral-700)', padding: '0.5rem', borderRadius: '6px' }}
              >
                <option value="block">BLOCK (Immediate Rejection)</option>
                <option value="flag_review">FLAG_REVIEW (Queue for Analyst)</option>
                <option value="challenge_2fa">CHALLENGE_2FA (Step-up Auth)</option>
                <option value="allow">ALLOW (Audit Only)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Score Impact Points (+{newRuleImpact} pts)
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={newRuleImpact}
              onChange={(e) => setNewRuleImpact(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--nx-sentinelx)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsRuleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateRule} disabled={!newRuleName.trim()}>
              Deploy Policy Rule
            </Button>
          </div>
        </div>
      </Modal>

      {/* Case Resolution Modal */}
      {selectedCase && (
        <Modal
          isOpen={Boolean(selectedCase)}
          onClose={() => setSelectedCase(null)}
          title={`Triage Case: ${selectedCase.id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--nx-neutral-300)' }}>
                {selectedCase.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--nx-neutral-500)', marginTop: '0.2rem' }}>
                Target Entity: <code>{selectedCase.entityId}</code> • Exposure: ${selectedCase.amount.toLocaleString()}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Investigation Verdict
              </label>
              <select
                value={resolutionVerdict}
                onChange={(e) => setResolutionVerdict(e.target.value as 'resolved_fraud' | 'resolved_benign')}
                style={{ width: '100%', backgroundColor: 'var(--nx-neutral-900)', color: 'var(--nx-neutral-100)', border: '1px solid var(--nx-neutral-700)', padding: '0.5rem', borderRadius: '6px' }}
              >
                <option value="resolved_fraud">CONFIRMED FRAUD (Add to Blocklist & Invalidate Credentials)</option>
                <option value="resolved_benign">BENIGN FALSE POSITIVE (Whitelist Entity & Close Case)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Analyst Investigation Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                style={{
                  width: '100%',
                  height: '80px',
                  backgroundColor: 'var(--nx-neutral-950)',
                  color: 'var(--nx-neutral-100)',
                  border: '1px solid var(--nx-neutral-700)',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button variant="secondary" onClick={() => setSelectedCase(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleResolveCase}>
                Submit Resolution Verdict
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
