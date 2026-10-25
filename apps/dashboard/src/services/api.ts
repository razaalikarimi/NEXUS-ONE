// ============================================================
// Fastify API Client — NEXUS ONE Dashboard
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: string;
  workspaces?: WorkspaceSummary[];
}

export interface AuthResponse {
  user: User;
  token: string;
  organizations: OrganizationSummary[];
}

class ApiService {
  private token: string | null = null;
  private currentOrgId: string | null = null;

  constructor() {
    this.token = localStorage.getItem('nx_auth_token');
    this.currentOrgId = localStorage.getItem('nx_current_org_id');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('nx_auth_token', token);
    } else {
      localStorage.removeItem('nx_auth_token');
    }
  }

  setCurrentOrgId(orgId: string | null) {
    this.currentOrgId = orgId;
    if (orgId) {
      localStorage.setItem('nx_current_org_id', orgId);
    } else {
      localStorage.removeItem('nx_current_org_id');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentOrgId(): string | null {
    return this.currentOrgId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }
    if (this.currentOrgId) {
      headers.set('X-Org-Id', this.currentOrgId);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error?.message || `API error: ${response.status}`);
    }

    return data.data;
  }

  // ---- Auth endpoints ----
  async register(payload: { email: string; password: string; name: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    if (res.organizations?.[0]?.id) {
      this.setCurrentOrgId(res.organizations[0].id);
    }
    return res;
  }

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    if (res.organizations?.[0]?.id) {
      this.setCurrentOrgId(res.organizations[0].id);
    }
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
      this.setCurrentOrgId(null);
    }
  }

  async me(): Promise<{ user: User; organizations: OrganizationSummary[] }> {
    return this.request('/api/v1/auth/me');
  }

  // ---- Organization endpoints ----
  async getOrganizations(): Promise<OrganizationSummary[]> {
    return this.request('/api/v1/organizations');
  }

  async createOrganization(payload: { name: string; slug: string }): Promise<OrganizationSummary> {
    return this.request('/api/v1/organizations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getOrganization(orgId: string): Promise<OrganizationSummary> {
    return this.request(`/api/v1/organizations/${orgId}`);
  }

  async getMembers(orgId: string): Promise<Array<{ id: string; userId: string; role: string; user: User }>> {
    return this.request(`/api/v1/organizations/${orgId}/members`);
  }

  async inviteMember(orgId: string, payload: { email: string; role: string }): Promise<{ id: string; email: string }> {
    return this.request(`/api/v1/organizations/${orgId}/invitations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAuditLogs(orgId: string): Promise<Array<{ id: string; action: string; resource: string; timestamp: string; user?: { name: string; email: string } }>> {
    return this.request(`/api/v1/organizations/${orgId}/audit-logs`);
  }

  // ---- Workspace endpoints ----
  async getWorkspaces(): Promise<WorkspaceSummary[]> {
    return this.request('/api/v1/workspaces');
  }

  async createWorkspace(payload: { name: string; slug: string }): Promise<WorkspaceSummary> {
    return this.request('/api/v1/workspaces', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getDashboardStats(_orgId?: string): Promise<{ activeWorkflows: number; openIncidents: number; activeRoutes: number; systemHealth: string }> {
    return this.request<{ activeWorkflows: number; openIncidents: number; activeRoutes: number; systemHealth: string }>('/api/v1/dashboard/stats').catch(() => ({
      activeWorkflows: 0,
      openIncidents: 0,
      activeRoutes: 0,
      systemHealth: 'operational',
    }));
  }

  // ---- Health check ----
  async checkHealth(): Promise<{ status: string; uptime: number }> {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  }
}

export const api = new ApiService();
