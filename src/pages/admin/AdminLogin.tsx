import { useState } from 'react';
import { Lock, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { navigate } from '@/lib/router';

export function AdminLogin() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-100 to-rose-50 px-4">
      <div className="w-full max-w-md animate-scale-in">
        <button onClick={() => navigate('/')} className="mx-auto mb-8 flex items-center gap-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-soft">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="text-left leading-none">
            <span className="block font-display text-xl font-600 text-rose-900">Knitella</span>
            <span className="block text-xs font-medium uppercase tracking-[0.2em] text-rose-400">Studio</span>
          </div>
        </button>

        <div className="card p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-700 text-rose-900">Admin Panel</h1>
            <p className="mt-1 text-sm text-rose-500/70">Sign in to manage your store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rose-800">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="owner@knitella.studio"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rose-800">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-rose-400">
            Don't have an account? Create one from your Supabase dashboard.
          </p>
        </div>

        <button onClick={() => navigate('/')} className="mt-6 block w-full text-center text-sm text-rose-500 hover:text-rose-700">
          ← Back to store
        </button>
      </div>
    </div>
  );
}
