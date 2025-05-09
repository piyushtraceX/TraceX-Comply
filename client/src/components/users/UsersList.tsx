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
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema for user form
const userFormSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  displayName: z.string().min(1, { message: 'Display name is required' }),
  email: z.string().email().optional().nullable(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).or(z.literal('')),
  tenantId: z.number().nullable(),
  isSuperAdmin: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

type UserFormValues = z.infer<typeof userFormSchema>;

export const UsersList: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/users');
      return await response.json();
    }
  });

  // Fetch tenants for the dropdown
  const { data: tenants } = useQuery({
    queryKey: ['/api/tenants'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tenants');
      return await response.json();
    }
  });

  // Create user mutation - using direct API client
  const createMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      try {
        // Import usersApi from go-api.ts for direct API access
        const { usersApi } = await import('@/lib/go-api');
        const response = await usersApi.createUser(values);
        return response.data;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: t('userManagement.userCreated'),
        description: t('userManagement.userCreatedDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
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

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: UserFormValues }) => {
      const response = await apiRequest('PATCH', `/api/users/${id}`, values);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t('userManagement.userUpdated'),
        description: t('userManagement.userUpdatedDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
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

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/users/${id}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: t('userManagement.userDeleted'),
        description: t('userManagement.userDeletedDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      displayName: '',
      email: '',
      password: '',
      tenantId: null,
      isSuperAdmin: false,
      isActive: true
    }
  });

  const handleAddUser = () => {
    setEditingUser(null);
    form.reset({
      username: '',
      displayName: '',
      email: '',
      password: '',
      tenantId: null,
      isSuperAdmin: false,
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    form.reset({
      username: user.username,
      displayName: user.displayName || '',
      email: user.email || '',
      password: '', // Don't prefill password for security
      tenantId: user.tenantId,
      isSuperAdmin: !!user.isSuperAdmin,
      isActive: user.isActive !== false // Default to true if not set
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: UserFormValues) => {
    // If editing, update user, otherwise create new one
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('userManagement.users')}</CardTitle>
            <CardDescription>{t('userManagement.usersDesc')}</CardDescription>
          </div>
          <Button 
            onClick={handleAddUser}
            className="ml-auto"
          >
            <Plus className="h-4 w-4 mr-2" /> {t('userManagement.addUser')}
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
                  <TableHead>{t('userManagement.username')}</TableHead>
                  <TableHead>{t('userManagement.displayName')}</TableHead>
                  <TableHead>{t('userManagement.email')}</TableHead>
                  <TableHead>{t('userManagement.tenant')}</TableHead>
                  <TableHead>{t('userManagement.roles')}</TableHead>
                  <TableHead>{t('userManagement.superAdmin')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.displayName || '-'}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      {tenants?.find((t: any) => t.id === user.tenantId)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {/* User roles will be populated by API in future */}
                      {'-'}
                    </TableCell>
                    <TableCell>
                      <Checkbox checked={!!user.isSuperAdmin} disabled />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            if (window.confirm(t('userManagement.confirmDelete'))) {
                              deleteMutation.mutate(user.id);
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
                {users?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      {t('userManagement.noUsers')}
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
              {editingUser ? t('userManagement.editUser') : t('userManagement.addUser')}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? t('userManagement.editUserDesc') 
                : t('userManagement.addUserDesc')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('userManagement.username')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('userManagement.usernamePlaceholder')} 
                        {...field} 
                        disabled={!!editingUser} // Username can't be changed once created
                      />
                    </FormControl>
                    <FormDescription>
                      {t('userManagement.usernameDesc')}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('userManagement.email')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder={t('userManagement.emailPlaceholder')} 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {editingUser 
                        ? t('userManagement.newPassword') 
                        : t('userManagement.password')}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder={
                          editingUser 
                            ? t('userManagement.newPasswordPlaceholder') 
                            : t('userManagement.passwordPlaceholder')
                        } 
                        {...field} 
                      />
                    </FormControl>
                    {editingUser && (
                      <FormDescription>
                        {t('userManagement.leaveBlankToKeep')}
                      </FormDescription>
                    )}
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
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('userManagement.selectTenant')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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

              <FormField
                control={form.control}
                name="isSuperAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t('userManagement.superAdmin')}
                      </FormLabel>
                      <FormDescription>
                        {t('userManagement.superAdminDesc')}
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t('userManagement.active')}
                      </FormLabel>
                      <FormDescription>
                        {t('userManagement.activeDesc')}
                      </FormDescription>
                    </div>
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                  )}
                  {editingUser ? t('common.update') : t('common.create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};