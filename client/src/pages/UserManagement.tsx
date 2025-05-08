import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersList } from '@/components/users/UsersList';
import { RolesList } from '@/components/users/RolesList';
import { PermissionsList } from '@/components/users/PermissionsList';
import { TenantsList } from '@/components/users/TenantsList';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContextV2';
import { Loader2, UserPlus, ShieldCheck, Building, Lock } from 'lucide-react';

export default function UserManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has admin permissions
  const isAdmin = user?.isSuperAdmin || user?.roles?.includes('admin');

  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: t('common.unauthorized'),
        description: t('userManagement.unauthorized'),
        variant: "destructive"
      });
    }
  }, [isAdmin, toast, t]);

  if (!isAdmin) {
    return (
      <Layout title={t('userManagement.title')}>
        <div className="h-full flex items-center justify-center">
          <Card>
            <CardHeader>
              <CardTitle>{t('common.unauthorized')}</CardTitle>
              <CardDescription>{t('userManagement.unauthorized')}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('userManagement.title')}>
      <div className="container py-6">
        <div className="flex flex-col space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('userManagement.title')}</CardTitle>
              <CardDescription>{t('userManagement.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    {t('userManagement.usersTab')}
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    {t('userManagement.rolesTab')}
                  </TabsTrigger>
                  <TabsTrigger value="permissions" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {t('userManagement.permissionsTab')}
                  </TabsTrigger>
                  <TabsTrigger value="tenants" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {t('userManagement.tenantsTab')}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="users" className="pt-4">
                  <UsersList />
                </TabsContent>
                
                <TabsContent value="roles" className="pt-4">
                  <RolesList />
                </TabsContent>
                
                <TabsContent value="permissions" className="pt-4">
                  <PermissionsList />
                </TabsContent>
                
                <TabsContent value="tenants" className="pt-4">
                  <TenantsList />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}