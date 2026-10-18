import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@nexus-one/ui';

interface CollabDoc {
  id: string;
  title: string;
  activeUsers: number;
  lastEditedBy: string;
  updatedAt: string;
  status: 'active' | 'archived';
}

export function SyncSpacePage() {
  const [docs] = useState<CollabDoc[]>([
    {
      id: 'doc-1',
      title: 'Q4 Product Roadmap & Sprint Milestones',
      activeUsers: 4,
      lastEditedBy: 'Sarah Chen',
      updatedAt: '2m ago',
      status: 'active',
    },
    {
      id: 'doc-2',
      title: 'System Architecture Specification v2',
      activeUsers: 1,
      lastEditedBy: 'Marcus Vance',
      updatedAt: '18m ago',
      status: 'active',
    },
    {
      id: 'doc-3',
      title: 'Post-Mortem: Payment Gateway Timeout (INC-103)',
      activeUsers: 0,
      lastEditedBy: 'System Admin',
      updatedAt: '2h ago',
      status: 'active',
    },
  ]);

  return (
    <div className="nx-product-shell">
      <div className="nx-product-header">
        <div>
          <div className="nx-product-pill" style={{ color: 'var(--nx-syncspace)' }}>
            <span>✨ SyncSpace</span>
            <span className="nx-pill-tag">Real-Time Collaborative Workspace</span>
          </div>
          <h1 className="nx-product-title">Real-Time Multiplayer Canvas</h1>
          <p className="nx-product-desc">
            Conflict-free collaborative document editing powered by Yjs CRDTs, live presence cursors, and encrypted WebSockets.
          </p>
        </div>

        <Button variant="primary">+ New Document</Button>
      </div>

      <div className="nx-product-grid-3">
        <Card>
          <div className="nx-stat-title">Active Multiplayer Rooms</div>
          <div className="nx-stat-value">5</div>
          <div className="nx-stat-sub">Live WebSocket channels open</div>
        </Card>
        <Card>
          <div className="nx-stat-title">CRDT Convergence Latency</div>
          <div className="nx-stat-value" style={{ color: 'var(--nx-success-500)' }}>8ms</div>
          <div className="nx-stat-sub">Zero conflict merge state</div>
        </Card>
        <Card>
          <div className="nx-stat-title">Version Snapshots</div>
          <div className="nx-stat-value">1,482</div>
          <div className="nx-stat-sub">Time-travel undo supported</div>
        </Card>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <CardHeader>
          <CardTitle>Collaborative Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="nx-table-wrap">
            <table className="nx-table">
              <thead className="nx-table__header">
                <tr>
                  <th className="nx-table__head-cell">Document Title</th>
                  <th className="nx-table__head-cell">Active Editors</th>
                  <th className="nx-table__head-cell">Last Edited By</th>
                  <th className="nx-table__head-cell">Updated</th>
                  <th className="nx-table__head-cell">Status</th>
                  <th className="nx-table__head-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="nx-table__body">
                {docs.map((doc) => (
                  <tr key={doc.id} className="nx-table__row">
                    <td className="nx-table__cell">
                      <strong>{doc.title}</strong>
                    </td>
                    <td className="nx-table__cell">
                      {doc.activeUsers > 0 ? (
                        <span className="nx-active-users">
                          <span className="nx-presence-dot" /> {doc.activeUsers} online
                        </span>
                      ) : (
                        <span style={{ color: 'var(--nx-neutral-500)' }}>Idle</span>
                      )}
                    </td>
                    <td className="nx-table__cell">{doc.lastEditedBy}</td>
                    <td className="nx-table__cell">{doc.updatedAt}</td>
                    <td className="nx-table__cell">
                      <Badge variant="success" size="sm">{doc.status}</Badge>
                    </td>
                    <td className="nx-table__cell">
                      <Button variant="secondary" size="sm">
                        Join Session →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
