import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  Check,
  Save,
  Undo,
  User,
  Globe,
  Bell,
  Moon,
  Sun,
  Info,
  Lock,
  Mail,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Settings() {
  const { t } = useTranslation();
  const { language, changeLanguage, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Settings saved",
      description: `Your ${section} settings have been updated successfully.`,
      duration: 3000,
    });
  };

  return (
    <Layout title={t('nav.settings')}>
      <div className="container py-6">
        <div className={cn("flex justify-between items-center mb-8", isRTL && "flex-row-reverse")}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">{t('pages.settings.description')}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <Tabs defaultValue="profile" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200">
              <TabsList className="flex w-full p-0 bg-transparent border-0">
                <TabsTrigger 
                  value="profile" 
                  className={cn(
                    "data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1 rounded-none py-3 px-4 font-medium text-sm border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:text-primary-600"
                  )}
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="account" 
                  className={cn(
                    "data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1 rounded-none py-3 px-4 font-medium text-sm border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:text-primary-600"
                  )}
                >
                  Account
                </TabsTrigger>
                <TabsTrigger 
                  value="appearance" 
                  className={cn(
                    "data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1 rounded-none py-3 px-4 font-medium text-sm border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:text-primary-600"
                  )}
                >
                  Appearance
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className={cn(
                    "data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1 rounded-none py-3 px-4 font-medium text-sm border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:text-primary-600"
                  )}
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="language" 
                  className={cn(
                    "data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1 rounded-none py-3 px-4 font-medium text-sm border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:text-primary-600"
                  )}
                >
                  Language
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Profile Tab */}
            <TabsContent value="profile" className="p-6">
              <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-1">Personal Information</h2>
                  <p className="text-sm text-gray-500">Update your personal details</p>
                </div>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="h-9">
                        Change
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9 text-gray-600">
                        Remove
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, GIF or PNG. Max size 1MB.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First name
                    </Label>
                    <Input 
                      id="firstName" 
                      placeholder="Enter your first name" 
                      defaultValue="Jane" 
                      className="mt-1 bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last name
                    </Label>
                    <Input 
                      id="lastName" 
                      placeholder="Enter your last name" 
                      defaultValue="Cooper" 
                      className="mt-1 bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      defaultValue="jane@example.com" 
                      className="mt-1 bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-sm font-medium">
                      Role
                    </Label>
                    <Input 
                      id="role" 
                      placeholder="Your job title" 
                      defaultValue="Compliance Officer" 
                      className="mt-1 bg-white"
                    />
                  </div>
                </div>
                
                <div className="mb-8">
                  <Label htmlFor="bio" className="text-sm font-medium">
                    Bio
                  </Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Write a short bio..." 
                    defaultValue="I manage EUDR compliance for my organization and work with suppliers to ensure adherence to regulations." 
                    className="mt-1 h-24 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Brief description for your profile.
                  </p>
                </div>
                
                <Separator className="my-8" />
                
                <div className="flex justify-end">
                  <Button variant="outline" className="mr-2">Cancel</Button>
                  <Button onClick={() => handleSaveSettings('profile')}>
                    Save changes
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="p-6">
              <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-1">Account Settings</h2>
                  <p className="text-sm text-gray-500">Manage your account preferences</p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Your account is connected to EUDR Comply</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Your organization's account is managed by your administrator.
                        Contact them for any account-related questions.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Two-factor authentication</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Account activity log</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        View a log of activities and events related to your account
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View log
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Change password</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Update your password for improved security
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                </div>
                
                <div className="border border-red-200 rounded-lg p-4 mb-8">
                  <h3 className="text-sm font-medium text-red-600 flex items-center">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <div className="mt-3">
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                      Delete account
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="p-6">
              <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-1">Appearance Settings</h2>
                  <p className="text-sm text-gray-500">Customize how the application looks</p>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Theme</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-primary-600 rounded-lg p-4 bg-primary-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Sun className="h-5 w-5 text-gray-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">Light</span>
                        </div>
                        <div className="h-5 w-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="h-24 bg-white border border-gray-200 rounded-md"></div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Moon className="h-5 w-5 text-gray-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">Dark</span>
                        </div>
                      </div>
                      <div className="h-24 bg-gray-800 border border-gray-700 rounded-md"></div>
                      <div className="mt-2 text-center text-xs text-gray-500">Coming soon</div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="mr-2 h-5 w-5 rounded-full overflow-hidden bg-gradient-to-tr from-gray-50 to-gray-900 flex items-center justify-center">
                            <Sun className="h-3 w-3 text-gray-800" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">System</span>
                        </div>
                      </div>
                      <div className="h-24 rounded-md overflow-hidden">
                        <div className="h-12 bg-white border-b border-gray-200"></div>
                        <div className="h-12 bg-gray-800"></div>
                      </div>
                      <div className="mt-2 text-center text-xs text-gray-500">Coming soon</div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-8" />
                
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Density</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center mr-3">
                        <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Comfortable</span>
                        <p className="text-xs text-gray-500">Default spacing between elements</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full border border-gray-300 mr-3"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Compact</span>
                        <p className="text-xs text-gray-500">Reduced spacing to fit more content</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-8" />
                
                <div className="flex justify-end">
                  <Button variant="outline" className="mr-2">Cancel</Button>
                  <Button onClick={() => handleSaveSettings('appearance')}>
                    Save changes
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="p-6">
              <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-1">Notification Preferences</h2>
                  <p className="text-sm text-gray-500">Control when and how you receive notifications</p>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Email Notifications</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Compliance alerts</span>
                        <p className="text-xs text-gray-500">Receive emails about compliance status changes</p>
                      </div>
                      <Switch defaultChecked id="compliance-email" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Document updates</span>
                        <p className="text-xs text-gray-500">Receive emails when documents are uploaded or modified</p>
                      </div>
                      <Switch defaultChecked id="document-email" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Supplier responses</span>
                        <p className="text-xs text-gray-500">Receive emails when suppliers respond to questionnaires</p>
                      </div>
                      <Switch defaultChecked id="supplier-email" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">System updates</span>
                        <p className="text-xs text-gray-500">Receive emails about system changes and maintenance</p>
                      </div>
                      <Switch id="system-email" />
                    </div>
                  </div>
                </div>
                
                <Separator className="my-8" />
                
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">In-App Notifications</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Compliance alerts</span>
                        <p className="text-xs text-gray-500">Receive in-app notifications about compliance status changes</p>
                      </div>
                      <Switch defaultChecked id="compliance-app" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Document updates</span>
                        <p className="text-xs text-gray-500">Receive in-app notifications when documents are uploaded or modified</p>
                      </div>
                      <Switch defaultChecked id="document-app" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Supplier responses</span>
                        <p className="text-xs text-gray-500">Receive in-app notifications when suppliers respond to questionnaires</p>
                      </div>
                      <Switch defaultChecked id="supplier-app" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">System notifications</span>
                        <p className="text-xs text-gray-500">Receive in-app notifications about system status</p>
                      </div>
                      <Switch defaultChecked id="system-app" />
                    </div>
                  </div>
                </div>
                
                <Separator className="my-8" />
                
                <div className="flex justify-end">
                  <Button variant="outline" className="mr-2">Cancel</Button>
                  <Button onClick={() => handleSaveSettings('notifications')}>
                    Save changes
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Language Tab */}
            <TabsContent value="language" className="p-6">
              <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-1">Language Settings</h2>
                  <p className="text-sm text-gray-500">Choose your preferred language for the interface</p>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Application Language</h3>
                  
                  <div className="grid gap-3">
                    <div 
                      className={cn(
                        "flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                        language === "en" ? "border-primary-500 bg-primary-50" : "border-gray-200"
                      )}
                      onClick={() => changeLanguage("en")}
                    >
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">English</span>
                          <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">Default</span>
                        </div>
                        <p className="text-sm text-gray-500">English (United States)</p>
                      </div>
                      {language === "en" && (
                        <Check className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                    
                    <div 
                      className={cn(
                        "flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                        language === "fr" ? "border-primary-500 bg-primary-50" : "border-gray-200"
                      )}
                      onClick={() => changeLanguage("fr")}
                    >
                      <div>
                        <span className="font-medium">French</span>
                        <p className="text-sm text-gray-500">Français</p>
                      </div>
                      {language === "fr" && (
                        <Check className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                    
                    <div 
                      className={cn(
                        "flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                        language === "de" ? "border-primary-500 bg-primary-50" : "border-gray-200"
                      )}
                      onClick={() => changeLanguage("de")}
                    >
                      <div>
                        <span className="font-medium">German</span>
                        <p className="text-sm text-gray-500">Deutsch</p>
                      </div>
                      {language === "de" && (
                        <Check className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                    
                    <div 
                      className={cn(
                        "flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                        language === "ar" ? "border-primary-500 bg-primary-50" : "border-gray-200"
                      )}
                      onClick={() => changeLanguage("ar")}
                    >
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">Arabic</span>
                          <span className="ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">RTL</span>
                        </div>
                        <p className="text-sm text-gray-500">العربية</p>
                      </div>
                      {language === "ar" && (
                        <Check className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator className="my-8" />
                
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Date and Number Formats</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="dateFormat" className="text-sm font-medium">
                        Date format
                      </Label>
                      <Select defaultValue="dd/MM/yyyy">
                        <SelectTrigger className="mt-1 bg-white">
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (01/31/2025)</SelectItem>
                          <SelectItem value="dd/MM/yyyy">DD/MM/YYYY (31/01/2025)</SelectItem>
                          <SelectItem value="yyyy-MM-dd">YYYY-MM-DD (2025-01-31)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="numberFormat" className="text-sm font-medium">
                        Number format
                      </Label>
                      <Select defaultValue="1,234.56">
                        <SelectTrigger className="mt-1 bg-white">
                          <SelectValue placeholder="Select number format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1,234.56">1,234.56 (US/UK)</SelectItem>
                          <SelectItem value="1.234,56">1.234,56 (Europe)</SelectItem>
                          <SelectItem value="1 234,56">1 234,56 (France)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" className="mr-2">Reset to defaults</Button>
                  <Button onClick={() => handleSaveSettings('language')}>
                    Save changes
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}