import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  Check,
  Save,
  User,
  Globe,
  Bell,
  Settings as SettingsIcon,
  Lock,
  Mail,
  Calendar,
  FileText,
  Key,
  Plus,
  DownloadCloud,
  Copy,
  RefreshCw,
  Clipboard,
  Trash2,
  Edit,
  ChevronDown,
  AlertTriangle
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
import { Badge } from "@/components/ui/badge";

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
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className={cn("md:flex md:items-center md:justify-between mb-6", isRTL && "md:flex-row-reverse")}>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {t('nav.settings')}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t('pages.settings.description')}
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <Tabs defaultValue="profile" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full md:w-auto grid-cols-3 lg:grid-cols-6 md:inline-flex overflow-auto bg-gray-100 p-1 rounded-md">
              <TabsTrigger 
                value="profile" 
                className="flex items-center"
              >
                <User className="h-4 w-4 mr-2" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex items-center"
              >
                <Bell className="h-4 w-4 mr-2" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger 
                value="api" 
                className="flex items-center"
              >
                <Key className="h-4 w-4 mr-2" />
                <span>API Access</span>
              </TabsTrigger>
              <TabsTrigger 
                value="display" 
                className="flex items-center"
              >
                <Globe className="h-4 w-4 mr-2" />
                <span>Display & Language</span>
              </TabsTrigger>
              <TabsTrigger 
                value="questionnaire" 
                className="flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                <span>Questionnaire Config</span>
              </TabsTrigger>
              <TabsTrigger 
                value="roles" 
                className="flex items-center"
              >
                <Lock className="h-4 w-4 mr-2" />
                <span>Roles & Access</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-500" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        Change Avatar
                      </Button>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, GIF or PNG. Max size 2MB.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" defaultValue="Jane" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" defaultValue="Cooper" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" defaultValue="jane@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Job title</Label>
                    <Input id="title" defaultValue="Compliance Manager" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Write a short bio about yourself..." 
                      defaultValue="I manage EUDR compliance for our organization and help suppliers comply with regulations."
                      className="h-24"
                    />
                    <p className="text-xs text-gray-500">
                      Brief description of your role and responsibilities.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('profile')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <h3 className="text-md font-medium">Notification Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotif">Email Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch id="emailNotif" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="browserNotif">Browser Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Receive notifications in your browser
                        </p>
                      </div>
                      <Switch id="browserNotif" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsNotif">SMS Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Receive important alerts via SMS
                        </p>
                      </div>
                      <Switch id="smsNotif" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-md font-medium">Notification Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="declarationAlerts">Declaration Alerts</Label>
                        <p className="text-sm text-gray-500">
                          Get notified about new or updated declarations
                        </p>
                      </div>
                      <Switch id="declarationAlerts" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="complianceAlerts">Compliance Alerts</Label>
                        <p className="text-sm text-gray-500">
                          Get notified about compliance issues or updates
                        </p>
                      </div>
                      <Switch id="complianceAlerts" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="documentAlerts">Document Alerts</Label>
                        <p className="text-sm text-gray-500">
                          Get notified about document uploads and verification
                        </p>
                      </div>
                      <Switch id="documentAlerts" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="systemAlerts">System Alerts</Label>
                        <p className="text-sm text-gray-500">
                          Get notified about system updates and maintenance
                        </p>
                      </div>
                      <Switch id="systemAlerts" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-md font-medium">Frequency</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="frequency">Notification Frequency</Label>
                        <p className="text-sm text-gray-500">
                          How often you want to receive notifications
                        </p>
                      </div>
                      <Select defaultValue="realtime">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Realtime</SelectItem>
                          <SelectItem value="hourly">Hourly digest</SelectItem>
                          <SelectItem value="daily">Daily digest</SelectItem>
                          <SelectItem value="weekly">Weekly digest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('notifications')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* API Access Tab */}
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API Access</CardTitle>
                  <CardDescription>
                    Manage API keys and integration settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-md font-medium mb-2">Your API Key</h3>
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="password" 
                        value="sk_test_51M9EUDR3gul4rty0mpl1an_XXXXXXXXXXXXXX" 
                        readOnly 
                        className="bg-gray-100 font-mono text-sm"
                      />
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Keep this key secret. Never share it or expose it in client-side code.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">API Permissions</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="readAccess">Read Access</Label>
                        <p className="text-sm text-gray-500">
                          Allow reading declarations and compliance data
                        </p>
                      </div>
                      <Switch id="readAccess" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="writeAccess">Write Access</Label>
                        <p className="text-sm text-gray-500">
                          Allow creating and updating declarations
                        </p>
                      </div>
                      <Switch id="writeAccess" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="adminAccess">Admin Access</Label>
                        <p className="text-sm text-gray-500">
                          Allow administrative operations
                        </p>
                      </div>
                      <Switch id="adminAccess" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-md font-medium">Webhook Endpoint</h3>
                    <Input 
                      placeholder="https://your-server.com/eudr-webhooks" 
                      className="font-mono text-sm"
                    />
                    <p className="text-sm text-gray-500">
                      We'll send webhook events to this URL when declaration status changes
                    </p>
                  </div>
                  
                  <div className="space-y-4 mt-4">
                    <h3 className="text-md font-medium">API Documentation</h3>
                    <div className="flex items-center">
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View API Documentation
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-amber-800">API Rate Limits</h3>
                        <p className="text-sm text-amber-700 mt-1">
                          Your current plan allows 5,000 API requests per day. 
                          You have used 1,203 requests today.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('api')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save API Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Display & Language Tab */}
            <TabsContent value="display">
              <Card>
                <CardHeader>
                  <CardTitle>Display & Language</CardTitle>
                  <CardDescription>
                    Customize your interface language and display preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={changeLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="Europe/Paris">
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT+0/BST)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris, Berlin, Rome (CET/CEST)</SelectItem>
                        <SelectItem value="America/New_York">New York (EST/EDT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Los Angeles (PST/PDT)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        <SelectItem value="Asia/Shanghai">Beijing, Shanghai (CST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date format</Label>
                    <Select defaultValue="DD/MM/YYYY">
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="darkMode">Dark Mode</Label>
                        <p className="text-sm text-gray-500">
                          Enable dark mode for the interface
                        </p>
                      </div>
                      <Switch id="darkMode" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="highContrast">High Contrast</Label>
                        <p className="text-sm text-gray-500">
                          Increase contrast for better visibility
                        </p>
                      </div>
                      <Switch id="highContrast" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="compactView">Compact View</Label>
                        <p className="text-sm text-gray-500">
                          Show more information in less space
                        </p>
                      </div>
                      <Switch id="compactView" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultPage">Default landing page</Label>
                    <Select defaultValue="dashboard">
                      <SelectTrigger>
                        <SelectValue placeholder="Select default page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="supply-chain">Supply Chain</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="declarations">EUDR Declarations</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Choose which page to show when you log in to the application
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('display and language')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Display Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Questionnaire Configuration Tab */}
            <TabsContent value="questionnaire">
              <Card>
                <CardHeader>
                  <CardTitle>Questionnaire Configuration</CardTitle>
                  <CardDescription>
                    Configure self-assessment questionnaire settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultDeadline">Default deadline (days)</Label>
                    <Input 
                      id="defaultDeadline" 
                      type="number" 
                      defaultValue={30} 
                      min={1} 
                      max={365}
                    />
                    <p className="text-sm text-gray-500">
                      Default number of days suppliers have to complete questionnaires
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reminderFrequency">Reminder frequency (days)</Label>
                    <Input 
                      id="reminderFrequency" 
                      type="number" 
                      defaultValue={7} 
                      min={1} 
                      max={30}
                    />
                    <p className="text-sm text-gray-500">
                      How often to send reminder notifications for incomplete questionnaires
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultQuestionnaireTemplate">Default questionnaire template</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard EUDR Assessment</SelectItem>
                        <SelectItem value="extended">Extended Compliance Review</SelectItem>
                        <SelectItem value="brief">Brief Initial Assessment</SelectItem>
                        <SelectItem value="custom">Custom Template</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Default template to use when creating new questionnaires
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoReminders">Automatic Reminders</Label>
                        <p className="text-sm text-gray-500">
                          Send automatic reminder emails to suppliers
                        </p>
                      </div>
                      <Switch id="autoReminders" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoArchive">Auto-archive</Label>
                        <p className="text-sm text-gray-500">
                          Automatically archive completed questionnaires after 1 year
                        </p>
                      </div>
                      <Switch id="autoArchive" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="alertOnExpiry">Alert on expiry</Label>
                        <p className="text-sm text-gray-500">
                          Send alerts when questionnaires are about to expire
                        </p>
                      </div>
                      <Switch id="alertOnExpiry" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enableComments">Enable comments</Label>
                        <p className="text-sm text-gray-500">
                          Allow suppliers to add comments to their responses
                        </p>
                      </div>
                      <Switch id="enableComments" defaultChecked />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">Questionnaire Templates</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium">Manage Custom Templates</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Create, edit, and delete custom questionnaire templates
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <SettingsIcon className="h-4 w-4 mr-2" />
                          Manage Templates
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium">Import/Export Templates</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Import or export questionnaire templates
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <DownloadCloud className="h-4 w-4 mr-2" />
                            Import
                          </Button>
                          <Button variant="outline" size="sm">
                            <DownloadCloud className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('questionnaire')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Questionnaire Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Roles & Access Tab */}
            <TabsContent value="roles">
              <Card>
                <CardHeader>
                  <CardTitle>Roles & Access Control</CardTitle>
                  <CardDescription>
                    Manage user roles and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Users
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Administrator
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Full system access
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            2
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Compliance Officer
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Manage compliance documentation
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            5
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Declaration Specialist
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Create and manage declarations
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            3
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Auditor
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Read-only access to all data
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            2
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Role
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">Access Settings</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactor">Require Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">
                          Require 2FA for all administrative accounts
                        </p>
                      </div>
                      <Switch id="twoFactor" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                        <p className="text-sm text-gray-500">
                          Automatically log out inactive users
                        </p>
                      </div>
                      <Input 
                        id="sessionTimeout" 
                        type="number" 
                        defaultValue={30} 
                        min={5} 
                        max={240}
                        className="w-24 text-right"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="passwordPolicy">Password Policy</Label>
                        <p className="text-sm text-gray-500">
                          Set password requirements for all users
                        </p>
                      </div>
                      <Select defaultValue="strong">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select policy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="strong">Strong</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium">User Management</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Manage users, permissions, and role assignments
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        Manage Users
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('roles and access')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Access Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}