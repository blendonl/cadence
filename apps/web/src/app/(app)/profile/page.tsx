'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; image?: string } | null>(null);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        setUser(data.user as any);
      }
    });
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace('/sign-in');
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="font-mono text-lg font-semibold">Profile</h2>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {user?.image ? (
              <img src={user.image} alt="" className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <User size={20} className="text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle>{user?.name || 'Loading...'}</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Button variant="outline" onClick={handleSignOut}>
        <LogOut size={14} /> Sign Out
      </Button>
    </div>
  );
}
