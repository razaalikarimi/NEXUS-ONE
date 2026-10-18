import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge } from '@nexus-one/ui';

const PRODUCTS = [
  { id: 'agentforge', name: 'AgentForge', path: '/agentforge', icon: '⚡', color: 'var(--nx-agentforge)' },
  { id: 'pulseops', name: 'PulseOps', path: '/pulseops', icon: '🚨', color: 'var(--nx-pulseops)' },
  { id: 'gateflow', name: 'GateFlow', path: '/gateflow', icon: '🚪', color: 'var(--nx-gateflow)' },
  { id: 'cortexrag', name: 'CortexRAG', path: '/cortexrag', icon: '🧠', color: 'var(--nx-cortexrag)' },
  { id: 'syncspace', name: 'SyncSpace', path: '/syncspace', icon: '✨', color: 'var(--nx-syncspace)' },
  { id: 'sentinelx', name: 'SentinelX', path: '/sentinelx', icon: '🛡️', color: 'var(--nx-sentinelx)' },
  { id: 'cloudpilot', name: 'CloudPilot', path: '/cloudpilot', icon: '☁️', color: 'var(--nx-cloudpilot)' },
];

export function DashboardLayout() {
  const { user, activeOrg, organizations, switchOrg, activeWorkspace, logout } = useAuth();
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="nx-dashboard-shell">
      {/* Sidebar */}
      <aside className="nx-sidebar">
        {/* Brand */}
        <div className="nx-sidebar__brand">
          <div className="nx-brand-logo">
            <span className="nx-brand-logo__dot" />
          </div>
          <span className="nx-brand-title">NEXUS ONE</span>
          <span className="nx-brand-badge">ENT</span>
        </div>

        {/* Organization Switcher */}
        <div className="nx-org-switcher-wrapper">
          <button
            type="button"
            className="nx-org-switcher-btn"
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
          >
            <div className="nx-org-info">
              <span className="nx-org-name">{activeOrg?.name || 'Select Organization'}</span>
              <span className="nx-org-meta">
                {activeWorkspace ? `ws: ${activeWorkspace.name}` : 'No Workspace'}
              </span>
            </div>
            <span className="nx-org-chevron">▾</span>
          </button>

          {orgDropdownOpen && (
            <div className="nx-org-dropdown">
              <div className="nx-org-dropdown__title">Switch Organization</div>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  className={`nx-org-item ${org.id === activeOrg?.id ? 'nx-org-item--active' : ''}`}
                  onClick={() => {
                    switchOrg(org.id);
                    setOrgDropdownOpen(false);
                  }}
                >
                  <span className="nx-org-item__name">{org.name}</span>
                  <Badge variant="brand" size="sm">
                    {org.role}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="nx-sidebar-nav">
          <div className="nx-nav-section-title">Core Platform</div>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nx-nav-item ${isActive ? 'nx-nav-item--active' : ''}`
            }
          >
            <span className="nx-nav-icon">📊</span>
            <span>Command Center</span>
          </NavLink>

          <div className="nx-nav-section-title">The Seven Pillars</div>
          {PRODUCTS.map((prod) => (
            <NavLink
              key={prod.id}
              to={prod.path}
              className={({ isActive }) =>
                `nx-nav-item ${isActive ? 'nx-nav-item--active' : ''}`
              }
            >
              <span className="nx-nav-icon">{prod.icon}</span>
              <span className="nx-nav-label">{prod.name}</span>
              <span
                className="nx-nav-indicator"
                style={{ backgroundColor: prod.color }}
              />
            </NavLink>
          ))}

          <div className="nx-nav-section-title">Governance</div>
          <NavLink
            to="/settings/organization"
            className={({ isActive }) =>
              `nx-nav-item ${isActive ? 'nx-nav-item--active' : ''}`
            }
          >
            <span className="nx-nav-icon">🏢</span>
            <span>Organization & Audit</span>
          </NavLink>
          <NavLink
            to="/settings/members"
            className={({ isActive }) =>
              `nx-nav-item ${isActive ? 'nx-nav-item--active' : ''}`
            }
          >
            <span className="nx-nav-icon">👥</span>
            <span>Team Members</span>
          </NavLink>
          <NavLink
            to="/settings/api-keys"
            className={({ isActive }) =>
              `nx-nav-item ${isActive ? 'nx-nav-item--active' : ''}`
            }
          >
            <span className="nx-nav-icon">🔑</span>
            <span>API Keys</span>
          </NavLink>
        </nav>

        {/* User Footer */}
        <div className="nx-sidebar-footer">
          <div className="nx-user-pill">
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="nx-user-details">
              <span className="nx-user-name">{user?.name}</span>
              <span className="nx-user-email">{user?.email}</span>
            </div>
            <button
              type="button"
              className="nx-logout-btn"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              ⎋
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="nx-main-wrap">
        {/* Header */}
        <header className="nx-top-header">
          <div className="nx-header-breadcrumbs">
            <span className="nx-header-org">{activeOrg?.name}</span>
            <span className="nx-header-sep">/</span>
            <span className="nx-header-ws">{activeWorkspace?.name || 'Workspace'}</span>
          </div>

          <div className="nx-header-actions">
            <div className="nx-status-chip">
              <span className="nx-status-dot-pulse" />
              <span>Cluster Online</span>
            </div>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="nx-header-link"
            >
              Marketing Site ↗
            </a>
            <a
              href="http://localhost:3001/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="nx-header-link"
            >
              REST Docs ↗
            </a>
          </div>
        </header>

        {/* Page Container */}
        <main className="nx-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
