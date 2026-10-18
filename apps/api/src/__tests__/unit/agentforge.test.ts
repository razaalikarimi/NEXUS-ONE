import { describe, it, expect } from 'vitest';
import { agentForgeEngine, type NodeItem, type EdgeItem } from '../../services/agentforge/engine.js';

describe('AgentForge DAG Execution Engine', () => {
  it('executes a linear pipeline (Input -> Prompt -> Model -> Output)', async () => {
    const nodes: NodeItem[] = [
      {
        id: 'node-1',
        nodeType: 'input',
        label: 'User Query',
        config: {},
      },
      {
        id: 'node-2',
        nodeType: 'prompt',
        label: 'System Prompt',
        config: {
          promptTemplate: 'Please triage incident report: {{incidentDetails}}',
        },
      },
      {
        id: 'node-3',
        nodeType: 'model',
        label: 'GPT-4o Inference',
        config: {
          model: 'gpt-4o',
        },
      },
      {
        id: 'node-4',
        nodeType: 'output',
        label: 'Final Response',
        config: {},
      },
    ];

    const edges: EdgeItem[] = [
      { id: 'e1', sourceNodeId: 'node-1', targetNodeId: 'node-2' },
      { id: 'e2', sourceNodeId: 'node-2', targetNodeId: 'node-3' },
      { id: 'e3', sourceNodeId: 'node-3', targetNodeId: 'node-4' },
    ];

    const initialInputs = {
      incidentDetails: 'Database latency spike observed on primary reader',
    };

    const result = await agentForgeEngine.executeWorkflow(nodes, edges, initialInputs);

    expect(result.status).toBe('completed');
    expect(result.stepTraces).toHaveLength(4);
    expect(result.stepTraces[0]?.nodeType).toBe('input');
    expect(result.stepTraces[1]?.nodeType).toBe('prompt');
    expect(result.stepTraces[2]?.nodeType).toBe('model');
    expect(result.stepTraces[3]?.nodeType).toBe('output');
    expect(result.totalTokens).toBeGreaterThan(0);
    expect(result.totalLatencyMs).toBeGreaterThanOrEqual(0);
  });

  it('executes sandbox tool nodes correctly', async () => {
    const nodes: NodeItem[] = [
      {
        id: 'n-input',
        nodeType: 'input',
        label: 'Start',
        config: {},
      },
      {
        id: 'n-calc',
        nodeType: 'tool',
        label: 'Calculator Tool',
        config: {
          toolName: 'calculator',
        },
      },
      {
        id: 'n-out',
        nodeType: 'output',
        label: 'Output',
        config: {},
      },
    ];

    const edges: EdgeItem[] = [
      { id: 'e1', sourceNodeId: 'n-input', targetNodeId: 'n-calc' },
      { id: 'e2', sourceNodeId: 'n-calc', targetNodeId: 'n-out' },
    ];

    const result = await agentForgeEngine.executeWorkflow(nodes, edges, { x: 10, y: 32 });

    expect(result.status).toBe('completed');
    const toolStep = result.stepTraces.find((s) => s.nodeId === 'n-calc');
    expect(toolStep).toBeDefined();
    expect(toolStep?.output['result']).toBe(42);
    expect(toolStep?.output['executedTool']).toBe('calculator');
  });

  it('pauses workflow on human approval node', async () => {
    const nodes: NodeItem[] = [
      {
        id: 'n-in',
        nodeType: 'input',
        label: 'Start',
        config: {},
      },
      {
        id: 'n-appr',
        nodeType: 'approval',
        label: 'Security Lead Review',
        config: {
          approvalRole: 'admin',
        },
      },
      {
        id: 'n-out',
        nodeType: 'output',
        label: 'End',
        config: {},
      },
    ];

    const edges: EdgeItem[] = [
      { id: 'e1', sourceNodeId: 'n-in', targetNodeId: 'n-appr' },
      { id: 'e2', sourceNodeId: 'n-appr', targetNodeId: 'n-out' },
    ];

    const result = await agentForgeEngine.executeWorkflow(nodes, edges, { action: 'deploy_to_prod' });

    expect(result.status).toBe('waiting_approval');
    expect(result.stepTraces).toHaveLength(2); // input and approval, stopped before output
    const approvalStep = result.stepTraces[1];
    expect(approvalStep?.status).toBe('waiting_approval');
    expect(approvalStep?.output['requiredRole']).toBe('admin');
  });
});
