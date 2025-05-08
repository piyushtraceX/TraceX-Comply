import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/use-translation';
import { UsersList } from '@/components/users/UsersList';
import { RolesList } from '@/components/users/RolesList';
import { PermissionsList } from '@/components/users/PermissionsList';
import { TenantsList } from '@/components/users/TenantsList';
import { Shield, Users, Building, Lock } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('users');

  return (
    <Layout
      title={t('userManagement.title') || 'User Management'}
    >
      <div className="py-6">
        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{t('userManagement.users') || 'Users'}</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>{t('userManagement.roles') || 'Roles'}</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>{t('userManagement.permissions') || 'Permissions'}</span>
            </TabsTrigger>
            <TabsTrigger value="tenants" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>{t('userManagement.tenants') || 'Tenants'}</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="bg-white rounded-md shadow">
            <TabsContent value="users">
              <UsersList />
            </TabsContent>
            <TabsContent value="roles">
              <RolesList />
            </TabsContent>
            <TabsContent value="permissions">
              <PermissionsList />
            </TabsContent>
            <TabsContent value="tenants">
              <TenantsList />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserManagement;