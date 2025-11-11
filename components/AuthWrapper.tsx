'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    // Auto-login with demo credentials if not authenticated
    if (!isAuthenticated) {
      login('demo@finovate.com', 'password123').catch((error) => {
        console.error('Auto-login failed:', error);
      });
    }
  }, [isAuthenticated, login]);

  return <>{children}</>;
}
