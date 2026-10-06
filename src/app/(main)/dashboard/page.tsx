"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  
  useEffect(() => {
    const role = localStorage.getItem('medicore_role');
    if (role === 'PATIENT') router.replace('/patient/dashboard');
    else if (role === 'DOCTOR') router.replace('/doctor/dashboard');
    else if (role === 'NURSE') router.replace('/nurse/dashboard');
    else if (role === 'RECEPTIONIST') router.replace('/receptionist/dashboard');
    else if (role === 'ADMIN') router.replace('/admin/dashboard');
    else router.replace('/');
  }, [router]);

  return <div className="p-8 text-center text-gray-500">Redirecting...</div>;
}
