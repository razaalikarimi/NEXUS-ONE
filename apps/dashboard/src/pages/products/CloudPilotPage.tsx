// ============================================================
// CloudPilot — Multi-Cloud Workload Placement & Cost Optimizer
// ============================================================

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Modal, Input } from '@nexus-one/ui';

interface CloudAccountItem {
  id: string;
  provider: 'aws' | 'gcp' | 'azure';
  accountName: string;
  accountId: string;
  status: 'connected' | 'syncing' | 'error';
  monthlySpend: number;
  workloadCount: number;
  regionPrimary: string;
}

interface CostRecommendationItem {
  id: string;
  workloadName: string;
  provider: 'aws' | 'gcp' | 'azure';
  recommendationType: 'rightsizing' | 'spot_migration' | 'idle_shutdown' | 'reservation';
  title: string;
  description: string;
  currentSku: string;
  recommendedSku: string;
  currentMonthlyCost: number;
  projectedMonthlyCost: number;
  savingsMonthly: number;
  savingsPct: number;
  status: 'pending' | 'applied';
}

interface WorkloadInventoryItem {
  id: string;
  name: string;
  provider: 'aws' | 'gcp' | 'azure';
  serviceType: 'compute' | 'kubernetes' | 'database' | 'storage';
  region: string;
  currentSku: string;
  monthlyCost: number;
  cpuUtilizationPct: number;
  memoryUtilizationPct: number;
  status: 'running' | 'idle' | 'stopped';
}

interface PlacementComparison {
  provider: 'aws' | 'gcp' | 'azure';
  instanceSku: string;
  onDemandMonthly: number;
  spotMonthly: number;
  reservedMonthly: number;
  recommendedModel: 'on_demand' | 'spot' | 'reserved';
  projectedCost: number;
  efficiencyScore: number;
}

const INITIAL_ACCOUNTS: CloudAccountItem[] = [
  {
    id: 'acc-aws-1',
    provider: 'aws',
    accountName: 'Production AWS (us-east-1)',
    accountId: '891048291044',
    status: 'connected',
    monthlySpend: 14850.0,
    workloadCount: 24,
    regionPrimary: 'us-east-1 (N. Virginia)',
  },
  {
    id: 'acc-gcp-2',
    provider: 'gcp',
    accountName: 'Nexus GCP Analytics Core',
    accountId: 'nexus-analytics-prod',
    status: 'connected',
    monthlySpend: 8420.0,
    workloadCount: 16,
    regionPrimary: 'us-central1 (Iowa)',
  },
  {
    id: 'acc-az-3',
    provider: 'azure',
    accountName: 'Azure Disaster Recovery Primary',
    accountId: 'sub-7819-azure-dr',
    status: 'connected',
    monthlySpend: 4950.0,
    workloadCount: 8,
    regionPrimary: 'eastus2 (Virginia)',
  },
];

const INITIAL_RECOMMENDATIONS: CostRecommendationItem[] = [
  {
    id: 'rec-1',
    workloadName: 'agentforge-worker-fleet',
    provider: 'aws',
    recommendationType: 'rightsizing',
    title: 'Downsize Overprovisioned SKU (c6i.4xlarge -> c6i.2xlarge)',
    description: 'Workload runs stably at 22% CPU utilization over past 14 days. Downsize to 8 vCPU instance.',
    currentSku: 'c6i.4xlarge (16 vCPU, 32GB)',
    recommendedSku: 'c6i.2xlarge (8 vCPU, 16GB)',
    currentMonthlyCost: 1420.0,
    projectedMonthlyCost: 738.4,
    savingsMonthly: 681.6,
    savingsPct: 48,
    status: 'pending',
  },
  {
    id: 'rec-2',
    workloadName: 'staging-sandbox-cluster',
    provider: 'aws',
    recommendationType: 'idle_shutdown',
    title: 'Decommission Zombie Staging Cluster',
    description: 'Average CPU utilization is 3.1% with zero external ingress traffic for 21 days.',
    currentSku: 'm5.2xlarge (8 vCPU, 32GB)',
    recommendedSku: 'Decommission / Auto-Sleep',
    currentMonthlyCost: 380.0,
    projectedMonthlyCost: 0.0,
    savingsMonthly: 380.0,
    savingsPct: 100,
    status: 'pending',
  },
  {
    id: 'rec-3',
    workloadName: 'cortexrag-vector-embedder',
    provider: 'gcp',
    recommendationType: 'reservation',
    title: 'Lock In 1-Year Compute Savings Plan for Continuous Ingestion',
    description: 'Steady 24/7 vector ingestion cluster running at 68% CPU. 1-Year commit delivers 36% discount.',
    currentSku: 'n2-standard-16 (16 vCPU, 64GB)',
    recommendedSku: 'n2-standard-16 (1-Yr RI)',
    currentMonthlyCost: 980.0,
    projectedMonthlyCost: 627.2,
    savingsMonthly: 352.8,
    savingsPct: 36,
    status: 'pending',
  },
  {
    id: 'rec-4',
    workloadName: 'gateflow-proxy-stateless',
    provider: 'aws',
    recommendationType: 'spot_migration',
    title: 'Migrate Stateless Proxy Replicas to Spot Fleet',
    description: 'Fault-tolerant multi-AZ proxy cluster with active health checks. Spot instances yield 65% reduction.',
    currentSku: 'c6i.xlarge (On-Demand)',
    recommendedSku: 'c6i.xlarge (Spot Fleet)',
    currentMonthlyCost: 640.0,
    projectedMonthlyCost: 224.0,
    savingsMonthly: 416.0,
    savingsPct: 65,
    status: 'pending',
  },
];

const INITIAL_WORKLOADS: WorkloadInventoryItem[] = [
  {
    id: 'wl-1',
    name: 'agentforge-worker-fleet',
    provider: 'aws',
    serviceType: 'compute',
    region: 'us-east-1',
    currentSku: 'c6i.4xlarge',
    monthlyCost: 1420.0,
    cpuUtilizationPct: 22.4,
    memoryUtilizationPct: 35.1,
    status: 'running',
  },
  {
    id: 'wl-2',
    name: 'cortexrag-vector-embedder',
    provider: 'gcp',
    serviceType: 'kubernetes',
    region: 'us-central1',
    currentSku: 'n2-standard-16',
    monthlyCost: 980.0,
    cpuUtilizationPct: 68.2,
    memoryUtilizationPct: 74.0,
    status: 'running',
  },
  {
    id: 'wl-3',
    name: 'staging-sandbox-cluster',
    provider: 'aws',
    serviceType: 'compute',
    region: 'us-west-2',
    currentSku: 'm5.2xlarge',
    monthlyCost: 380.0,
    cpuUtilizationPct: 3.1,
    memoryUtilizationPct: 11.2,
    status: 'idle',
  },
  {
    id: 'wl-4',
    name: 'postgres-primary-cluster',
    provider: 'azure',
    serviceType: 'database',
    region: 'eastus2',
    currentSku: 'Standard_E8s_v5',
    monthlyCost: 890.0,
    cpuUtilizationPct: 54.8,
    memoryUtilizationPct: 81.3,
    status: 'running',
  },
];

export function CloudPilotPage() {
  const [activeTab, setActiveTab] = useState<'spend' | 'calculator' | 'advisor' | 'inventory'>('spend');
  const [accounts, setAccounts] = useState<CloudAccountItem[]>(INITIAL_ACCOUNTS);
  const [recommendations, setRecommendations] = useState<CostRecommendationItem[]>(INITIAL_RECOMMENDATIONS);
  const [workloads] = useState<WorkloadInventoryItem[]>(INITIAL_WORKLOADS);

  // Placement Calculator Inputs
  const [calcCpu, setCalcCpu] = useState<number>(8);
  const [calcRam, setCalcRam] = useState<number>(32);
  const [calcGpu, setCalcGpu] = useState<number>(0);
  const [calcWorkloadType, setCalcWorkloadType] = useState<'stateless_api' | 'batch_training' | 'transaction_db' | 'background_queue'>('stateless_api');

  // Placement Comparison Results
  const computePlacement = (): PlacementComparison[] => {
    const baseHourRate = (calcCpu * 0.045 + calcRam * 0.0055 + calcGpu * 1.25) * 730;

    return [
      {
        provider: 'gcp',
        instanceSku: `c2-standard-${calcCpu}`,
        onDemandMonthly: Math.round(baseHourRate * 0.94),
        spotMonthly: Math.round(baseHourRate * 0.94 * 0.35),
        reservedMonthly: Math.round(baseHourRate * 0.94 * 0.64),
        recommendedModel: calcWorkloadType === 'transaction_db' ? 'reserved' : 'spot',
        projectedCost: calcWorkloadType === 'transaction_db' ? Math.round(baseHourRate * 0.94 * 0.64) : Math.round(baseHourRate * 0.94 * 0.35),
        efficiencyScore: 98,
      },
      {
        provider: 'aws',
        instanceSku: `c6i.${calcCpu / 2}xlarge`,
        onDemandMonthly: Math.round(baseHourRate * 1.0),
        spotMonthly: Math.round(baseHourRate * 1.0 * 0.35),
        reservedMonthly: Math.round(baseHourRate * 1.0 * 0.64),
        recommendedModel: calcWorkloadType === 'transaction_db' ? 'reserved' : 'spot',
        projectedCost: calcWorkloadType === 'transaction_db' ? Math.round(baseHourRate * 1.0 * 0.64) : Math.round(baseHourRate * 1.0 * 0.35),
        efficiencyScore: 94,
      },
      {
        provider: 'azure',
        instanceSku: `D${calcCpu}s_v5`,
        onDemandMonthly: Math.round(baseHourRate * 0.97),
        spotMonthly: Math.round(baseHourRate * 0.97 * 0.36),
        reservedMonthly: Math.round(baseHourRate * 0.97 * 0.65),
        recommendedModel: calcWorkloadType === 'transaction_db' ? 'reserved' : 'spot',
        projectedCost: calcWorkloadType === 'transaction_db' ? Math.round(baseHourRate * 0.97 * 0.65) : Math.round(baseHourRate * 0.97 * 0.36),
        efficiencyScore: 92,
      },
    ];
  };

  const placementOptions = computePlacement();
  const cheapestOption = placementOptions[0]!;

  // Connect Provider Modal
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [newAccountName, setNewAccountName] = useState<string>('');
  const [newProvider, setNewProvider] = useState<'aws' | 'gcp' | 'azure'>('aws');
  const [newAccountId, setNewAccountId] = useState<string>('');

  const totalMonthlySpend = accounts.reduce((acc, a) => acc + a.monthlySpend, 0);
  const totalIdentifiedSavings = recommendations
    .filter((r) => r.status === 'pending')
    .reduce((acc, r) => acc + r.savingsMonthly, 0);

  const handleApplyRecommendation = (recId: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: 'applied' } : r))
    );
  };

  const handleConnectAccount = () => {
    if (!newAccountName.trim() || !newAccountId.trim()) return;
    const newAcc: CloudAccountItem = {
      id: `acc-${Date.now()}`,
      provider: newProvider,
      accountName: newAccountName.trim(),
      accountId: newAccountId.trim(),
      status: 'connected',
      monthlySpend: 2400.0,
      workloadCount: 6,
      regionPrimary: newProvider === 'aws' ? 'us-west-2' : newProvider === 'gcp' ? 'europe-west1' : 'westeurope',
    };
    setAccounts([...accounts, newAcc]);
    setIsConnectModalOpen(false);
    setNewAccountName('');
    setNewAccountId('');
  };

  return (
    <div className="nx-product-shell">
      {/* Header */}
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-cloudpilot)' }}>
            <span>☁️ CloudPilot</span>
            <span className="nx-pill-tag">Multi-Cloud Placement & Cost Optimizer</span>
          </div>
          <h1 className="nx-product-title">FinOps Cloud Placement & Cost Optimizer</h1>
          <p className="nx-product-desc">
            Intelligent workload placement arbitrage across AWS, GCP, and Azure, continuous SKU rightsizing, spot fleet migration, and automated waste elimination.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button variant="secondary" onClick={() => setActiveTab('calculator')}>
            ⚡ Placement Calculator
          </Button>
          <Button variant="primary" onClick={() => setIsConnectModalOpen(true)}>
            + Connect Cloud Provider
          </Button>
        </div>
      </div>

      {/* Live FinOps Protection Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--nx-cloudpilot)', boxShadow: '0 0 8px var(--nx-cloudpilot)' }} />
          <span>
            CloudPilot FinOps Engine: <strong>SYNCHRONIZED</strong> — Monitoring <strong>{accounts.length} connected accounts</strong> across 3 clouds with <strong>${totalIdentifiedSavings.toLocaleString()}/mo</strong> in actionable savings.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--nx-neutral-400)', fontSize: '0.8rem' }}>
          <span>AWS: <strong>$14,850</strong></span>
          <span>GCP: <strong>$8,420</strong></span>
          <span>Azure: <strong>$4,950</strong></span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="nx-product-grid-4">
        <Card>
          <div className="nx-stat-title">Total Monthly Cloud Burn</div>
          <div className="nx-stat-value">${totalMonthlySpend.toLocaleString()}</div>
          <div className="nx-stat-sub">Across AWS, GCP, and Azure</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Identified Wastage Savings</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-success-500)' }}>
            ${totalIdentifiedSavings.toLocaleString()} / mo
          </div>
          <div className="nx-stat-sub">
            {recommendations.filter((r) => r.status === 'pending').length} optimization recommendations ready
          </div>
        </Card>
        <Card>
          <div className="nx-stat-title">Realized Monthly Savings</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-brand-400)' }}>
            ${recommendations.filter((r) => r.status === 'applied').reduce((acc, r) => acc + r.savingsMonthly, 0).toLocaleString()} / mo
          </div>
          <div className="nx-stat-sub">From applied rightsizing actions</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Connected Cloud Accounts</div>
          <div className="nx-stat-value">{accounts.length}</div>
          <div className="nx-stat-sub">{accounts.reduce((acc, a) => acc + a.workloadCount, 0)} total monitored workloads</div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--nx-neutral-800)', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('spend')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'spend' ? '2px solid var(--nx-cloudpilot)' : '2px solid transparent',
            color: activeTab === 'spend' ? 'var(--nx-neutral-0)' : 'var(--nx-neutral-400)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Multi-Cloud Spend & Accounts ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab('advisor')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'advisor' ? '2px solid var(--nx-cloudpilot)' : '2px solid transparent',
            color: activeTab === 'advisor' ? 'var(--nx-neutral-0)' : 'var(--nx-neutral-400)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Rightsizing & Savings Advisor ({recommendations.filter((r) => r.status === 'pending').length} Actionable)
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'calculator' ? '2px solid var(--nx-cloudpilot)' : '2px solid transparent',
            color: activeTab === 'calculator' ? 'var(--nx-neutral-0)' : 'var(--nx-neutral-400)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Workload Placement Arbitrage
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'inventory' ? '2px solid var(--nx-cloudpilot)' : '2px solid transparent',
            color: activeTab === 'inventory' ? 'var(--nx-neutral-0)' : 'var(--nx-neutral-400)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Workload Inventory ({workloads.length})
        </button>
      </div>

      {/* TAB 1: MULTI-CLOUD SPEND & ACCOUNTS */}
      {activeTab === 'spend' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Multi-Cloud Spend Share Visual Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Multi-Cloud Cost Attribution Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                  <div style={{ width: '53%', backgroundColor: '#f59e0b' }} title="AWS: $14,850 (53%)" />
                  <div style={{ width: '30%', backgroundColor: '#3b82f6' }} title="GCP: $8,420 (30%)" />
                  <div style={{ width: '17%', backgroundColor: '#06b6d4' }} title="Azure: $4,950 (17%)" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--nx-neutral-400)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }} /> AWS: $14,850.00 (52.6%)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }} /> GCP: $8,420.00 (29.8%)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#06b6d4', borderRadius: '50%' }} /> Azure: $4,950.00 (17.5%)
                  </span>
                </div>
              </div>

              {/* Connected Accounts Table */}
              <div className="nx-table-wrap">
                <table className="nx-table">
                  <thead className="nx-table__header">
                    <tr>
                      <th className="nx-table__head-cell">Provider</th>
                      <th className="nx-table__head-cell">Account Name</th>
                      <th className="nx-table__head-cell">Account ID</th>
                      <th className="nx-table__head-cell">Primary Region</th>
                      <th className="nx-table__head-cell">Active Workloads</th>
                      <th className="nx-table__head-cell">Monthly Spend</th>
                      <th className="nx-table__head-cell">Sync Status</th>
                    </tr>
                  </thead>
                  <tbody className="nx-table__body">
                    {accounts.map((acc) => (
                      <tr key={acc.id} className="nx-table__row">
                        <td className="nx-table__cell">
                          <Badge
                            variant={
                              acc.provider === 'aws'
                                ? 'warning'
                                : acc.provider === 'gcp'
                                ? 'brand'
                                : 'gateflow'
                            }
                            size="sm"
                          >
                            {acc.provider.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="nx-table__cell">
                          <strong>{acc.accountName}</strong>
                        </td>
                        <td className="nx-table__cell">
                          <code>{acc.accountId}</code>
                        </td>
                        <td className="nx-table__cell">{acc.regionPrimary}</td>
                        <td className="nx-table__cell">{acc.workloadCount} resources</td>
                        <td className="nx-table__cell">
                          <strong style={{ color: 'var(--nx-neutral-100)' }}>
                            ${acc.monthlySpend.toLocaleString()}.00
                          </strong>
                        </td>
                        <td className="nx-table__cell">
                          <Badge variant="success" size="sm">
                            ● CONNECTED
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: RIGHTSITING & SAVINGS ADVISOR */}
      {activeTab === 'advisor' && (
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <CardTitle>Autonomous Cost Reduction Recommendations</CardTitle>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--nx-neutral-400)' }}>
                  Continuous rightsizing, spot fleet migration, and zombie instance reclamation analyzed across your workloads.
                </p>
              </div>
              <Badge variant="success" size="sm">
                Potential Savings: ${totalIdentifiedSavings.toLocaleString()}/mo
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem',
                    backgroundColor: 'var(--nx-neutral-900)',
                    border: '1px solid var(--nx-neutral-800)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <Badge
                        variant={
                          rec.provider === 'aws'
                            ? 'warning'
                            : rec.provider === 'gcp'
                            ? 'brand'
                            : 'gateflow'
                        }
                        size="sm"
                      >
                        {rec.provider.toUpperCase()}
                      </Badge>
                      <strong style={{ fontSize: '1rem', color: 'var(--nx-neutral-100)' }}>{rec.title}</strong>
                      <Badge variant="default" size="sm">{rec.recommendationType.toUpperCase()}</Badge>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--nx-neutral-300)', margin: '0 0 0.5rem 0' }}>
                      {rec.description}
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--nx-neutral-400)' }}>
                      <span>Current: <code>{rec.currentSku}</code> (${rec.currentMonthlyCost}/mo)</span>
                      <span>Target: <strong style={{ color: 'var(--nx-brand-300)' }}>{rec.recommendedSku}</strong></span>
                      <span>Projected: <strong>${rec.projectedMonthlyCost.toFixed(1)}/mo</strong></span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--nx-success-500)', marginBottom: '0.25rem' }}>
                      +${rec.savingsMonthly.toFixed(2)}/mo
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--nx-neutral-400)', marginBottom: '0.75rem' }}>
                      {rec.savingsPct}% Cost Reduction
                    </div>

                    {rec.status === 'applied' ? (
                      <Badge variant="success" size="md">
                        ✓ OPTIMIZATION APPLIED
                      </Badge>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApplyRecommendation(rec.id)}
                      >
                        Apply Optimization →
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: WORKLOAD PLACEMENT ARBITRAGE */}
      {activeTab === 'calculator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Spec Input Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Workload Compute Specification</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Required vCPU Cores: {calcCpu} vCPU
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="64"
                    step="2"
                    value={calcCpu}
                    onChange={(e) => setCalcCpu(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--nx-cloudpilot)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Required Memory: {calcRam} GB RAM
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="128"
                    step="4"
                    value={calcRam}
                    onChange={(e) => setCalcRam(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--nx-cloudpilot)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Dedicated Accelerators (GPU): {calcGpu} GPUs
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={calcGpu}
                    onChange={(e) => setCalcGpu(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--nx-cloudpilot)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Workload Fault Tolerance & Type
                  </label>
                  <select
                    value={calcWorkloadType}
                    onChange={(e) => setCalcWorkloadType(e.target.value as 'stateless_api' | 'batch_training' | 'transaction_db' | 'background_queue')}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--nx-neutral-900)',
                      color: 'var(--nx-neutral-100)',
                      border: '1px solid var(--nx-neutral-700)',
                      padding: '0.5rem',
                      borderRadius: '6px',
                    }}
                  >
                    <option value="stateless_api">Stateless Microservices API (Spot / Auto-Scaler Tolerant)</option>
                    <option value="batch_training">Batch Distributed ML Training (Spot Interrupt Tolerant)</option>
                    <option value="transaction_db">Mission-Critical Transactional DB (24/7 Reserved Commitment)</option>
                    <option value="background_queue">Background BullMQ Queue Workers (Burst Tolerant)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Arbitrage Comparison Output */}
          <Card>
            <CardHeader>
              <CardTitle>Cross-Cloud Placement Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Optimal Placement Banner */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  border: '1.5px solid var(--nx-success-500)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--nx-neutral-400)', textTransform: 'uppercase' }}>
                  BEST EFFICIENCY PLACEMENT
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--nx-neutral-0)', margin: '0.25rem 0' }}>
                  {cheapestOption.provider.toUpperCase()} • {cheapestOption.instanceSku} ({cheapestOption.recommendedModel.toUpperCase()})
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--nx-success-500)', fontWeight: 600 }}>
                  Projected: ${cheapestOption.projectedCost.toFixed(2)}/mo (Efficiency Score: {cheapestOption.efficiencyScore}/100)
                </div>
              </div>

              {/* Side-by-side Cloud Providers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {placementOptions.map((opt) => (
                  <div
                    key={opt.provider}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--nx-neutral-900)',
                      border: '1px solid var(--nx-neutral-800)',
                      borderRadius: '6px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <strong style={{ textTransform: 'uppercase' }}>{opt.provider}</strong>
                        <code>{opt.instanceSku}</code>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--nx-neutral-400)' }}>
                        On-Demand: ${opt.onDemandMonthly}/mo • Spot: ${opt.spotMonthly}/mo • 1-Yr RI: ${opt.reservedMonthly}/mo
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--nx-neutral-100)' }}>
                        ${opt.projectedCost}/mo
                      </div>
                      <Badge variant={opt.recommendedModel === 'spot' ? 'success' : 'brand'} size="sm">
                        {opt.recommendedModel.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: WORKLOAD INVENTORY */}
      {activeTab === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle>Cloud Infrastructure Workload Inventory</CardTitle>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--nx-neutral-400)' }}>
              Real-time resource utilization and monthly cost for all monitored cloud workloads.
            </p>
          </CardHeader>
          <CardContent>
            <div className="nx-table-wrap">
              <table className="nx-table">
                <thead className="nx-table__header">
                  <tr>
                    <th className="nx-table__head-cell">Workload Name</th>
                    <th className="nx-table__head-cell">Provider</th>
                    <th className="nx-table__head-cell">Type</th>
                    <th className="nx-table__head-cell">Region & SKU</th>
                    <th className="nx-table__head-cell">CPU Utilization</th>
                    <th className="nx-table__head-cell">Memory Utilization</th>
                    <th className="nx-table__head-cell">Monthly Cost</th>
                    <th className="nx-table__head-cell">Status</th>
                  </tr>
                </thead>
                <tbody className="nx-table__body">
                  {workloads.map((wl) => (
                    <tr key={wl.id} className="nx-table__row">
                      <td className="nx-table__cell">
                        <strong>{wl.name}</strong>
                      </td>
                      <td className="nx-table__cell">
                        <Badge
                          variant={
                            wl.provider === 'aws'
                              ? 'warning'
                              : wl.provider === 'gcp'
                              ? 'brand'
                              : 'gateflow'
                          }
                          size="sm"
                        >
                          {wl.provider.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="nx-table__cell">
                        <Badge variant="default" size="sm">{wl.serviceType.toUpperCase()}</Badge>
                      </td>
                      <td className="nx-table__cell">
                        <div>{wl.region}</div>
                        <code>{wl.currentSku}</code>
                      </td>
                      <td className="nx-table__cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600 }}>{wl.cpuUtilizationPct}%</span>
                          <span
                            style={{
                              width: '40px',
                              height: '4px',
                              backgroundColor: 'var(--nx-neutral-800)',
                              borderRadius: '2px',
                              overflow: 'hidden',
                              display: 'inline-block',
                            }}
                          >
                            <span
                              style={{
                                display: 'block',
                                width: `${wl.cpuUtilizationPct}%`,
                                height: '100%',
                                backgroundColor: wl.cpuUtilizationPct > 70 ? 'var(--nx-warning-500)' : 'var(--nx-success-500)',
                              }}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="nx-table__cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600 }}>{wl.memoryUtilizationPct}%</span>
                        </div>
                      </td>
                      <td className="nx-table__cell">
                        <strong>${wl.monthlyCost.toFixed(2)}</strong>
                      </td>
                      <td className="nx-table__cell">
                        <Badge variant={wl.status === 'running' ? 'success' : 'default'} size="sm">
                          {wl.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connect Account Modal */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title="Connect Cloud Provider Account"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Cloud Provider
            </label>
            <select
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value as 'aws' | 'gcp' | 'azure')}
              style={{
                width: '100%',
                backgroundColor: 'var(--nx-neutral-900)',
                color: 'var(--nx-neutral-100)',
                border: '1px solid var(--nx-neutral-700)',
                padding: '0.5rem',
                borderRadius: '6px',
              }}
            >
              <option value="aws">Amazon Web Services (AWS - IAM Role Cross-Account)</option>
              <option value="gcp">Google Cloud Platform (GCP - Workload Identity)</option>
              <option value="azure">Microsoft Azure (Azure - App Registration)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Account Friendly Name
            </label>
            <Input
              placeholder="e.g. Production AWS (us-west-2)"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Account ID / Project ID
            </label>
            <Input
              placeholder="e.g. 123456789012 or my-gcp-project-id"
              value={newAccountId}
              onChange={(e) => setNewAccountId(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsConnectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConnectAccount} disabled={!newAccountName.trim() || !newAccountId.trim()}>
              Connect & Sync Billing
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
