import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema for permission form
const permissionFormSchema = z.object({
  roleId: z.number().optional(),
  resourceId: z.number().optional(),
  actionId: z.number().optional(),
  tenantId: z.number().nullable()
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;

export const PermissionsList: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch permissions
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['/api/permissions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/permissions');
      return await response.json();
    }
  });

  // Fetch roles for dropdown
  const { data: roles } = useQuery({
    queryKey: ['/api/roles'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/roles');
      return await response.json();
    }
  });

  // Fetch resources for dropdown
  const { data: resources } = useQuery({
    queryKey: ['/api/resources'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/resources');
      return await response.json();
    }
  });

  // Fetch actions for dropdown
  const { data: actions } = useQuery({
    queryKey: ['/api/actions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/actions');
      return await response.json();
    }
  });

  // Fetch tenants for dropdown
  const { data: tenants } = useQuery({
    queryKey: ['/api/tenants'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tenants');
      return await response.json();
    }
  });

  // Create permission mutation - using direct API client
  const createMutation = useMutation({
    mutationFn: async (values: PermissionFormValues) => {
      try {
        // We'll implement this method in go-api.ts later
        // For now, we'll stick with a direct axios call to /api/permissions
        const apiClient = axios.create({
          baseURL: window.location.origin,
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        const response = await apiClient.post('/api/permissions', values);
        return response.data;
      } catch (error) {
        console.error('Error creating permission:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: t('userManagement.permissionCreated'),
        description: t('userManagement.permissionCreatedDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/permissions'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete permission mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/permissions/${id}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: t('userManagement.permissionDeleted'),
        description: t('userManagement.permissionDeletedDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/permissions'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      roleId: undefined,
      resourceId: undefined,
      actionId: undefined,
      tenantId: null
    }
  });

  const handleAddPermission = () => {
    form.reset({
      roleId: undefined,
      resourceId: undefined,
      actionId: undefined,
      tenantId: null
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: PermissionFormValues) => {
    createMutation.mutate(values);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('userManagement.permissions')}</CardTitle>
            <CardDescription>{t('userManagement.permissionsDesc')}</CardDescription>
          </div>
          <Button 
            onClick={handleAddPermission}
            className="ml-auto"
          >
            <Plus className="h-4 w-4 mr-2" /> {t('userManagement.addPermission')}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('userManagement.role')}</TableHead>
                  <TableHead>{t('userManagement.resource')}</TableHead>
                  <TableHead>{t('userManagement.action')}</TableHead>
                  <TableHead>{t('userManagement.tenant')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions?.map((permission: any) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      {roles?.find((r: any) => r.id === permission.roleId)?.displayName || 
                       roles?.find((r: any) => r.id === permission.roleId)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {resources?.find((r: any) => r.id === permission.resourceId)?.displayName || 
                       resources?.find((r: any) => r.id === permission.resourceId)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {actions?.find((a: any) => a.id === permission.actionId)?.displayName || 
                       actions?.find((a: any) => a.id === permission.actionId)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {tenants?.find((t: any) => t.id === permission.tenantId)?.name || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (window.confirm(t('userManagement.confirmDelete'))) {
                            deleteMutation.mutate(permission.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {permissions?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      {t('userManagement.noPermissions')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{t('userManagement.addPermission')}</DialogTitle>
            <DialogDescription>
              {t('userManagement.addPermissionDesc')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('userManagement.role')}</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('userManagement.selectRole')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles?.map((role: any) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.displayName || role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resourceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('userManagement.resource')}</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('userManagement.selectResource')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resources?.map((resource: any) => (
                          <SelectItem key={resource.id} value={resource.id.toString()}>
                            {resource.displayName || resource.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('userManagement.action')}</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('userManagement.selectAction')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {actions?.map((action: any) => (
                          <SelectItem key={action.id} value={action.id.toString()}>
                            {action.displayName || action.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('userManagement.tenant')}</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('userManagement.selectTenant')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">
                          {t('userManagement.allTenants')}
                        </SelectItem>
                        {tenants?.map((tenant: any) => (
                          <SelectItem key={tenant.id} value={tenant.id.toString()}>
                            {tenant.displayName || tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending && (
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                  )}
                  {t('common.create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};