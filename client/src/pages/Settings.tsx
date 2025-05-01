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
  Save
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
            <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="organization" className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                <span>Organization</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center">
                <SettingsIcon className="h-4 w-4 mr-2" />
                <span>Preferences</span>
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
            
            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Manage your language, timezone, and notification settings
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
                  
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-gray-600" />
                    Notification Settings
                  </h3>
                  
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
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
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
