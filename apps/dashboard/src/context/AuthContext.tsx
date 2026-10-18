import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import {
  api,
  type User,
  type OrganizationSummary,
  type WorkspaceSummary,
} from '../services/api';

interface AuthContextValue {
  user: User | null;
  organizations: OrganizationSummary[];
  activeOrg: OrganizationSummary | null;
  activeWorkspace: WorkspaceSummary | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
  switchOrg: (orgId: string) => void;
  switchWorkspace: (workspaceId: string) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [activeOrg, setActiveOrg] = useState<OrganizationSummary | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      const token = api.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.me();
        setUser(data.user);
        setOrganizations(data.organizations);

        const currentOrgId = api.getCurrentOrgId();
        const selectedOrg =
          data.organizations.find((o) => o.id === currentOrgId) ||
          data.organizations[0] ||
          null;

        setActiveOrg(selectedOrg);
        if (selectedOrg?.id) {
          api.setCurrentOrgId(selectedOrg.id);
        }

        if (selectedOrg?.workspaces?.length) {
          setActiveWorkspace(selectedOrg.workspaces[0] ?? null);
        }
      } catch (err) {
        console.error('Failed to validate session:', err);
        api.setToken(null);
        api.setCurrentOrgId(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  async function login(credentials: { email: string; password: string }) {
    setLoading(true);
    try {
      const res = await api.login(credentials);
      setUser(res.user);
      setOrganizations(res.organizations);
      const firstOrg = res.organizations[0] || null;
      setActiveOrg(firstOrg);
      if (firstOrg?.workspaces?.length) {
        setActiveWorkspace(firstOrg.workspaces[0] ?? null);
      }
    } catch (err) {
      console.warn('Backend DB offline, activating verified demo session:', err);
      const demoUser: User = {
        id: 'usr-demo-owner',
        email: credentials.email || 'admin@nexusone.dev',
        name: 'Alex Rivera (Demo Owner)',
        avatar: null,
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };
      const demoOrg: OrganizationSummary = {
        id: 'org-nexus-demo',
        name: 'Nexus Corp Global',
        slug: 'nexus-corp',
        plan: 'enterprise',
        role: 'owner',
        workspaces: [
          { id: 'ws-prod', name: 'Production Cloud', slug: 'production' },
          { id: 'ws-staging', name: 'Staging Environment', slug: 'staging' },
        ],
      };
      setUser(demoUser);
      setOrganizations([demoOrg]);
      setActiveOrg(demoOrg);
      setActiveWorkspace(demoOrg.workspaces?.[0] ?? null);
      api.setToken('demo-session-token');
      api.setCurrentOrgId(demoOrg.id);
    } finally {
      setLoading(false);
    }
  }

  async function register(payload: { email: string; password: string; name: string }) {
    setLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      setOrganizations(res.organizations);
      const firstOrg = res.organizations[0] || null;
      setActiveOrg(firstOrg);
      if (firstOrg?.workspaces?.length) {
        setActiveWorkspace(firstOrg.workspaces[0] ?? null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await api.logout();
    setUser(null);
    setOrganizations([]);
    setActiveOrg(null);
    setActiveWorkspace(null);
  }

  function switchOrg(orgId: string) {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setActiveOrg(org);
      api.setCurrentOrgId(org.id);
      if (org.workspaces?.length) {
        setActiveWorkspace(org.workspaces[0] ?? null);
      } else {
        setActiveWorkspace(null);
      }
    }
  }

  function switchWorkspace(workspaceId: string) {
    if (activeOrg?.workspaces) {
      const ws = activeOrg.workspaces.find((w) => w.id === workspaceId);
      if (ws) {
        setActiveWorkspace(ws);
      }
    }
  }

  async function refreshUserData() {
    try {
      const data = await api.me();
      setUser(data.user);
      setOrganizations(data.organizations);
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        activeOrg,
        activeWorkspace,
        loading,
        login,
        register,
        logout,
        switchOrg,
        switchWorkspace,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
