import React, { useState } from 'react';
import { AuthDebugger } from '@/components/auth/AuthDebugger';
import { GoApiTester } from '@/components/debug/GoApiTester';
import { ConnectionTester } from '@/components/debug/ConnectionTester';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_BASE_URL } from '@/lib/api-config';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getApiType, setApiType } from '@/lib/api-router';

export default function DebugPage() {
  const [currentApiType, setCurrentApiType] = useState<'express' | 'go'>(getApiType());

  const handleApiSwitch = (type: 'express' | 'go') => {
    setApiType(type);
    setCurrentApiType(type);
  };

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Tools</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
        <h3 className="text-yellow-800 font-medium text-sm">Go Server Migration in Progress</h3>
        <p className="text-yellow-700 text-sm mt-1">
          The application is being migrated from Express.js to a standalone Go server.
          Use this page to test the Go server connection and debug any issues.
        </p>
        <div className="flex justify-between items-center mt-3">
          <p className="text-yellow-700 text-sm">
            <strong>Go API URL:</strong> {API_BASE_URL}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-yellow-700">API Mode:</span>
            <Badge variant={currentApiType === 'express' ? 'default' : 'outline'}>
              Express
            </Badge>
            <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => handleApiSwitch('go')}>
              Switch to Go
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ConnectionTester />
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">API Status Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-medium">Express API</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-medium">Go API</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  In Progress
                </Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-medium">API Router</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Fallback Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Mode</span>
                <Badge>
                  {currentApiType === 'express' ? 'Express' : 'Go'} API
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="go-api">
        <TabsList className="mb-4">
          <TabsTrigger value="go-api">API Tester</TabsTrigger>
          <TabsTrigger value="auth">Auth Debugger</TabsTrigger>
          <TabsTrigger value="logs">API Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="go-api">
          <GoApiTester />
        </TabsContent>
        
        <TabsContent value="auth">
          <AuthDebugger />
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-2">API Request Logs</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Recent API requests and responses are logged here. Use the browser console for more detailed logs.
              </p>
              <div className="bg-gray-50 rounded-md p-3 font-mono text-xs h-64 overflow-y-auto">
                <p className="text-gray-500">No logs available. Make API requests to see them here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}