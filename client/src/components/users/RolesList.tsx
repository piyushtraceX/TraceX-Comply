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
  DialogTrigger,
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
import { Edit, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema for role form
const roleFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  displayName: z.string().min(1, { message: 'Display name is required' }),
  description: z.string().optional(),
  tenantId: z.number().nullable()
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

export const RolesList: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);

  // Fetch roles
  const { data: roles, isLoading } = useQuery({
    queryKey: ['/api/roles'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/roles');
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

  // Create role mutation - using direct API client
  const createMutation = useMutation({
    mutationFn: async (values: RoleFormValues) => {
      try {
        // Import rolesApi from go-api.ts for direct API access
        const { rolesApi } = await import('@/lib/go-api');
        const response = await rolesApi.createRole(values);
        return response.data;
      } catch (error) {
        console.error('Error creating role:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: t('userManagement.roleCreated'),
        description: t('userManagement.roleCreatedDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
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

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/roles/${id}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: t('userManagement.roleDeleted'),
        description: t('userManagement.roleDeletedDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      displayName: '',
      description: '',
      tenantId: null
    }
  });

  const handleAddRole = () => {
    setEditingRole(null);
    form.reset({
      name: '',
      displayName: '',
      description: '',
      tenantId: null
    });
    setIsDialogOpen(true);
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    form.reset({
      name: role.name,
      displayName: role.displayName || '',
      description: role.description || '',
      tenantId: role.tenantId
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: RoleFormValues) => {
    // If editing, update role, otherwise create new one
    if (editingRole) {
      // Update role logic (not implemented yet)
      toast({
        title: 'Not implemented',
        description: 'Role update functionality is not yet implemented',
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
            <CardTitle>{t('userManagement.roles')}</CardTitle>
            <CardDescription>{t('userManagement.rolesDesc')}</CardDescription>
          </div>
          <Button 
            onClick={handleAddRole}
            className="ml-auto"
          >
            <Plus className="h-4 w-4 mr-2" /> {t('userManagement.addRole')}
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
                  <TableHead>{t('userManagement.tenant')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles?.map((role: any) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.displayName}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      {tenants?.find((t: any) => t.id === role.tenantId)?.name || '-'}
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
                            if (window.confirm(t('userManagement.confirmDelete'))) {
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
                    <TableCell colSpan={5} className="text-center py-6">
                      {t('userManagement.noRoles')}
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
              {editingRole ? t('userManagement.editRole') : t('userManagement.addRole')}
            </DialogTitle>
            <DialogDescription>
              {editingRole 
                ? t('userManagement.editRoleDesc') 
                : t('userManagement.addRoleDesc')}
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
                      {t('userManagement.nameDesc')}
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
                      {t('userManagement.displayNameDesc')}
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
                  {editingRole ? t('common.update') : t('common.create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};