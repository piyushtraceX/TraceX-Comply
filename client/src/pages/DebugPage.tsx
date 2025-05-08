import React, { useState } from 'react';
import { AuthDebugger } from '@/components/auth/AuthDebugger';
import { GoApiTester } from '@/components/debug/GoApiTester';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_BASE_URL } from '@/lib/api-config';

export default function DebugPage() {
  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Tools</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
        <h3 className="text-yellow-800 font-medium text-sm">Go Server Migration in Progress</h3>
        <p className="text-yellow-700 text-sm mt-1">
          The application is being migrated from Express.js to a standalone Go server.
          Use this page to test the Go server connection and debug any issues.
        </p>
        <p className="text-yellow-700 text-sm mt-2">
          <strong>Go API URL:</strong> {API_BASE_URL}
        </p>
      </div>
      
      <Tabs defaultValue="go-api">
        <TabsList className="mb-4">
          <TabsTrigger value="go-api">Go API Tester</TabsTrigger>
          <TabsTrigger value="auth">Auth Debugger</TabsTrigger>
        </TabsList>
        
        <TabsContent value="go-api">
          <GoApiTester />
        </TabsContent>
        
        <TabsContent value="auth">
          <AuthDebugger />
        </TabsContent>
      </Tabs>
    </div>
  );
}