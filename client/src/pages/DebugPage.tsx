import React from 'react';
import { AuthDebugger } from '@/components/auth/AuthDebugger';

export default function DebugPage() {
  return (
    <div className="p-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      <AuthDebugger />
    </div>
  );
}