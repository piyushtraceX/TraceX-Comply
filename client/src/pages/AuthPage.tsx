import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContextV2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoaderIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Form data types
type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const [location, navigate] = useLocation();
  const { user, isLoading, login } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('login');

  // Create forms
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Handle login submission
  const onLoginSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  // Handle registration submission
  const onRegisterSubmit = async (data: RegisterFormData) => {
    // This would be implemented with a registration API call
    console.log('Registration data:', data);
    // For now, just switch to login tab
    setActiveTab('login');
    loginForm.setValue('username', data.username);
    loginForm.setValue('password', data.password);
  };
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderIcon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {activeTab === 'login' ? t('auth:login') : t('auth:register')}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'login' ? t('auth:loginDescription') : t('auth:registerDescription')}
            </CardDescription>
          </CardHeader>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">{t('auth:login')}</TabsTrigger>
              <TabsTrigger value="register">{t('auth:register')}</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <CardContent className="space-y-4 pt-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth:username')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('auth:usernamePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth:password')}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder={t('auth:passwordPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                      {loginForm.formState.isSubmitting ? (
                        <>
                          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          {t('common.processing')}
                        </>
                      ) : (
                        t('auth:loginButton')
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <CardContent className="space-y-4 pt-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth:username')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('auth:usernamePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth:email')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('auth:emailPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth:name')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('auth:namePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth:password')}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder={t('auth:passwordPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth:confirmPassword')}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder={t('auth:confirmPasswordPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={registerForm.formState.isSubmitting}>
                      {registerForm.formState.isSubmitting ? (
                        <>
                          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          {t('common.processing')}
                        </>
                      ) : (
                        t('auth:registerButton')
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex flex-1 bg-primary p-12 text-primary-foreground justify-center items-center flex-col">
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold">{t('app.name')}</h1>
          <p className="text-xl">{t('auth:heroTitle')}</p>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <span className="rounded-full bg-primary-foreground text-primary h-6 w-6 flex items-center justify-center text-sm">✓</span>
              <span>{t('auth:feature1')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="rounded-full bg-primary-foreground text-primary h-6 w-6 flex items-center justify-center text-sm">✓</span>
              <span>{t('auth:feature2')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="rounded-full bg-primary-foreground text-primary h-6 w-6 flex items-center justify-center text-sm">✓</span>
              <span>{t('auth:feature3')}</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="rounded-full bg-primary-foreground text-primary h-6 w-6 flex items-center justify-center text-sm">✓</span>
              <span>{t('auth:feature4')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;