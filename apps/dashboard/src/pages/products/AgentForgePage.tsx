import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Modal, Input, FormField, Select } from '@nexus-one/ui';

interface WorkflowNode {
  id: string;
  type: 'input' | 'prompt' | 'model' | 'tool' | 'approval' | 'output';
  label: string;
  config: {
    promptTemplate?: string;
    model?: string;
    toolName?: string;
    approvalRole?: string;
  };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'published' | 'draft';
  nodes: WorkflowNode[];
  lastRun: string;
  successRate: string;
}

interface StepExecution {
  nodeId: string;
  label: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'waiting_approval' | 'rejected';
  latencyMs: number;
  tokensUsed: number;
  output?: Record<string, unknown>;
}

export function AgentForgePage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeWf, setActiveWf] = useState<Workflow | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  // New Workflow modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');

  // Run Simulator modal
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [runInput, setRunInput] = useState('{"alert": "High CPU throttle detected on PostgreSQL replica 02"}');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<StepExecution[]>([]);
  const [approvalPending, setApprovalPending] = useState(false);

  function handleCreateWorkflow(e: React.FormEvent) {
    e.preventDefault();
    if (!newWfName.trim()) return;

    const newWf: Workflow = {
      id: `wf-${Date.now()}`,
      name: newWfName.trim(),
      description: newWfDesc.trim() || 'Custom agent workflow pipeline',
      status: 'draft',
      lastRun: 'Never',
      successRate: '—',
      nodes: [
        { id: 'n1', type: 'input', label: 'Input Payload', config: {} },
        { id: 'n2', type: 'prompt', label: 'Task Prompt', config: { promptTemplate: 'Process {{input}}' } },
        { id: 'n3', type: 'model', label: 'LLM Model Node', config: { model: 'gpt-4o' } },
        { id: 'n4', type: 'output', label: 'Output Results', config: {} },
      ],
    };

    setWorkflows([newWf, ...workflows]);
    setActiveWf(newWf);
    setSelectedNode(newWf.nodes[1] || null);
    setNewWfName('');
    setNewWfDesc('');
    setCreateModalOpen(false);
  }

  async function handleSimulateRun() {
    if (!activeWf) return;
    setIsExecuting(true);
    setApprovalPending(false);

    // Initialize pending steps
    const steps: StepExecution[] = activeWf.nodes.map((n) => ({
      nodeId: n.id,
      label: n.label,
      type: n.type,
      status: 'pending',
      latencyMs: 0,
      tokensUsed: 0,
    }));
    setExecutionSteps([...steps]);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!;
      step.status = 'running';
      setExecutionSteps([...steps]);

      await new Promise((r) => setTimeout(r, 450));

      if (step.type === 'approval') {
        step.status = 'waiting_approval';
        step.latencyMs = 450;
        setExecutionSteps([...steps]);
        setApprovalPending(true);
        setIsExecuting(false);
        return;
      }

      step.status = 'completed';
      step.latencyMs = Math.floor(Math.random() * 80) + 20;
      step.tokensUsed = step.type === 'model' ? 342 : step.type === 'prompt' ? 48 : 0;
      step.output = {
        result: `Output from ${step.label}`,
        status: 'ok',
        timestamp: new Date().toLocaleTimeString(),
      };
      setExecutionSteps([...steps]);
    }

    setIsExecuting(false);
  }

  function handleDecision(decision: 'approved' | 'rejected') {
    const updated = executionSteps.map((s) => {
      if (s.status === 'waiting_approval') {
        return {
          ...s,
          status: decision === 'approved' ? ('completed' as const) : ('rejected' as const),
          output: { decision, reviewer: 'admin@nexusone.dev' },
        };
      }
      return s;
    });

    if (decision === 'approved') {
      // Complete remaining steps
      updated.forEach((s) => {
        if (s.status === 'pending') {
          s.status = 'completed';
          s.latencyMs = 35;
          s.output = { result: 'Action executed successfully post-approval' };
        }
      });
    }

    setExecutionSteps(updated);
    setApprovalPending(false);
  }

  return (
    <div className="nx-product-shell">
      {/* Product Title Bar */}
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-agentforge)' }}>
            <span>⚡ AgentForge</span>
            <span className="nx-pill-tag">AI Agent Orchestration Platform</span>
          </div>
          <h1 className="nx-product-title">Agent Workflow DAG Builder</h1>
          <p className="nx-product-desc">
            Assemble multi-step agent pipelines with multi-model fallback, sandbox tool invocation, and human review gates.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" disabled={!activeWf} onClick={() => setRunModalOpen(true)}>
            ▶ Test Run Simulator
          </Button>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            + New Workflow
          </Button>
        </div>
      </div>

      {!activeWf ? (
        <Card style={{ padding: '4rem 2rem', textAlign: 'center', marginTop: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
          <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '0.5rem' }}>No Workflows Configured</h3>
          <p style={{ maxWidth: '460px', margin: '0 auto 1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            AgentForge orchestrates multi-agent pipelines with model fallback and tool executions. Create your first autonomous workflow pipeline to get started.
          </p>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            + Create Your First Workflow
          </Button>
        </Card>
      ) : (
        <>
          {/* Workflow Selector & Metadata */}
          <div className="nx-wf-selector-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Active Workflow:</span>
          <Select
            value={activeWf.id}
            onChange={(e) => {
              const found = workflows.find((w) => w.id === e.target.value);
              if (found) {
                setActiveWf(found);
                setSelectedNode(found.nodes[0] || null);
              }
            }}
            style={{ width: '320px' }}
          >
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.nodes.length} nodes)
              </option>
            ))}
          </Select>
          <Badge variant={activeWf.status === 'published' ? 'success' : 'default'} size="sm">
            {activeWf.status}
          </Badge>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
          <span>Last Run: <strong style={{ color: '#fff' }}>{activeWf.lastRun}</strong></span>
          <span>Success Rate: <strong style={{ color: '#4ade80' }}>{activeWf.successRate}</strong></span>
        </div>
      </div>

      {/* Visual DAG Canvas & Node Inspector Layout */}
      <div className="nx-dag-layout">
        {/* Canvas */}
        <div className="nx-dag-canvas">
          <div className="nx-dag-canvas__header">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>
              Directed Acyclic Graph (DAG) Pipeline
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Click any node to inspect parameters
            </span>
          </div>

          <div className="nx-dag-nodes-flow">
            {activeWf.nodes.map((node, idx) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div key={node.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    className={`nx-dag-node nx-dag-node--${node.type} ${isSelected ? 'nx-dag-node--selected' : ''}`}
                    onClick={() => setSelectedNode(node)}
                  >
                    <div className="nx-dag-node__type-pill">
                      <span>{node.type}</span>
                    </div>
                    <div className="nx-dag-node__title">{node.label}</div>
                    <div className="nx-dag-node__meta">
                      {node.type === 'model' && (node.config.model || 'gpt-4o')}
                      {node.type === 'tool' && (node.config.toolName || 'tool')}
                      {node.type === 'approval' && (node.config.approvalRole || 'admin')}
                      {node.type === 'prompt' && 'Template v1'}
                      {node.type === 'input' && 'Entry payload'}
                      {node.type === 'output' && 'Final JSON'}
                    </div>
                  </div>

                  {idx < activeWf.nodes.length - 1 && (
                    <div className="nx-dag-arrow">
                      <span>➔</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspector Panel */}
        <Card className="nx-node-inspector">
          <CardHeader>
            <CardTitle>Node Configuration Inspector</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div>
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong>{selectedNode.label}</strong>
                  <Badge variant="brand" size="sm">{selectedNode.type}</Badge>
                </div>

                {selectedNode.type === 'prompt' && (
                  <FormField label="Prompt Template (Supports {{variable}} interpolation)">
                    <textarea
                      className="nx-textarea"
                      rows={4}
                      value={selectedNode.config.promptTemplate || ''}
                      onChange={(e) => {
                        selectedNode.config.promptTemplate = e.target.value;
                        setSelectedNode({ ...selectedNode });
                      }}
                    />
                  </FormField>
                )}

                {selectedNode.type === 'model' && (
                  <>
                    <FormField label="Inference Model">
                      <Select
                        value={selectedNode.config.model || 'gpt-4o'}
                        onChange={(e) => {
                          selectedNode.config.model = e.target.value;
                          setSelectedNode({ ...selectedNode });
                        }}
                      >
                        <option value="gpt-4o">OpenAI GPT-4o</option>
                        <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                        <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                      </Select>
                    </FormField>
                    <FormField label="Temperature (0.0 to 1.0)">
                      <Input type="number" step="0.1" min="0" max="1" defaultValue="0.7" />
                    </FormField>
                  </>
                )}

                {selectedNode.type === 'tool' && (
                  <FormField label="Sandbox Tool Provider">
                    <Select
                      value={selectedNode.config.toolName || 'web_search'}
                      onChange={(e) => {
                        selectedNode.config.toolName = e.target.value;
                        setSelectedNode({ ...selectedNode });
                      }}
                    >
                      <option value="web_search">Cortex Vector / Web Search</option>
                      <option value="calculator">Mathematical Sandbox</option>
                      <option value="http_request">External REST API Call</option>
                      <option value="json_transform">JSON Schema Transform</option>
                    </Select>
                  </FormField>
                )}

                {selectedNode.type === 'approval' && (
                  <FormField label="Required Reviewer Role">
                    <Select
                      value={selectedNode.config.approvalRole || 'admin'}
                      onChange={(e) => {
                        selectedNode.config.approvalRole = e.target.value;
                        setSelectedNode({ ...selectedNode });
                      }}
                    >
                      <option value="owner">Organization Owner Only</option>
                      <option value="admin">Admin or Owner</option>
                      <option value="member">Any Member</option>
                    </Select>
                  </FormField>
                )}

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <Button variant="secondary" size="sm" style={{ width: '100%' }}>
                    Save Node Parameters
                  </Button>
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Select a node in the DAG to view properties.</p>
            )}
          </CardContent>
        </Card>
      </div>
      </>
      )}

      {/* Modal: New Workflow */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create AgentForge Workflow"
        description="Initialize a new autonomous DAG pipeline."
      >
        <form onSubmit={handleCreateWorkflow}>
          <FormField label="Workflow Name" required>
            <Input
              type="text"
              value={newWfName}
              onChange={(e) => setNewWfName(e.target.value)}
              placeholder="e.g. Real-Time Customer Query Specialist"
              required
            />
          </FormField>

          <FormField label="Description">
            <Input
              type="text"
              value={newWfDesc}
              onChange={(e) => setNewWfDesc(e.target.value)}
              placeholder="What does this autonomous pipeline achieve?"
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Initialize DAG
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Run Simulator */}
      <Modal
        isOpen={runModalOpen}
        onClose={() => setRunModalOpen(false)}
        title={`Execute Pipeline: ${activeWf?.name || 'Workflow'}`}
        description="Trigger a step-by-step test run through the DAG execution engine."
      >
        <div>
          <FormField label="Input Payload (JSON)">
            <textarea
              className="nx-textarea"
              rows={3}
              value={runInput}
              onChange={(e) => setRunInput(e.target.value)}
            />
          </FormField>

          <div style={{ marginBottom: '1.5rem' }}>
            <Button
              variant="primary"
              onClick={handleSimulateRun}
              loading={isExecuting}
              disabled={isExecuting}
              style={{ width: '100%' }}
            >
              {isExecuting ? 'Executing Workflow...' : '▶ Start Execution'}
            </Button>
          </div>

          {/* Execution Timeline */}
          {executionSteps.length > 0 && (
            <div className="nx-sim-steps">
              <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Live Execution Trace
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {executionSteps.map((s, idx) => (
                  <div key={idx} className={`nx-sim-step nx-sim-step--${s.status}`}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="nx-step-num">{idx + 1}</span>
                        <strong>{s.label}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({s.type})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {s.tokensUsed > 0 && (
                          <span style={{ fontSize: '0.7rem', color: '#818cf8' }}>{s.tokensUsed} tokens</span>
                        )}
                        {s.latencyMs > 0 && (
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{s.latencyMs}ms</span>
                        )}
                        <Badge
                          variant={
                            s.status === 'completed'
                              ? 'success'
                              : s.status === 'waiting_approval'
                              ? 'warning'
                              : s.status === 'running'
                              ? 'brand'
                              : 'default'
                          }
                          size="sm"
                        >
                          {s.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Human Approval Action Box */}
                    {s.status === 'waiting_approval' && approvalPending && (
                      <div className="nx-approval-gate">
                        <p style={{ fontSize: '0.8rem', color: '#fbbf24', marginBottom: '0.5rem' }}>
                          ⚠️ <strong>Human Gate Required:</strong> SRE Lead approval required before proceeding to remediation step.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Button variant="primary" size="sm" onClick={() => handleDecision('approved')}>
                            ✓ Approve Step
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDecision('rejected')}>
                            ✕ Reject & Abort
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
