// ============================================================
// SyncSpace Unit Tests — Engine, OT Merge & Presence Resolver
// ============================================================

import { describe, it, expect } from 'vitest';
import { syncSpaceEngine } from '../../services/syncspace/engine.js';

describe('SyncSpaceEngine — Operational Transformation & Merge', () => {
  it('applies sequential insert and delete operations correctly', () => {
    const baseText = 'Hello World';
    // 1. Insert " Beautiful" at index 5
    // 2. Delete " World"
    const result = syncSpaceEngine.applyOperations(baseText, [
      { op: 'insert', position: 5, text: ' Beautiful' },
      { op: 'delete', position: 15, length: 6 },
    ]);

    expect(result).toBe('Hello Beautiful');
  });

  it('handles text replacement operations without boundary corruption', () => {
    const baseText = 'status: pending; timeout: 5000;';
    const result = syncSpaceEngine.applyOperations(baseText, [
      { op: 'replace', position: 8, length: 7, text: 'active' },
    ]);

    expect(result).toBe('status: active; timeout: 5000;');
  });

  it('performs 3-way merge on independent line changes without conflicts', () => {
    const baseText = ['# Title', 'Line 1', 'Line 2', 'Footer'].join('\n');
    const serverText = ['# Title (Updated)', 'Line 1', 'Line 2', 'Footer'].join('\n');
    const clientText = ['# Title', 'Line 1', 'Line 2 (Client Modified)', 'Footer'].join('\n');

    const result = syncSpaceEngine.resolve3WayMerge(baseText, serverText, clientText);

    expect(result.hasConflict).toBe(false);
    expect(result.conflictedBlocks).toHaveLength(0);
    expect(result.mergedText).toContain('# Title (Updated)');
    expect(result.mergedText).toContain('Line 2 (Client Modified)');
  });

  it('detects concurrent line conflicts and returns deterministic conflict metadata', () => {
    const baseText = ['Line A', 'Shared Line', 'Line C'].join('\n');
    const serverText = ['Line A', 'Server Edit', 'Line C'].join('\n');
    const clientText = ['Line A', 'Client Edit', 'Line C'].join('\n');

    const result = syncSpaceEngine.resolve3WayMerge(baseText, serverText, clientText);

    expect(result.hasConflict).toBe(true);
    expect(result.conflictedBlocks).toHaveLength(1);
    expect(result.conflictedBlocks[0]?.line).toBe(2);
    expect(result.conflictedBlocks[0]?.server).toBe('Server Edit');
    expect(result.conflictedBlocks[0]?.client).toBe('Client Edit');
  });
});

describe('SyncSpaceEngine — Presence & Heartbeats', () => {
  it('filters out stale presences older than specified timeout', () => {
    const now = Date.now();
    const presences = [
      {
        userId: 'usr-active-1',
        userName: 'Alex',
        userColor: '#6366f1',
        cursorLine: 12,
        cursorCh: 5,
        lastHeartbeat: new Date(now - 10000), // 10s ago (Active)
      },
      {
        userId: 'usr-stale-2',
        userName: 'Elena',
        userColor: '#ec4899',
        cursorLine: 4,
        cursorCh: 0,
        lastHeartbeat: new Date(now - 60000), // 60s ago (Stale)
      },
    ];

    const active = syncSpaceEngine.filterActivePresences(presences, 30000);
    expect(active).toHaveLength(1);
    expect(active[0]?.userId).toBe('usr-active-1');
  });

  it('assigns consistent deterministic colors to user IDs', () => {
    const colorA = syncSpaceEngine.getCollaboratorColor('user-alpha-99');
    const colorB = syncSpaceEngine.getCollaboratorColor('user-alpha-99');
    expect(colorA).toBe(colorB);
    expect(colorA).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('SyncSpaceEngine — Version Diff Summary', () => {
  it('computes accurate lines added and removed between versions', () => {
    const oldRev = 'Line 1\nLine 2\nLine 3';
    const newRev = 'Line 1\nLine 2 modified\nLine 3\nLine 4 new';

    const diff = syncSpaceEngine.computeDiffSummary(oldRev, newRev, 1, 2);

    expect(diff.baseVersion).toBe(1);
    expect(diff.targetVersion).toBe(2);
    expect(diff.linesAdded).toBe(2);
    expect(diff.linesRemoved).toBe(1);
    expect(diff.summary).toContain('+2 line(s) added, -1 line(s) removed.');
  });
});
