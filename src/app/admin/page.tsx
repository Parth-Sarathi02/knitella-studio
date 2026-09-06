'use client';

import { AuthProvider, useAuth } from '@/lib/auth-context';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

function AdminGate() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cream-300 border-t-rose-500" />
      </div>
    );
  }

  return session ? <AdminDashboard /> : <AdminLogin />;
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminGate />
    </AuthProvider>
  );
}
