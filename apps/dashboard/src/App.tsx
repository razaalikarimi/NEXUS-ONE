import { BrowserRouter, Routes, Route } from 'react-router-dom';

/**
 * Dashboard application root.
 * Phase 3 adds full layout, auth, sidebar, and product routes.
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
      </Routes>
    </BrowserRouter>
  );
}

function DashboardHome() {
  return (
    <main style={{ fontFamily: 'var(--nx-font-sans)', padding: 'var(--nx-space-8)' }}>
      <h1>NEXUS ONE Dashboard</h1>
      <p style={{ color: 'var(--nx-text-secondary)' }}>
        Build. Observe. Automate. Understand.
      </p>
      <p style={{ marginTop: 'var(--nx-space-4)', color: 'var(--nx-text-tertiary)' }}>
        Phase 1 complete — monorepo foundation verified.
      </p>
    </main>
  );
}
