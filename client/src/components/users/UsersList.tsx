import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/use-translation';
import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Trash2, UserPlus, RefreshCw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

// Form validation schema
const userFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  tenantId: z.coerce.number().positive('Please select a tenant'),
  isSuperAdmin: z.boolean().default(false)
});

type UserFormValues = z.infer<typeof userFormSchema>;

export const UsersList: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Fetch users
  const { data: users, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/users');
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
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      name: '',
      email: '',
      password: '',
      tenantId: 1,
      isSuperAdmin: false
    }
  });

  // Create/update user mutation
  const mutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      if (editingUser) {
        // Update user
        const response = await apiRequest('PATCH', `/api/users/${editingUser.id}`, values);
        return await response.json();
      } else {
        // Create new user
        const response = await apiRequest('POST', '/api/users', values);
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: editingUser ? 'User updated' : 'User created',
        description: editingUser 
          ? `${form.getValues('username')}'s account has been updated` 
          : `${form.getValues('username')}'s account has been created`,
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

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('DELETE', `/api/users/${userId}`);
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'User deleted',
        description: 'The user has been deleted successfully',
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
    setEditingUser(null);
    setUserDialogOpen(false);
  };

  // Open dialog for editing a user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.reset({
      username: user.username,
      name: user.name,
      email: user.email,
      password: '', // Don't populate password for security
      tenantId: user.tenantId || 1,
      isSuperAdmin: user.isSuperAdmin
    });
    setUserDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (values: UserFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('userManagement.usersListTitle')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
          <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1" onClick={() => {
                setEditingUser(null);
                form.reset({
                  username: '',
                  name: '',
                  email: '',
                  password: '',
                  tenantId: 1,
                  isSuperAdmin: false
                });
              }}>
                <UserPlus className="h-4 w-4" />
                {t('userManagement.addUser')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? t('userManagement.editUser') : t('userManagement.addUser')}
                </DialogTitle>
                <DialogDescription>
                  {editingUser 
                    ? t('userManagement.editUserDescription') 
                    : t('userManagement.addUserDescription')}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('userManagement.username')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('userManagement.fullName')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input type="email" {...field} />
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
                              {...field} 
                              placeholder={editingUser ? "Leave blank to keep current password" : ""} 
                            />
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
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('userManagement.selectTenant')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                    <FormField
                      control={form.control}
                      name="isSuperAdmin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                          <div>
                            <FormLabel className="text-base">
                              {t('userManagement.superAdmin')}
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              {t('userManagement.superAdminDescription')}
                            </p>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
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
                      {editingUser ? t('common.save') : t('common.create')}
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
              <TableCaption>{t('userManagement.usersTableCaption')}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('userManagement.username')}</TableHead>
                  <TableHead>{t('userManagement.name')}</TableHead>
                  <TableHead>{t('userManagement.email')}</TableHead>
                  <TableHead>{t('userManagement.tenant')}</TableHead>
                  <TableHead>{t('userManagement.roles')}</TableHead>
                  <TableHead>{t('userManagement.admin')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {tenants?.find((t: any) => t.id === user.tenantId)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {user.roles?.join(', ') || '-'}
                    </TableCell>
                    <TableCell>
                      <Checkbox checked={user.isSuperAdmin} disabled />
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
    </div>
  );
};