import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/use-translation';
import { Tenant } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Trash2, Building, RefreshCw, Users } from 'lucide-react';

// Form validation schema
const tenantFormSchema = z.object({
  name: z.string().min(2, 'Tenant name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

export const TenantsList: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Fetch tenants
  const { data: tenants, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/tenants'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tenants');
      return await response.json();
    }
  });

  // Form handling
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  });

  // Create/update tenant mutation
  const mutation = useMutation({
    mutationFn: async (values: TenantFormValues) => {
      if (editingTenant) {
        // Update tenant
        const response = await apiRequest('PATCH', `/api/tenants/${editingTenant.id}`, values);
        return await response.json();
      } else {
        // Create new tenant
        const response = await apiRequest('POST', '/api/tenants', values);
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      toast({
        title: editingTenant ? 'Tenant updated' : 'Tenant created',
        description: editingTenant
          ? `The tenant "${form.getValues('name')}" has been updated`
          : `The tenant "${form.getValues('name')}" has been created`,
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

  // Delete tenant mutation
  const deleteMutation = useMutation({
    mutationFn: async (tenantId: number) => {
      const response = await apiRequest('DELETE', `/api/tenants/${tenantId}`);
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      toast({
        title: 'Tenant deleted',
        description: 'The tenant has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Cannot delete this tenant. It may be in use.',
        variant: 'destructive',
      });
    }
  });

  // Reset form and close dialog
  const resetAndCloseDialog = () => {
    form.reset();
    setEditingTenant(null);
    setTenantDialogOpen(false);
  };

  // Open dialog for editing a tenant
  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    form.reset({
      name: tenant.name,
      description: tenant.description,
    });
    setTenantDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (values: TenantFormValues) => {
    mutation.mutate(values);
  };

  // Fetch user counts for each tenant
  const { data: userCounts } = useQuery({
    queryKey: ['/api/tenants/user-counts'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/tenants/user-counts');
        return await response.json();
      } catch (error) {
        console.error('Failed to load user counts:', error);
        return [];
      }
    }
  });

  // Get user count for a tenant
  const getUserCount = (tenantId: number) => {
    if (!userCounts) return 0;
    const count = userCounts.find((item: any) => item.tenantId === tenantId);
    return count ? count.userCount : 0;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('userManagement.tenantsListTitle')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
          <Dialog open={tenantDialogOpen} onOpenChange={setTenantDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1" onClick={() => {
                setEditingTenant(null);
                form.reset({
                  name: '',
                  description: '',
                });
              }}>
                <Building className="h-4 w-4" />
                {t('userManagement.addTenant')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTenant ? t('userManagement.editTenant') : t('userManagement.addTenant')}
                </DialogTitle>
                <DialogDescription>
                  {editingTenant
                    ? t('userManagement.editTenantDescription')
                    : t('userManagement.addTenantDescription')}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('userManagement.tenantName')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('userManagement.description')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
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
                      {editingTenant ? t('common.save') : t('common.create')}
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
              <TableCaption>{t('userManagement.tenantsTableCaption')}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('userManagement.tenantName')}</TableHead>
                  <TableHead>{t('userManagement.description')}</TableHead>
                  <TableHead>{t('userManagement.users')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants?.map((tenant: Tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{getUserCount(tenant.id)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTenant(tenant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            if (window.confirm(t('userManagement.confirmDeleteTenant'))) {
                              deleteMutation.mutate(tenant.id);
                            }
                          }}
                          disabled={deleteMutation.isPending || getUserCount(tenant.id) > 0}
                          title={getUserCount(tenant.id) > 0 ? "Cannot delete a tenant with users" : ""}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {tenants?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      {t('userManagement.noTenants')}
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