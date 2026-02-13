'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { connectWebSocket, disconnectWebSocket } from '@/lib/websocket';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.session) {
        router.replace('/sign-in');
      } else {
        setAuthenticated(true);
        connectWebSocket();
      }
      setLoading(false);
    });

    return () => {
      disconnectWebSocket();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse font-mono text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
