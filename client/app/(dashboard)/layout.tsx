'use client';

import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // If no user is found after the first client-side load, redirect to login
    if (!user) {
      router.push('/login');
    } else {
      setIsReady(true);
    }
  }, [user, router]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full shadow-lg" />
      </div>
    );
  }

  return <Layout>{children}</Layout>;
}
