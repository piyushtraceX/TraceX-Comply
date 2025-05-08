import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/use-translation';
import { Permission } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Trash2, Lock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Form validation schema
const permissionFormSchema = z.object({
  roleId: z.coerce.number().positive('Please select a role'),
  resourceId: z.coerce.number().positive('Please select a resource'),
  actionId: z.coerce.number().positive('Please select an action'),
  tenantId: z.coerce.number().nullable().optional(),
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;

export const PermissionsList: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  // Fetch permissions
  const { data: permissions, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/permissions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/permissions');
      return await response.json();
    }
  });

  // Fetch roles for the select dropdown
  const { data: roles } = useQuery({
    queryKey: ['/api/roles'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/roles');
      return await response.json();
    }
  });

  // Fetch resources for the select dropdown
  const { data: resources } = useQuery({
    queryKey: ['/api/resources'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/resources');
      return await response.json();
    }
  });

  // Fetch actions for the select dropdown
  const { data: actions } = useQuery({
    queryKey: ['/api/actions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/actions');
      return await response.json();
    }
  });

  // Fetch tenants for the select dropdown
  const { data: tenants } = useQuery({
    queryKey: ['/api/tenants'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tenants');
      return await response.json();
    }
  });

  // Form handling
  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      roleId: 0,
      resourceId: 0,
      actionId: 0,
      tenantId: null,
    }
  });

  // Create/update permission mutation
  const mutation = useMutation({
    mutationFn: async (values: PermissionFormValues) => {
      if (editingPermission) {
        // Update permission
        const response = await apiRequest('PATCH', `/api/permissions/${editingPermission.id}`, values);
        return await response.json();
      } else {
        // Create new permission
        const response = await apiRequest('POST', '/api/permissions', values);
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/permissions'] });
      toast({
        title: editingPermission ? 'Permission updated' : 'Permission created',
        description: editingPermission
          ? `The permission has been updated successfully`
          : `The permission has been created successfully`,
      });
      resetAndCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  });

  // Delete permission mutation
  const deleteMutation = useMutation({
    mutationFn: async (permissionId: number) => {
      const response = await apiRequest('DELETE', `/api/permissions/${permissionId}`);
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/permissions'] });
      toast({
        title: 'Permission deleted',
        description: 'The permission has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  });

  // Reset form and close dialog
  const resetAndCloseDialog = () => {
    form.reset();
    setEditingPermission(null);
    setPermissionDialogOpen(false);
  };

  // Open dialog for editing a permission
  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    form.reset({
      roleId: permission.roleId,
      resourceId: permission.resourceId,
      actionId: permission.actionId,
      tenantId: permission.tenantId,
    });
    setPermissionDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (values: PermissionFormValues) => {
    mutation.mutate(values);
  };

  // Helper to get entity name by ID
  const getRoleName = (id: number) => roles?.find((r: any) => r.id === id)?.name || 'Unknown';
  const getResourceName = (id: number) => resources?.find((r: any) => r.id === id)?.name || 'Unknown';
  const getActionName = (id: number) => actions?.find((a: any) => a.id === id)?.name || 'Unknown';
  const getTenantName = (id: number | null) => id ? tenants?.find((t: any) => t.id === id)?.name : 'Global';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('userManagement.permissionsListTitle')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
          <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1" onClick={() => {
                setEditingPermission(null);
                form.reset({
                  roleId: 0,
                  resourceId: 0,
                  actionId: 0,
                  tenantId: null,
                });
              }}>
                <Lock className="h-4 w-4" />
                {t('userManagement.addPermission')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPermission ? t('userManagement.editPermission') : t('userManagement.addPermission')}
                </DialogTitle>
                <DialogDescription>
                  {editingPermission
                    ? t('userManagement.editPermissionDescription')
                    : t('userManagement.addPermissionDescription')}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="roleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('userManagement.role')}</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value ? field.value.toString() : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('userManagement.selectRole')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roles?.map((role: any) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                  {role.name}
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
                            value={field.value ? field.value.toString() : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('userManagement.selectResource')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {resources?.map((resource: any) => (
                                <SelectItem key={resource.id} value={resource.id.toString()}>
                                  {resource.type}/{resource.name}
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
                            value={field.value ? field.value.toString() : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('userManagement.selectAction')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {actions?.map((action: any) => (
                                <SelectItem key={action.id} value={action.id.toString()}>
                                  {action.name}
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
                            onValueChange={(value) => {
                              if (value === "null") {
                                field.onChange(null);
                              } else {
                                field.onChange(parseInt(value));
                              }
                            }}
                            value={field.value !== null ? field.value?.toString() : "null"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('userManagement.selectTenant')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">{t('userManagement.globalPermission')}</SelectItem>
                              {tenants?.map((tenant: any) => (
                                <SelectItem key={tenant.id} value={tenant.id.toString()}>
                                  {tenant.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetAndCloseDialog}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                      {editingPermission ? t('common.save') : t('common.create')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-10 text-destructive">
              {t('common.errorLoadingData')}
            </div>
          ) : (
            <Table>
              <TableCaption>{t('userManagement.permissionsTableCaption')}</TableCaption>
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
                {permissions?.map((permission: Permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary-50">
                        {getRoleName(permission.roleId)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getResourceName(permission.resourceId)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getActionName(permission.actionId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {permission.tenantId
                        ? getTenantName(permission.tenantId)
                        : <Badge variant="outline">Global</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPermission(permission)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            if (window.confirm(t('userManagement.confirmDeletePermission'))) {
                              deleteMutation.mutate(permission.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
    </div>
  );
};