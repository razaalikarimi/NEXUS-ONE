import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/Layout/DashboardLayout';

import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { OverviewPage } from './pages/Overview';

import { AgentForgePage } from './pages/products/AgentForgePage';
import { PulseOpsPage } from './pages/products/PulseOpsPage';
import { GateFlowPage } from './pages/products/GateFlowPage';
import { CortexRAGPage } from './pages/products/CortexRAGPage';
import { SyncSpacePage } from './pages/products/SyncSpacePage';
import { SentinelXPage } from './pages/products/SentinelXPage';
import { CloudPilotPage } from './pages/products/CloudPilotPage';

import { OrganizationSettingsPage } from './pages/settings/OrganizationSettingsPage';
import { MembersSettingsPage } from './pages/settings/MembersSettingsPage';
import { ApiKeysPage } from './pages/settings/ApiKeysPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Product & Console Shell Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<OverviewPage />} />

              {/* The Seven Products */}
              <Route path="/agentforge" element={<AgentForgePage />} />
              <Route path="/pulseops" element={<PulseOpsPage />} />
              <Route path="/gateflow" element={<GateFlowPage />} />
              <Route path="/cortexrag" element={<CortexRAGPage />} />
              <Route path="/syncspace" element={<SyncSpacePage />} />
              <Route path="/sentinelx" element={<SentinelXPage />} />
              <Route path="/cloudpilot" element={<CloudPilotPage />} />

              {/* Tenant Settings */}
              <Route path="/settings/organization" element={<OrganizationSettingsPage />} />
              <Route path="/settings/members" element={<MembersSettingsPage />} />
              <Route path="/settings/api-keys" element={<ApiKeysPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
