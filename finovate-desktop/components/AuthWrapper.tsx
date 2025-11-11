'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { LoginForm } from '@/components/LoginForm';
import { Loader2 } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const { isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      // Give time for Zustand to rehydrate from localStorage
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // If not authenticated and haven't tried auto-login yet, try demo login
      if (!isAuthenticated && !autoLoginAttempted) {
        setAutoLoginAttempted(true);
        try {
          console.log('Attempting auto-login with demo credentials...');
          await login('demo@finovate.com', 'password123');
          console.log('Auto-login successful');
        } catch (error) {
          console.error('Auto-login failed:', error);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, [isAuthenticated, autoLoginAttempted, login]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <>{children}</>;
}
