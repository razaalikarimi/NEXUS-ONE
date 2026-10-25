import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, FormField, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@nexus-one/ui';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="nx-auth-container">
      <div className="nx-auth-card-wrap">
        <div className="nx-auth-logo">
          <span className="nx-brand-logo__dot" />
        </div>
        <h1 className="nx-auth-heading">NEXUS ONE</h1>
        <p className="nx-auth-subheading">Create your organization workspace</p>

        <Card className="nx-auth-card">
          <CardHeader>
            <CardTitle>Get started with NEXUS ONE</CardTitle>
            <CardDescription>
              Launch your multi-product environment with full enterprise defaults
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && <div className="nx-auth-alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <FormField label="Full Name" required>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Full Name"
                  required
                />
              </FormField>

              <FormField label="Work Email" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  required
                />
              </FormField>

              <FormField label="Password (min 8 chars, mixed case + number)" required>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </FormField>

              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                Create Workspace →
              </Button>
            </form>

            <div className="nx-auth-footer-link" style={{ marginTop: '1.5rem' }}>
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
