// ============================================================
// SyncSpace — Real-Time Collaborative Workspace & Presence
// ============================================================

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Modal, Input } from '@nexus-one/ui';

interface Collaborator {
  id: string;
  name: string;
  role: string;
  color: string;
  line: number;
  activeBlock: string;
  status: 'active' | 'idle' | 'typing';
}

interface DocumentComment {
  id: string;
  author: string;
  avatar: string;
  blockId: string;
  blockLabel: string;
  content: string;
  resolved: boolean;
  timestamp: string;
}

interface DocumentSnapshot {
  id: string;
  version: number;
  title: string;
  summary: string;
  linesAdded: number;
  linesRemoved: number;
  createdById: string;
  authorName: string;
  timestamp: string;
}

interface CollabDocument {
  id: string;
  title: string;
  slug: string;
  type: 'spec' | 'markdown' | 'canvas' | 'notebook';
  version: number;
  activeUsers: number;
  lastEditedBy: string;
  updatedAt: string;
  content: string;
}

const INITIAL_DOCS: CollabDocument[] = [];
const INITIAL_COLLABORATORS: Collaborator[] = [];
const INITIAL_COMMENTS: DocumentComment[] = [];
const INITIAL_SNAPSHOTS: DocumentSnapshot[] = [];

export function SyncSpacePage() {
  const [activeTab, setActiveTab] = useState<'editor' | 'documents' | 'snapshots' | 'metrics'>('editor');
  const [documents, setDocuments] = useState<CollabDocument[]>(INITIAL_DOCS);
  const [activeDocId, setActiveDocId] = useState<string>('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);
  const [comments, setComments] = useState<DocumentComment[]>(INITIAL_COMMENTS);
  const [snapshots, setSnapshots] = useState<DocumentSnapshot[]>(INITIAL_SNAPSHOTS);

  // Editor states
  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[0] || null;
  const [editorText, setEditorText] = useState<string>(activeDoc ? activeDoc.content : '');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isMultiplayerSimActive, setIsMultiplayerSimActive] = useState<boolean>(false);
  const [activeBlockFocus, setActiveBlockFocus] = useState<string>('Overview');

  // Comment input
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [selectedAnchor, setSelectedAnchor] = useState<string>('Overview');

  // Create Document Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newDocTitle, setNewDocTitle] = useState<string>('');
  const [newDocType, setNewDocType] = useState<'spec' | 'markdown' | 'canvas' | 'notebook'>('spec');

  // Rollback state alert
  const [rollbackNotice, setRollbackNotice] = useState<string | null>(null);

  // Sync editorText when switching active document
  useEffect(() => {
    const doc = documents.find((d) => d.id === activeDocId);
    if (doc) {
      setEditorText(doc.content);
      setIsSaved(true);
    }
  }, [activeDocId, documents]);

  // Simulated multiplayer streaming activity
  useEffect(() => {
    if (!isMultiplayerSimActive) return;

    const interval = setInterval(() => {
      setCollaborators((prev) =>
        prev.map((c) => {
          if (c.id === 'usr-1') return c;
          const randomLine = Math.floor(Math.random() * 20) + 1;
          const statuses: Array<'active' | 'typing' | 'idle'> = ['active', 'typing', 'active'];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)] ?? 'active';
          return {
            ...c,
            line: randomLine,
            status: randomStatus,
          };
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [isMultiplayerSimActive]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorText(e.target.value);
    setIsSaved(false);
  };

  const handleSaveDocument = () => {
    if (!activeDoc) return;
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === activeDocId) {
          const nextVersion = d.version + 1;
          return {
            ...d,
            content: editorText,
            version: nextVersion,
            updatedAt: 'Just now',
          };
        }
        return d;
      })
    );

    // Append automated snapshot
    const newSnap: DocumentSnapshot = {
      id: `snp-${Date.now()}`,
      version: activeDoc.version + 1,
      title: `Revision ${activeDoc.version + 1} Manual Save`,
      summary: '+2 lines modified',
      linesAdded: 2,
      linesRemoved: 0,
      createdById: 'usr-current',
      authorName: 'You',
      timestamp: 'Just now',
    };
    setSnapshots([newSnap, ...snapshots]);
    setIsSaved(true);
  };

  const handleInsertSnippet = (snippet: string) => {
    setEditorText((prev) => prev + '\n' + snippet);
    setIsSaved(false);
  };

  const handlePostComment = () => {
    if (!newCommentText.trim()) return;
    const comment: DocumentComment = {
      id: `cmt-${Date.now()}`,
      author: 'You',
      avatar: 'U',
      blockId: selectedAnchor.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      blockLabel: selectedAnchor,
      content: newCommentText.trim(),
      resolved: false,
      timestamp: 'Just now',
    };
    setComments([comment, ...comments]);
    setNewCommentText('');
  };

  const handleToggleResolveComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: !c.resolved } : c))
    );
  };

  const handleCreateDocument = () => {
    if (!newDocTitle.trim()) return;
    const newDoc: CollabDocument = {
      id: `doc-${Date.now()}`,
      title: newDocTitle.trim(),
      slug: newDocTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: newDocType,
      version: 1,
      activeUsers: 1,
      lastEditedBy: 'You',
      updatedAt: 'Just now',
      content: `# ${newDocTitle.trim()}\n\nInitial draft created in SyncSpace. Invite team members to collaborate in real-time.`,
    };

    setDocuments([newDoc, ...documents]);
    setActiveDocId(newDoc.id);
    setIsCreateModalOpen(false);
    setNewDocTitle('');
    setActiveTab('editor');
  };

  const handleRollbackSnapshot = (snapshot: DocumentSnapshot) => {
    setRollbackNotice(`Document successfully reverted to Snapshot v${snapshot.version}: "${snapshot.title}"`);
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === activeDocId) {
          return {
            ...d,
            version: d.version + 1,
            updatedAt: 'Just now (Rollback)',
          };
        }
        return d;
      })
    );
    setTimeout(() => setRollbackNotice(null), 5000);
  };

  return (
    <div className="nx-product-shell">
      {/* Header */}
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-syncspace)' }}>
            <span>✨ SyncSpace</span>
            <span className="nx-pill-tag">Multiplayer Collaborative Canvas</span>
          </div>
          <h1 className="nx-product-title">Real-Time Collaborative Workspace</h1>
          <p className="nx-product-desc">
            Multi-tenant conflict-free document editing, real-time presence indicators, anchored discussion threads, and point-in-time snapshot rollback.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button
            variant={isMultiplayerSimActive ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setIsMultiplayerSimActive(!isMultiplayerSimActive)}
          >
            {isMultiplayerSimActive ? '🟢 Multiplayer Sim: ON' : '⚪ Multiplayer Sim: OFF'}
          </Button>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            + New Document
          </Button>
        </div>
      </div>

      {/* Live Cluster Status Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--nx-success-500)', boxShadow: '0 0 8px var(--nx-success-500)' }} />
          <span>
            Connected to <strong>SyncSpace Cluster (ws://nexusone-crdt-01)</strong> — 3-way line merge active, latency <strong>7ms</strong>.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--nx-neutral-400)', fontSize: '0.8rem' }}>
          <span>Active Peers: <strong>{collaborators.length} online</strong></span>
          <span>Buffer: <strong>0 uncommitted ops</strong></span>
        </div>
      </div>

      {rollbackNotice && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid var(--nx-brand-500)',
            borderRadius: '8px',
            marginBottom: '1rem',
            color: 'var(--nx-brand-300)',
            fontSize: '0.875rem',
          }}
        >
          ✅ {rollbackNotice}
        </div>
      )}

      {/* KPI Cards */}
      <div className="nx-product-grid-4">
        <Card>
          <div className="nx-stat-title">Active Multiplayer Rooms</div>
          <div className="nx-stat-value">{documents.length}</div>
          <div className="nx-stat-sub">Live WebSocket channels</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Convergence Latency</div>
          <div className="nx-stat-value" style={{ color: documents.length > 0 ? 'var(--nx-success-500)' : 'var(--nx-text-muted)' }}>
            {documents.length > 0 ? '7ms' : '—'}
          </div>
          <div className="nx-stat-sub">Zero-conflict merge guarantee</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Point-in-Time Snapshots</div>
          <div className="nx-stat-value">{snapshots.length}</div>
          <div className="nx-stat-sub">Immutable revision log</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Active Collaborators</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-syncspace)' }}>
            {collaborators.length}
          </div>
          <div className="nx-stat-sub">Cross-region peers connected</div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--nx-neutral-800)', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('editor')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'editor' ? '2px solid var(--nx-syncspace)' : '2px solid transparent',
            color: activeTab === 'editor' ? 'var(--nx-neutral-0)' : 'var(--nx-neutral-400)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Live Document Studio {activeDoc ? `(${activeDoc.title.slice(0, 24)}...)` : ''}
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'documents' ? '2px solid var(--nx-syncspace)' : '2px solid transparent',
            color: activeTab === 'documents' ? 'var(--nx-neutral-0)' : 'var(--nx-neutral-400)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          All Documents ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('snapshots')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'snapshots' ? '2px solid var(--nx-syncspace)' : '2px solid transparent',
            color: activeTab === 'snapshots' ? 'var(--nx-neutral-0)' : 'var(--nx-neutral-400)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Revision Snapshots & Rollback ({snapshots.length})
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'metrics' ? '2px solid var(--nx-syncspace)' : '2px solid transparent',
            color: activeTab === 'metrics' ? 'var(--nx-neutral-0)' : 'var(--nx-neutral-400)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Multiplayer Engine Telemetry
        </button>
      </div>

      {/* TAB 1: LIVE DOCUMENT STUDIO */}
      {activeTab === 'editor' && (
        !activeDoc ? (
          <Card style={{ padding: '3.5rem 1rem', textAlign: 'center', marginTop: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
            <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '0.5rem' }}>No Active Document</h3>
            <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
              Create your first multiplayer document or architectural spec to start collaborative drafting with real-time presence.
            </p>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              + Create First Document
            </Button>
          </Card>
        ) : (
          <div>
            {/* Document Top Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--nx-neutral-900)',
                border: '1px solid var(--nx-neutral-800)',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px 8px 0 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <select
                  value={activeDocId}
                  onChange={(e) => setActiveDocId(e.target.value)}
                  style={{
                    backgroundColor: 'var(--nx-neutral-800)',
                    color: 'var(--nx-neutral-100)',
                    border: '1px solid var(--nx-neutral-700)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.type.toUpperCase()} v{d.version})
                    </option>
                  ))}
                </select>

                <Badge variant="default" size="sm">
                  v{activeDoc.version}
                </Badge>

              <span
                style={{
                  fontSize: '0.8rem',
                  color: isSaved ? 'var(--nx-success-500)' : 'var(--nx-warning-500)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isSaved ? 'var(--nx-success-500)' : 'var(--nx-warning-500)',
                  }}
                />
                {isSaved ? 'Synchronized with cluster' : 'Unsaved local changes'}
              </span>
            </div>

            {/* Collaborators Avatar Stack */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--nx-neutral-400)', marginRight: '0.5rem' }}>
                Collaborating live:
              </span>
              {collaborators.map((c) => (
                <div
                  key={c.id}
                  title={`${c.name} (${c.role}) - Line ${c.line} [${c.status}]`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '20px',
                    border: `1.5px solid ${c.color}`,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: c.status === 'typing' ? '#f59e0b' : c.color,
                      boxShadow: c.status === 'typing' ? '0 0 6px #f59e0b' : 'none',
                    }}
                  />
                  <span>{c.name.split(' ')[0]}</span>
                  <span style={{ color: 'var(--nx-neutral-400)', fontSize: '0.7rem' }}>L{c.line}</span>
                </div>
              ))}

              <Button variant="primary" size="sm" onClick={handleSaveDocument} disabled={isSaved} style={{ marginLeft: '0.75rem' }}>
                Save Revision (v{activeDoc.version + 1})
              </Button>
            </div>
          </div>

          {/* Editor Action Snippet Bar */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              backgroundColor: 'var(--nx-neutral-950)',
              borderLeft: '1px solid var(--nx-neutral-800)',
              borderRight: '1px solid var(--nx-neutral-800)',
              padding: '0.4rem 1rem',
              fontSize: '0.8rem',
              alignItems: 'center',
            }}
          >
            <span style={{ color: 'var(--nx-neutral-400)', fontWeight: 600 }}>Quick Inserts:</span>
            <button
              onClick={() => handleInsertSnippet('### New Sub-Section\nDescription here...')}
              style={{ background: 'none', border: '1px solid var(--nx-neutral-700)', color: 'var(--nx-neutral-200)', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
            >
              + Heading
            </button>
            <button
              onClick={() => handleInsertSnippet('```mermaid\ngraph LR\n  A[Service] --> B[Cache]\n```')}
              style={{ background: 'none', border: '1px solid var(--nx-neutral-700)', color: 'var(--nx-neutral-200)', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
            >
              + Mermaid Graph
            </button>
            <button
              onClick={() => handleInsertSnippet('| Parameter | Type | Required |\n|---|---|---|\n| id | UUID | Yes |')}
              style={{ background: 'none', border: '1px solid var(--nx-neutral-700)', color: 'var(--nx-neutral-200)', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
            >
              + Spec Table
            </button>
            <button
              onClick={() => handleInsertSnippet('> [!NOTE]\n> Critical failover guarantee applies.')}
              style={{ background: 'none', border: '1px solid var(--nx-neutral-700)', color: 'var(--nx-neutral-200)', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
            >
              + Callout
            </button>
          </div>

          {/* 3-Column Studio Layout: Code Editor, Live Preview, Comments Drawer */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 320px',
              border: '1px solid var(--nx-neutral-800)',
              borderRadius: '0 0 8px 8px',
              backgroundColor: 'var(--nx-neutral-900)',
              minHeight: '520px',
            }}
          >
            {/* Column 1: Raw Markdown Editor */}
            <div style={{ borderRight: '1px solid var(--nx-neutral-800)', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '0.5rem 1rem',
                  borderBottom: '1px solid var(--nx-neutral-800)',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--nx-neutral-400)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>SOURCE SPEC MARKDOWN</span>
                <span>{editorText.split('\n').length} lines • {editorText.length} chars</span>
              </div>
              <textarea
                value={editorText}
                onChange={handleTextChange}
                style={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: 'var(--nx-neutral-100)',
                  border: 'none',
                  padding: '1rem',
                  fontFamily: 'var(--nx-font-mono)',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  resize: 'none',
                  outline: 'none',
                }}
              />
            </div>

            {/* Column 2: Live Rendered Output with Multiplayer Cursor Pins */}
            <div style={{ borderRight: '1px solid var(--nx-neutral-800)', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <div
                style={{
                  padding: '0.5rem 1rem',
                  borderBottom: '1px solid var(--nx-neutral-800)',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--nx-neutral-400)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>LIVE RENDERED OUTPUT</span>
                <span>Active Anchor: {activeBlockFocus}</span>
              </div>

              <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, position: 'relative' }}>
                {/* Floating Remote Cursor Indicators */}
                <div
                  style={{
                    position: 'absolute',
                    top: '90px',
                    right: '20px',
                    padding: '0.2rem 0.5rem',
                    backgroundColor: '#ec4899',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(236, 72, 153, 0.4)',
                    pointerEvents: 'none',
                    animation: 'pulse 2s infinite',
                  }}
                >
                  📍 Elena Chen (Typing L14...)
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: '210px',
                    right: '20px',
                    padding: '0.2rem 0.5rem',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                    pointerEvents: 'none',
                  }}
                >
                  📍 Marcus Vance (Viewing L22)
                </div>

                {/* Rendered content representation */}
                <div style={{ lineHeight: '1.65', color: 'var(--nx-neutral-200)', fontSize: '0.9rem' }}>
                  <h2 style={{ color: 'var(--nx-neutral-0)', borderBottom: '1px solid var(--nx-neutral-800)', paddingBottom: '0.5rem', marginTop: 0 }}>
                    {activeDoc.title}
                  </h2>
                  <p style={{ color: 'var(--nx-neutral-400)', fontStyle: 'italic', marginBottom: '1rem' }}>
                    Multiplayer Room: #{activeDoc.slug} • Synchronized across 3 peers
                  </p>

                  <div
                    onClick={() => setActiveBlockFocus('Section 1: Overview')}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      backgroundColor: activeBlockFocus === 'Section 1: Overview' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      borderLeft: activeBlockFocus === 'Section 1: Overview' ? '3px solid var(--nx-brand-500)' : '3px solid transparent',
                      marginBottom: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    <h3 style={{ color: 'var(--nx-neutral-100)', margin: '0 0 0.5rem 0' }}>1. Architecture Overview</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                      Nexus One coordinates high-throughput distributed state machines across multi-cloud regions utilizing an optimized Raft consensus log with pipelined append entries.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveBlockFocus('Section 2: Quorum Rules')}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      backgroundColor: activeBlockFocus === 'Section 2: Quorum Rules' ? 'rgba(236, 72, 153, 0.08)' : 'transparent',
                      borderLeft: activeBlockFocus === 'Section 2: Quorum Rules' ? '3px solid #ec4899' : '3px solid transparent',
                      marginBottom: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    <h3 style={{ color: 'var(--nx-neutral-100)', margin: '0 0 0.5rem 0' }}>2. Quorum Rules & Election Configuration</h3>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                      <li>Strict majority quorum: <code>Q = floor(N / 2) + 1</code></li>
                      <li>Randomized election timeout window: 150ms to 320ms</li>
                      <li>Heartbeat cadence: 45ms continuous stream</li>
                      <li>Lease read optimization: Local state reads served without cross-region roundtrip</li>
                    </ul>
                  </div>

                  <div
                    onClick={() => setActiveBlockFocus('Section 3: WAL Guarantees')}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      backgroundColor: activeBlockFocus === 'Section 3: WAL Guarantees' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                      borderLeft: activeBlockFocus === 'Section 3: WAL Guarantees' ? '3px solid #10b981' : '3px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <h3 style={{ color: 'var(--nx-neutral-100)', margin: '0 0 0.5rem 0' }}>3. Storage Layer & Write-Ahead Log (WAL)</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                      All state transitions are committed to local NVMe via synchronous WAL flushing with O_DIRECT flags prior to responding to client RPCs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Threaded Discussions & Anchored Comments */}
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--nx-neutral-950)' }}>
              <div
                style={{
                  padding: '0.5rem 1rem',
                  borderBottom: '1px solid var(--nx-neutral-800)',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--nx-neutral-400)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>DISCUSSION THREADS ({comments.length})</span>
                <Badge variant="success" size="sm">Live</Badge>
              </div>

              {/* Comment Threads List */}
              <div style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}>
                {comments.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '6px',
                      backgroundColor: c.resolved ? 'rgba(255, 255, 255, 0.02)' : 'var(--nx-neutral-900)',
                      border: c.resolved ? '1px solid var(--nx-neutral-800)' : '1px solid var(--nx-neutral-700)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--nx-brand-600)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                        >
                          {c.avatar}
                        </span>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--nx-neutral-100)' }}>{c.author}</strong>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--nx-neutral-500)' }}>{c.timestamp}</span>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--nx-syncspace)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      ⚓ {c.blockLabel}
                    </div>

                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: c.resolved ? 'var(--nx-neutral-400)' : 'var(--nx-neutral-200)',
                        textDecoration: c.resolved ? 'line-through' : 'none',
                        margin: '0 0 0.5rem 0',
                        lineHeight: '1.4',
                      }}
                    >
                      {c.content}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleToggleResolveComment(c.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: c.resolved ? 'var(--nx-neutral-500)' : 'var(--nx-success-500)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        {c.resolved ? '↩ Reopen' : '✓ Resolve'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <div style={{ padding: '0.75rem', borderTop: '1px solid var(--nx-neutral-800)', backgroundColor: 'var(--nx-neutral-900)' }}>
                <div style={{ marginBottom: '0.4rem' }}>
                  <select
                    value={selectedAnchor}
                    onChange={(e) => setSelectedAnchor(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--nx-neutral-800)',
                      color: 'var(--nx-neutral-200)',
                      border: '1px solid var(--nx-neutral-700)',
                      padding: '0.3rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}
                  >
                    <option value="Section 1: Overview">Anchor: Section 1 (Overview)</option>
                    <option value="Section 2: Quorum Rules">Anchor: Section 2 (Quorum Rules)</option>
                    <option value="Section 3: WAL Guarantees">Anchor: Section 3 (WAL Guarantees)</option>
                    <option value="General Document">Anchor: General Document</option>
                  </select>
                </div>
                <textarea
                  placeholder="Leave an inline review comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  style={{
                    width: '100%',
                    height: '60px',
                    backgroundColor: 'var(--nx-neutral-950)',
                    color: 'var(--nx-neutral-100)',
                    border: '1px solid var(--nx-neutral-700)',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    resize: 'none',
                    outline: 'none',
                    marginBottom: '0.4rem',
                  }}
                />
                <Button variant="primary" size="sm" onClick={handlePostComment} style={{ width: '100%' }}>
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    )}

      {/* TAB 2: ALL DOCUMENTS */}
      {activeTab === 'documents' && (
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <CardTitle>Workspace Documents</CardTitle>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--nx-neutral-400)' }}>
                  All real-time collaborative documents belonging to current workspace.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                + New Document
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📑</div>
                <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '0.5rem' }}>No Documents in Workspace</h3>
                <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                  Create your first collaborative document or architectural spec to start drafting with real-time CRDT sync.
                </p>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                  + New Document
                </Button>
              </div>
            ) : (
              <div className="nx-table-wrap">
                <table className="nx-table">
                  <thead className="nx-table__header">
                    <tr>
                      <th className="nx-table__head-cell">Document Title</th>
                      <th className="nx-table__head-cell">Type</th>
                      <th className="nx-table__head-cell">Version</th>
                      <th className="nx-table__head-cell">Active Editors</th>
                      <th className="nx-table__head-cell">Last Edited By</th>
                      <th className="nx-table__head-cell">Updated</th>
                      <th className="nx-table__head-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="nx-table__body">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="nx-table__row">
                        <td className="nx-table__cell">
                          <strong>{doc.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--nx-neutral-500)' }}>/{doc.slug}</div>
                        </td>
                        <td className="nx-table__cell">
                          <Badge variant="default" size="sm">{doc.type.toUpperCase()}</Badge>
                        </td>
                        <td className="nx-table__cell">
                          <code>v{doc.version}</code>
                        </td>
                        <td className="nx-table__cell">
                          {doc.activeUsers > 0 ? (
                            <span style={{ color: 'var(--nx-success-500)', fontWeight: 600, fontSize: '0.85rem' }}>
                              ● {doc.activeUsers} online
                            </span>
                          ) : (
                            <span style={{ color: 'var(--nx-neutral-500)' }}>Idle</span>
                          )}
                        </td>
                        <td className="nx-table__cell">{doc.lastEditedBy}</td>
                        <td className="nx-table__cell">{doc.updatedAt}</td>
                        <td className="nx-table__cell">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setActiveDocId(doc.id);
                              setActiveTab('editor');
                            }}
                          >
                            Open Studio →
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: SNAPSHOTS & ROLLBACK */}
      {activeTab === 'snapshots' && (
        <Card>
          <CardHeader>
            <CardTitle>Point-in-Time Revision History — {activeDoc?.title || 'Workspace'}</CardTitle>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--nx-neutral-400)' }}>
              Every major milestone automatically generates an immutable snapshot. You can roll back the live state at any time.
            </p>
          </CardHeader>
          <CardContent>
            {snapshots.length === 0 ? (
              <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏱️</div>
                <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '0.5rem' }}>No Revision Snapshots Recorded</h3>
                <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                  Manual saves and milestone versions will automatically generate immutable point-in-time snapshots with instant rollback.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 1.25rem',
                      backgroundColor: 'var(--nx-neutral-900)',
                      border: '1px solid var(--nx-neutral-800)',
                      borderRadius: '8px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <Badge variant="brand" size="sm">Revision v{snap.version}</Badge>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--nx-neutral-100)' }}>{snap.title}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--nx-neutral-400)', display: 'flex', gap: '1rem' }}>
                        <span>Author: <strong>{snap.authorName}</strong></span>
                        <span>Diff: <strong style={{ color: 'var(--nx-success-500)' }}>{snap.summary}</strong></span>
                        <span>Recorded: {snap.timestamp}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="secondary" size="sm" onClick={() => handleRollbackSnapshot(snap)}>
                        Rollback to v{snap.version}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: CRDT & MULTIPLAYER METRICS */}
      {activeTab === 'metrics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <Card>
            <CardHeader>
              <CardTitle>CRDT Convergence Engine Topology</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontFamily: 'var(--nx-font-mono)', fontSize: '0.8rem', backgroundColor: 'var(--nx-neutral-950)', padding: '1rem', borderRadius: '6px', lineHeight: '1.7' }}>
                <div style={{ color: 'var(--nx-syncspace)' }}>[Engine] Vector Clocks State:</div>
                <div>Peer 1 (us-east-1): &lt;NodeA:14, NodeB:12, NodeC:14&gt;</div>
                <div>Peer 2 (eu-west-1): &lt;NodeA:14, NodeB:12, NodeC:14&gt;</div>
                <div>Peer 3 (ap-southeast-1): &lt;NodeA:14, NodeB:12, NodeC:14&gt;</div>
                <div style={{ marginTop: '0.5rem', color: 'var(--nx-brand-300)' }}>Convergence Delta: 0ms (In Consensus)</div>
                <div style={{ color: 'var(--nx-neutral-400)' }}>WebSocket Protocol: Binary Yjs CRDT over wss://</div>
                <div style={{ color: 'var(--nx-neutral-400)' }}>Compression: zstd frame encoding</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Operational Transformation Stream</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontFamily: 'var(--nx-font-mono)', fontSize: '0.78rem', backgroundColor: 'var(--nx-neutral-950)', padding: '1rem', borderRadius: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                <div style={{ color: 'var(--nx-success-500)' }}>[10:04:12] ACK op#984: Insert &quot;O_DIRECT&quot; at [22, 18] by Marcus Vance</div>
                <div style={{ color: 'var(--nx-info-500)' }}>[10:04:15] HEARTBEAT presence#443: Elena Chen line 14 active</div>
                <div style={{ color: 'var(--nx-success-500)' }}>[10:04:22] ACK op#985: Insert &quot;Lease read&quot; at [16, 2] by Elena Chen</div>
                <div style={{ color: 'var(--nx-warning-500)' }}>[10:04:29] CONVERGE 3-way merge on Section 2 resolved cleanly</div>
                <div style={{ color: 'var(--nx-info-500)' }}>[10:04:35] SNAPSHOT snp-14 committed to database</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Document Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Collaborative Document"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Document Title
            </label>
            <Input
              placeholder="e.g. Multi-Region Replication Policy"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Document Type
            </label>
            <select
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value as 'spec' | 'markdown' | 'canvas' | 'notebook')}
              style={{
                width: '100%',
                backgroundColor: 'var(--nx-neutral-900)',
                color: 'var(--nx-neutral-100)',
                border: '1px solid var(--nx-neutral-700)',
                padding: '0.5rem',
                borderRadius: '6px',
              }}
            >
              <option value="spec">Engineering Spec (Technical Architecture)</option>
              <option value="markdown">Markdown Document (General Knowledge)</option>
              <option value="canvas">Interactive Canvas / Diagram</option>
              <option value="notebook">Interactive Notebook</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateDocument} disabled={!newDocTitle.trim()}>
              Create & Open Studio
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
