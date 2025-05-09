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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, Plus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema for tenant form
const tenantFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  displayName: z.string().min(1, { message: 'Display name is required' }),
  description: z.string().optional()
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

export const TenantsList: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any | null>(null);

  // Fetch tenants
  const { data: tenants, isLoading } = useQuery({
    queryKey: ['/api/tenants'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tenants');
      return await response.json();
    }
  });

  // Fetch tenant user counts
  const { data: tenantUserCounts } = useQuery({
    queryKey: ['/api/tenants/user-counts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tenants/user-counts');
      return await response.json();
    }
  });

  // Create tenant mutation - using direct API client
  const createMutation = useMutation({
    mutationFn: async (values: TenantFormValues) => {
      try {
        // Import tenantsApi from go-api.ts for direct API access
        const { tenantsApi } = await import('@/lib/go-api');
        const response = await tenantsApi.createTenant(values);
        return response.data;
      } catch (error) {
        console.error('Error creating tenant:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: t('userManagement.tenantCreated'),
        description: t('userManagement.tenantCreatedDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
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

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: '',
      displayName: '',
      description: ''
    }
  });

  const handleAddTenant = () => {
    setEditingTenant(null);
    form.reset({
      name: '',
      displayName: '',
      description: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditTenant = (tenant: any) => {
    setEditingTenant(tenant);
    form.reset({
      name: tenant.name,
      displayName: tenant.displayName || '',
      description: tenant.description || ''
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: TenantFormValues) => {
    // If editing, update tenant, otherwise create new one
    if (editingTenant) {
      // Update tenant logic (not implemented yet)
      toast({
        title: 'Not implemented',
        description: 'Tenant update functionality is not yet implemented',
        variant: 'destructive',
      });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('userManagement.tenants')}</CardTitle>
            <CardDescription>{t('userManagement.tenantsDesc')}</CardDescription>
          </div>
          <Button 
            onClick={handleAddTenant}
            className="ml-auto"
          >
            <Plus className="h-4 w-4 mr-2" /> {t('userManagement.addTenant')}
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
                  <TableHead>{t('userManagement.name')}</TableHead>
                  <TableHead>{t('userManagement.displayName')}</TableHead>
                  <TableHead>{t('userManagement.description')}</TableHead>
                  <TableHead>{t('userManagement.users')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants?.map((tenant: any) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.displayName}</TableCell>
                    <TableCell>{tenant.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {tenantUserCounts?.find((t: any) => t.tenantId === tenant.id)?.userCount || 0}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {tenants?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      {t('userManagement.noTenants')}
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
            <DialogTitle>
              {editingTenant ? t('userManagement.editTenant') : t('userManagement.addTenant')}
            </DialogTitle>
            <DialogDescription>
              {editingTenant 
                ? t('userManagement.editTenantDesc') 
                : t('userManagement.addTenantDesc')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('userManagement.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('userManagement.namePlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('userManagement.tenantNameDesc')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('userManagement.displayName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('userManagement.displayNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('userManagement.tenantDisplayNameDesc')}
                    </FormDescription>
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
                      <Textarea 
                        placeholder={t('userManagement.descriptionPlaceholder')} 
                        {...field}
                        value={field.value || ''} 
                      />
                    </FormControl>
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
                  {editingTenant ? t('common.update') : t('common.create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};