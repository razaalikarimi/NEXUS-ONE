import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, FormField, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@nexus-one/ui';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
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
        <p className="nx-auth-subheading">Enterprise Cloud & Developer Console</p>

        <Card className="nx-auth-card">
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your corporate credentials to access the console
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && <div className="nx-auth-alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <FormField label="Work Email" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </FormField>

              <FormField label="Password" required>
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
                style={{ width: '100%', marginTop: '1.25rem' }}
              >
                Sign In →
              </Button>
            </form>

            <div className="nx-auth-footer-link" style={{ marginTop: '2rem' }}>
              Don't have an account? <Link to="/register">Create workspace</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
