import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/use-translation';
import { Role } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';

// Form validation schema
const roleFormSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  tenantId: z.coerce.number().nullable().optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

export const RolesList: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Fetch roles
  const { data: roles, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/roles'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/roles');
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
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      tenantId: null,
    }
  });

  // Create/update role mutation
  const mutation = useMutation({
    mutationFn: async (values: RoleFormValues) => {
      if (editingRole) {
        // Update role
        const response = await apiRequest('PATCH', `/api/roles/${editingRole.id}`, values);
        return await response.json();
      } else {
        // Create new role
        const response = await apiRequest('POST', '/api/roles', values);
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({
        title: editingRole ? 'Role updated' : 'Role created',
        description: editingRole
          ? `The role "${form.getValues('name')}" has been updated`
          : `The role "${form.getValues('name')}" has been created`,
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

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: async (roleId: number) => {
      const response = await apiRequest('DELETE', `/api/roles/${roleId}`);
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({
        title: 'Role deleted',
        description: 'The role has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Cannot delete this role. It may be in use.',
        variant: 'destructive',
      });
    }
  });

  // Reset form and close dialog
  const resetAndCloseDialog = () => {
    form.reset();
    setEditingRole(null);
    setRoleDialogOpen(false);
  };

  // Open dialog for editing a role
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    form.reset({
      name: role.name,
      description: role.description,
      tenantId: role.tenantId,
    });
    setRoleDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (values: RoleFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('userManagement.rolesListTitle')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
          <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1" onClick={() => {
                setEditingRole(null);
                form.reset({
                  name: '',
                  description: '',
                  tenantId: null,
                });
              }}>
                <ShieldCheck className="h-4 w-4" />
                {t('userManagement.addRole')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? t('userManagement.editRole') : t('userManagement.addRole')}
                </DialogTitle>
                <DialogDescription>
                  {editingRole
                    ? t('userManagement.editRoleDescription')
                    : t('userManagement.addRoleDescription')}
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
                          <FormLabel>{t('userManagement.roleName')}</FormLabel>
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
                            defaultValue={field.value ? field.value.toString() : "null"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('userManagement.selectTenant')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">{t('userManagement.globalRole')}</SelectItem>
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
                      {editingRole ? t('common.save') : t('common.create')}
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
              <TableCaption>{t('userManagement.rolesTableCaption')}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('userManagement.roleName')}</TableHead>
                  <TableHead>{t('userManagement.description')}</TableHead>
                  <TableHead>{t('userManagement.tenant')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles?.map((role: Role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      {role.tenantId
                        ? tenants?.find((t: any) => t.id === role.tenantId)?.name
                        : t('userManagement.globalRole')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            if (window.confirm(t('userManagement.confirmDeleteRole'))) {
                              deleteMutation.mutate(role.id);
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
                {roles?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      {t('userManagement.noRoles')}
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