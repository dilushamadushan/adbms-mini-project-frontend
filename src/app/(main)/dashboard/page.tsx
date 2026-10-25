"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants';

export default function Dashboard() {
  const router = useRouter();
  const { role, isLoaded } = useAuth();
  
  useEffect(() => {
    if (!isLoaded) return;
    if (role && ROUTES[role]) {
      router.replace(ROUTES[role]);
    } else {
      router.replace('/');
    }
  }, [role, isLoaded, router]);

  return <div className="p-8 text-center text-gray-500">Redirecting...</div>;
}
