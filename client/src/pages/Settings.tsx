import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  User, 
  Building, 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  Lock,
  Calendar,
  Mail,
  Save,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function Settings() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'Europe/London', label: 'London (GMT+0/BST)' },
    { value: 'Europe/Paris', label: 'Paris, Berlin, Rome (CET/CEST)' },
    { value: 'America/New_York', label: 'New York (EST/EDT)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Beijing, Shanghai (CST)' }
  ];
  
  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
  ];
  
  return (
    <Layout title={t('nav.settings')}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {t('nav.settings')}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {t('pages.settings.description')}
        </p>
        
        <div className="mt-6">
          <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full md:w-auto grid-cols-3 lg:grid-cols-6 md:inline-flex overflow-auto">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                <span>API Access</span>
              </TabsTrigger>
              <TabsTrigger value="display" className="flex items-center">
                <SettingsIcon className="h-4 w-4 mr-2" />
                <span>Display & Language</span>
              </TabsTrigger>
              <TabsTrigger value="questionnaire" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Questionnaire Config</span>
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center">
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
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Organization Tab */}
            <TabsContent value="organization">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                  <CardDescription>
                    Manage your organization details and EUDR compliance settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization name</Label>
                    <Input id="orgName" defaultValue="Global Compliance Inc." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="orgType">Organization type</Label>
                    <Select defaultValue="company">
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="ngo">NGO</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="orgRole">Your organization role</Label>
                    <Select defaultValue="operator">
                      <SelectTrigger>
                        <SelectValue placeholder="Select role in supply chain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operator">EU Operator</SelectItem>
                        <SelectItem value="trader">Trader</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="manufacturer">Manufacturer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoArchive">Auto-archive old declarations</Label>
                      <Switch id="autoArchive" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Automatically archive declarations older than 3 years
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>
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
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>
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
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
                          Allow managing users and system settings
                        </p>
                      </div>
                      <Switch id="adminAccess" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">Webhook Endpoints</h3>
                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">Webhook URL</Label>
                      <Input 
                        id="webhookUrl" 
                        placeholder="https://your-domain.com/webhook"
                        defaultValue="https://example.com/webhook/eudr-notify"
                      />
                      <p className="text-sm text-gray-500">
                        We'll send notifications to this URL when events occur
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="webhookEnabled">Enable Webhooks</Label>
                        <p className="text-sm text-gray-500">
                          Send real-time event notifications to your webhook URL
                        </p>
                      </div>
                      <Switch id="webhookEnabled" defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>
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
                        {timezones.map(tz => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
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
                        {dateFormats.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-md font-medium">Theme & Display</h3>
                  
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
                      <Label htmlFor="compactView">Compact View</Label>
                      <p className="text-sm text-gray-500">
                        Show more information in less space
                      </p>
                    </div>
                    <Switch id="compactView" />
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
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>
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
                    Configure self-assessment questionnaires for EUDR compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultTemplate">Default Questionnaire Template</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue placeholder="Select default template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard EUDR SAQ</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive EUDR Assessment</SelectItem>
                        <SelectItem value="simplified">Simplified EUDR SAQ</SelectItem>
                        <SelectItem value="custom">Custom Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-md font-medium mb-2">Questionnaire Sections</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sectionEnvironmental">Environmental Impact</Label>
                        <p className="text-sm text-gray-500">
                          Questions about environmental practices and impacts
                        </p>
                      </div>
                      <Switch id="sectionEnvironmental" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sectionSocial">Social Responsibility</Label>
                        <p className="text-sm text-gray-500">
                          Questions about labor practices and community relations
                        </p>
                      </div>
                      <Switch id="sectionSocial" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sectionGovernance">Governance & Compliance</Label>
                        <p className="text-sm text-gray-500">
                          Questions about policies, procedures, and record-keeping
                        </p>
                      </div>
                      <Switch id="sectionGovernance" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sectionRisk">Risk Assessment</Label>
                        <p className="text-sm text-gray-500">
                          Questions about risk identification and mitigation
                        </p>
                      </div>
                      <Switch id="sectionRisk" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sectionCertification">Certification</Label>
                        <p className="text-sm text-gray-500">
                          Questions about third-party certifications and audits
                        </p>
                      </div>
                      <Switch id="sectionCertification" defaultChecked />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-md font-medium mb-2">Assessment Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="requireEvidence">Require Supporting Evidence</Label>
                        <p className="text-sm text-gray-500">
                          Require document uploads for key questions
                        </p>
                      </div>
                      <Switch id="requireEvidence" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoReminders">Automatic Reminders</Label>
                        <p className="text-sm text-gray-500">
                          Send automatic reminders for incomplete questionnaires
                        </p>
                      </div>
                      <Switch id="autoReminders" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoAssessment">Automatic Risk Assessment</Label>
                        <p className="text-sm text-gray-500">
                          Automatically categorize risk levels based on responses
                        </p>
                      </div>
                      <Switch id="autoAssessment" defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" className="mr-2">
                    Edit Questions
                  </Button>
                  <Button>
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
                    Manage user roles and access permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">System Roles</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium mb-2">Admin</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          Full access to all features and settings
                        </p>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium mb-2">Compliance Manager</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          Manage declarations and compliance data
                        </p>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium mb-2">Supplier Manager</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          Manage suppliers and supplier data
                        </p>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium mb-2">Auditor</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          View-only access to compliance data
                        </p>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium mb-2">Supplier</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          Limited access to own data and questionnaires
                        </p>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 border-dashed flex items-center justify-center">
                        <Button variant="ghost" className="flex items-center">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom Role
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-md font-medium mb-2">Access Control Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactor">Require Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">
                          Require 2FA for all administrator accounts
                        </p>
                      </div>
                      <Switch id="twoFactor" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="accessLogs">Enable Access Logs</Label>
                        <p className="text-sm text-gray-500">
                          Log all user access and actions
                        </p>
                      </div>
                      <Switch id="accessLogs" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="ipRestriction">IP Restriction</Label>
                        <p className="text-sm text-gray-500">
                          Limit access to specific IP addresses
                        </p>
                      </div>
                      <Switch id="ipRestriction" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sessionTimeout">Session Timeout</Label>
                        <p className="text-sm text-gray-500">
                          Automatically log out inactive users after 60 minutes
                        </p>
                      </div>
                      <Switch id="sessionTimeout" defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>
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
