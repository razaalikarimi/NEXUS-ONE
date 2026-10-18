import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, type User } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Modal, FormField, Input, Select, Avatar } from '@nexus-one/ui';

interface MemberItem {
  id: string;
  userId: string;
  role: string;
  user: User;
}

export function MembersSettingsPage() {
  const { activeOrg } = useAuth();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (activeOrg?.id) {
      api.getMembers(activeOrg.id)
        .then(setMembers)
        .catch(() => {
          // Fallback demo member if DB not seeded
          setMembers([
            {
              id: 'm-1',
              userId: 'u-1',
              role: 'owner',
              user: {
                id: 'u-1',
                name: 'System Admin',
                email: 'admin@nexusone.dev',
                avatar: null,
                emailVerified: true,
                createdAt: new Date().toISOString(),
              },
            },
            {
              id: 'm-2',
              userId: 'u-2',
              role: 'admin',
              user: {
                id: 'u-2',
                name: 'Sarah Chen',
                email: 'developer@nexusone.dev',
                avatar: null,
                emailVerified: true,
                createdAt: new Date().toISOString(),
              },
            },
          ]);
        });
    }
  }, [activeOrg]);

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrg?.id || !inviteEmail.trim()) return;

    try {
      await api.inviteMember(activeOrg.id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteSuccess(`Invitation successfully sent to ${inviteEmail}!`);
      setInviteEmail('');
      setTimeout(() => {
        setInviteSuccess(null);
        setInviteModalOpen(false);
      }, 1500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Invitation failed');
    }
  }

  return (
    <div className="nx-settings-page">
      <div className="nx-product-header">
        <div>
          <h1 className="nx-product-title">Team Members & Access Control</h1>
          <p className="nx-product-desc">
            Manage roles (Owner, Admin, Member, Viewer) with fine-grained RBAC boundaries.
          </p>
        </div>

        <Button variant="primary" onClick={() => setInviteModalOpen(true)}>
          + Invite Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="nx-table-wrap">
            <table className="nx-table">
              <thead className="nx-table__header">
                <tr>
                  <th className="nx-table__head-cell">Member</th>
                  <th className="nx-table__head-cell">Email</th>
                  <th className="nx-table__head-cell">Role</th>
                  <th className="nx-table__head-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="nx-table__body">
                {members.map((m) => (
                  <tr key={m.id} className="nx-table__row">
                    <td className="nx-table__cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar name={m.user.name} size="sm" />
                        <strong>{m.user.name}</strong>
                      </div>
                    </td>
                    <td className="nx-table__cell">{m.user.email}</td>
                    <td className="nx-table__cell">
                      <Badge
                        variant={
                          m.role === 'owner'
                            ? 'brand'
                            : m.role === 'admin'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {m.role}
                      </Badge>
                    </td>
                    <td className="nx-table__cell">
                      {m.role !== 'owner' && (
                        <Button variant="ghost" size="sm">
                          Edit Role
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite New Team Member"
        description="Invited members will receive an email with secure sign-in instructions."
      >
        {inviteSuccess ? (
          <div className="nx-auth-alert" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>
            {inviteSuccess}
          </div>
        ) : (
          <form onSubmit={handleSendInvite}>
            <FormField label="Email Address" required>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
              />
            </FormField>

            <FormField label="Assigned Role" required>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')}
              >
                <option value="admin">Admin (Can manage workspaces, keys, and members)</option>
                <option value="member">Member (Can edit workflows, docs, and settings)</option>
                <option value="viewer">Viewer (Read-only access)</option>
              </Select>
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button type="button" variant="ghost" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Send Invitation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
