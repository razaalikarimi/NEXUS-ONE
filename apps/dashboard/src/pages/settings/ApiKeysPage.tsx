import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Modal, FormField, Input } from '@nexus-one/ui';

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt: string;
  createdAt: string;
}

export function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key-1',
      name: 'Production CI/CD Deployment Key',
      prefix: 'nx_live_8f9c',
      scopes: ['*'],
      lastUsedAt: '12m ago',
      createdAt: '3d ago',
    },
    {
      id: 'key-2',
      name: 'Staging Ingestion Ingest Key',
      prefix: 'nx_stag_21a4',
      scopes: ['pulseops:write', 'cortexrag:write'],
      lastUsedAt: 'Never',
      createdAt: '1d ago',
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    if (!keyName.trim()) return;

    const mockSecret = 'nx_live_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 18);
    const mockPrefix = mockSecret.substring(0, 12);

    setGeneratedKey(mockSecret);
    setKeys([
      ...keys,
      {
        id: `key-${Date.now()}`,
        name: keyName.trim(),
        prefix: mockPrefix,
        scopes: ['*'],
        lastUsedAt: 'Never',
        createdAt: 'Just now',
      },
    ]);
    setKeyName('');
  }

  return (
    <div className="nx-settings-page">
      <div className="nx-product-header">
        <div>
          <h1 className="nx-product-title">API Keys & Machine Tokens</h1>
          <p className="nx-product-desc">
            Cryptographically hashed (SHA-256) API keys for programmatic access to the NEXUS ONE API.
          </p>
        </div>

        <Button variant="primary" onClick={() => { setGeneratedKey(null); setModalOpen(true); }}>
          + Generate New Key
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active API Keys ({keys.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="nx-table-wrap">
            <table className="nx-table">
              <thead className="nx-table__header">
                <tr>
                  <th className="nx-table__head-cell">Key Name</th>
                  <th className="nx-table__head-cell">Key Prefix</th>
                  <th className="nx-table__head-cell">Scopes</th>
                  <th className="nx-table__head-cell">Last Used</th>
                  <th className="nx-table__head-cell">Created</th>
                  <th className="nx-table__head-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="nx-table__body">
                {keys.map((k) => (
                  <tr key={k.id} className="nx-table__row">
                    <td className="nx-table__cell">
                      <strong>{k.name}</strong>
                    </td>
                    <td className="nx-table__cell">
                      <code>{k.prefix}••••••••</code>
                    </td>
                    <td className="nx-table__cell">
                      <Badge variant="brand" size="sm">
                        {k.scopes.join(', ')}
                      </Badge>
                    </td>
                    <td className="nx-table__cell">{k.lastUsedAt}</td>
                    <td className="nx-table__cell">{k.createdAt}</td>
                    <td className="nx-table__cell">
                      <Button variant="danger" size="sm">Revoke</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={generatedKey ? 'API Key Generated' : 'Generate API Key'}
        description={
          generatedKey
            ? 'Make sure to copy your API key now. You will not be able to see it again!'
            : 'Enter a recognizable identifier for this service credential.'
        }
      >
        {generatedKey ? (
          <div>
            <div className="nx-key-display">
              <code>{generatedKey}</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button
                variant="primary"
                onClick={() => {
                  navigator.clipboard?.writeText(generatedKey);
                  setModalOpen(false);
                }}
              >
                Copy & Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateKey}>
            <FormField label="Key Description / Service Name" required>
              <Input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. GitHub Actions Production Deployer"
                required
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Generate Key
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
