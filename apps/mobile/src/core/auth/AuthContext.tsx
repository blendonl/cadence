import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { authClient } from './authClient';

interface AuthContextValue {
  user: { id: string; email: string; name: string; image: string | null } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  const signIn = useCallback(async () => {
    await authClient.signIn.social({ provider: 'google', callbackURL: '/' });
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
  }, []);

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image ?? null,
      }
    : null;

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!session?.user,
    isLoading: isPending,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
