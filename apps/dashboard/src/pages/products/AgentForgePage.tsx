import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Modal, Input, FormField } from '@nexus-one/ui';

interface Workflow {
  id: string;
  name: string;
  status: 'published' | 'draft';
  nodesCount: number;
  lastRun: string;
  successRate: string;
}

export function AgentForgePage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'wf-1',
      name: 'Customer Support Autonomous Triage',
      status: 'published',
      nodesCount: 6,
      lastRun: '12m ago',
      successRate: '99.4%',
    },
    {
      id: 'wf-2',
      name: 'Code Review Security & AST Linter',
      status: 'published',
      nodesCount: 9,
      lastRun: '1h ago',
      successRate: '100%',
    },
    {
      id: 'wf-3',
      name: 'Multi-Model Fallback Summarizer',
      status: 'draft',
      nodesCount: 4,
      lastRun: 'Never',
      successRate: '—',
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newWfName, setNewWfName] = useState('');

  function handleCreateWorkflow(e: React.FormEvent) {
    e.preventDefault();
    if (!newWfName.trim()) return;

    setWorkflows([
      ...workflows,
      {
        id: `wf-${Date.now()}`,
        name: newWfName.trim(),
        status: 'draft',
        nodesCount: 2,
        lastRun: 'Just now',
        successRate: '—',
      },
    ]);
    setNewWfName('');
    setModalOpen(false);
  }

  return (
    <div className="nx-product-shell">
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-agentforge)' }}>
            <span>⚡ AgentForge</span>
            <span className="nx-pill-tag">AI Agent Orchestration</span>
          </div>
          <h1 className="nx-product-title">Agent Workflow Orchestration</h1>
          <p className="nx-product-desc">
            Assemble multi-step agent pipelines with tool execution, LLM routing, and human-in-the-loop approvals.
          </p>
        </div>

        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Create Workflow
        </Button>
      </div>

      <div className="nx-product-grid-3">
        <Card>
          <div className="nx-stat-title">Active Workflows</div>
          <div className="nx-stat-value">{workflows.length}</div>
          <div className="nx-stat-sub">Across active tenant</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Total Step Invocations</div>
          <div className="nx-stat-value">48,219</div>
          <div className="nx-stat-sub">Past 24 hours</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Avg Execution Time</div>
          <div className="nx-stat-value">1.42s</div>
          <div className="nx-stat-sub">p50 pipeline latency</div>
        </Card>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <CardHeader>
          <CardTitle>Configured Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="nx-table-wrap">
            <table className="nx-table">
              <thead className="nx-table__header">
                <tr>
                  <th className="nx-table__head-cell">Workflow Name</th>
                  <th className="nx-table__head-cell">Status</th>
                  <th className="nx-table__head-cell">Nodes</th>
                  <th className="nx-table__head-cell">Last Run</th>
                  <th className="nx-table__head-cell">Success Rate</th>
                  <th className="nx-table__head-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="nx-table__body">
                {workflows.map((wf) => (
                  <tr key={wf.id} className="nx-table__row">
                    <td className="nx-table__cell">
                      <strong>{wf.name}</strong>
                    </td>
                    <td className="nx-table__cell">
                      <Badge variant={wf.status === 'published' ? 'success' : 'default'} size="sm">
                        {wf.status}
                      </Badge>
                    </td>
                    <td className="nx-table__cell">{wf.nodesCount} nodes</td>
                    <td className="nx-table__cell">{wf.lastRun}</td>
                    <td className="nx-table__cell">{wf.successRate}</td>
                    <td className="nx-table__cell">
                      <Button variant="secondary" size="sm">
                        Open DAG Builder →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Agent Workflow"
        description="Initialize a visual DAG pipeline with start and output nodes."
      >
        <form onSubmit={handleCreateWorkflow}>
          <FormField label="Workflow Name" required>
            <Input
              type="text"
              value={newWfName}
              onChange={(e) => setNewWfName(e.target.value)}
              placeholder="e.g. Automated Bug Triage Agent"
              required
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create & Launch DAG
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
