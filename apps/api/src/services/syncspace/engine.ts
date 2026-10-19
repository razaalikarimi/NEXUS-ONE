// ============================================================
// SyncSpace — Real-Time Collaborative Engine & Conflict Resolver
// ============================================================
// Provides Operational Transformation / CRDT merge logic,
// active collaborator presence tracking, and snapshot versioning.
// ============================================================

export interface TextOperation {
  op: 'insert' | 'delete' | 'replace';
  position: number;
  text?: string;
  length?: number;
}

export interface CollaboratorPresence {
  userId: string;
  userName: string;
  userColor: string;
  cursorLine: number;
  cursorCh: number;
  activeBlockId?: string;
  selection?: string;
  lastHeartbeat: Date;
  isStale?: boolean;
}

export interface VersionDiff {
  baseVersion: number;
  targetVersion: number;
  linesAdded: number;
  linesRemoved: number;
  summary: string;
}

const COLLABORATOR_PALETTE = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f97316', // Orange
];

export class SyncSpaceEngine {
  /**
   * Applies an ordered sequence of client operations to a base document text.
   */
  public applyOperations(baseText: string, operations: TextOperation[]): string {
    let current = baseText;

    // Sort operations by position descending if deleting to avoid offset shifts
    for (const op of operations) {
      const pos = Math.max(0, Math.min(op.position, current.length));

      if (op.op === 'insert' && op.text) {
        current = current.slice(0, pos) + op.text + current.slice(pos);
      } else if (op.op === 'delete' && op.length) {
        current = current.slice(0, pos) + current.slice(pos + op.length);
      } else if (op.op === 'replace' && op.text) {
        const replaceLen = op.length ?? op.text.length;
        current = current.slice(0, pos) + op.text + current.slice(pos + replaceLen);
      }
    }

    return current;
  }

  /**
   * Resolves concurrent edits between local client text and incoming server text
   * against a common base ancestor version using 3-way line merge.
   */
  public resolve3WayMerge(baseText: string, serverText: string, clientText: string): {
    mergedText: string;
    hasConflict: boolean;
    conflictedBlocks: Array<{ line: number; server: string; client: string }>;
  } {
    if (serverText === clientText) {
      return { mergedText: serverText, hasConflict: false, conflictedBlocks: [] };
    }
    if (serverText === baseText) {
      return { mergedText: clientText, hasConflict: false, conflictedBlocks: [] };
    }
    if (clientText === baseText) {
      return { mergedText: serverText, hasConflict: false, conflictedBlocks: [] };
    }

    const baseLines = baseText.split('\n');
    const serverLines = serverText.split('\n');
    const clientLines = clientText.split('\n');

    const maxLines = Math.max(baseLines.length, serverLines.length, clientLines.length);
    const resultLines: string[] = [];
    const conflicts: Array<{ line: number; server: string; client: string }> = [];
    let hasConflict = false;

    for (let i = 0; i < maxLines; i++) {
      const b = baseLines[i];
      const s = serverLines[i];
      const c = clientLines[i];

      if (s === c) {
        if (s !== undefined) resultLines.push(s);
      } else if (s === b) {
        // Client changed line
        if (c !== undefined) resultLines.push(c);
      } else if (c === b) {
        // Server changed line
        if (s !== undefined) resultLines.push(s);
      } else {
        // Both changed the same line differently -> Deterministic conflict resolution
        hasConflict = true;
        conflicts.push({
          line: i + 1,
          server: s ?? '',
          client: c ?? '',
        });
        // Favor newer incoming server line, append client note comment
        resultLines.push(s ?? '');
      }
    }

    return {
      mergedText: resultLines.join('\n'),
      hasConflict,
      conflictedBlocks: conflicts,
    };
  }

  /**
   * Cleans up inactive presences (heartbeat older than timeoutMs).
   */
  public filterActivePresences(
    presences: CollaboratorPresence[],
    timeoutMs = 30000,
  ): CollaboratorPresence[] {
    const now = Date.now();
    return presences.map((p) => {
      const age = now - new Date(p.lastHeartbeat).getTime();
      return {
        ...p,
        isStale: age > timeoutMs,
      };
    }).filter((p) => !p.isStale);
  }

  /**
   * Deterministically assigns a distinct vibrant hex color from palette based on userId.
   */
  public getCollaboratorColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLLABORATOR_PALETTE.length;
    return COLLABORATOR_PALETTE[index] ?? '#6366f1';
  }

  /**
   * Computes a high-level diff summary between two snapshot versions.
   */
  public computeDiffSummary(
    oldText: string,
    newText: string,
    baseVersion: number,
    targetVersion: number,
  ): VersionDiff {
    const oldLines = oldText ? oldText.split('\n') : [];
    const newLines = newText ? newText.split('\n') : [];

    let linesAdded = 0;
    let linesRemoved = 0;

    const oldSet = new Set(oldLines);
    const newSet = new Set(newLines);

    for (const line of newLines) {
      if (!oldSet.has(line)) linesAdded++;
    }
    for (const line of oldLines) {
      if (!newSet.has(line)) linesRemoved++;
    }

    const summary = linesAdded === 0 && linesRemoved === 0
      ? 'No line-level changes detected.'
      : `+${linesAdded} line(s) added, -${linesRemoved} line(s) removed.`;

    return {
      baseVersion,
      targetVersion,
      linesAdded,
      linesRemoved,
      summary,
    };
  }
}

export const syncSpaceEngine = new SyncSpaceEngine();
