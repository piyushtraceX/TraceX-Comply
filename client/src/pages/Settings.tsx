import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
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
  Shield,
  Briefcase,
  CreditCard,
  FileText,
  HardDrive,
  KeyRound,
  Database,
  Palette,
  ChevronRight,
  Check,
  ArrowRight
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { t } = useTranslation();
  const { language, changeLanguage, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('account');
  const { toast } = useToast();
  
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'Europe/London', label: 'London (GMT+0/BST)' },
    { value: 'Europe/Paris', label: 'Paris, Berlin, Rome (CET/CEST)' },
    { value: 'America/New_York', label: 'New York (EST/EDT)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Beijing, Shanghai (CST)' }
  ];
  
  const handleSave = (section: string) => {
    toast({
      title: "Settings saved",
      description: `Your ${section} settings have been updated successfully.`,
      duration: 3000,
    });
  };
  
  const handleLanguageChange = (value: string) => {
    changeLanguage(value);
    toast({
      title: "Language changed",
      description: `Interface language has been changed.`,
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
        
        <div className="mt-4">
          <Tabs defaultValue="account" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-64 flex-shrink-0">
                <Card className="border border-gray-200 shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="py-3 px-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-base font-medium text-gray-900">Settings</h3>
                    </div>
                    <TabsList className="flex flex-col w-full rounded-none p-0 bg-white">
                      <TabsTrigger 
                        value="account" 
                        className={cn(
                          "flex items-center justify-start rounded-none border-b border-gray-200 px-4 py-3 font-normal h-auto",
                          activeTab === "account" ? "bg-gray-50 border-r-4 border-r-primary-600" : "bg-white"
                        )}
                      >
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Account</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="security" 
                        className={cn(
                          "flex items-center justify-start rounded-none border-b border-gray-200 px-4 py-3 font-normal h-auto",
                          activeTab === "security" ? "bg-gray-50 border-r-4 border-r-primary-600" : "bg-white"
                        )}
                      >
                        <Shield className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Security</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="organization" 
                        className={cn(
                          "flex items-center justify-start rounded-none border-b border-gray-200 px-4 py-3 font-normal h-auto",
                          activeTab === "organization" ? "bg-gray-50 border-r-4 border-r-primary-600" : "bg-white"
                        )}
                      >
                        <Building className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Organization</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="billing" 
                        className={cn(
                          "flex items-center justify-start rounded-none border-b border-gray-200 px-4 py-3 font-normal h-auto",
                          activeTab === "billing" ? "bg-gray-50 border-r-4 border-r-primary-600" : "bg-white"
                        )}
                      >
                        <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Billing</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="notifications" 
                        className={cn(
                          "flex items-center justify-start rounded-none border-b border-gray-200 px-4 py-3 font-normal h-auto",
                          activeTab === "notifications" ? "bg-gray-50 border-r-4 border-r-primary-600" : "bg-white"
                        )}
                      >
                        <Bell className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Notifications</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="integrations" 
                        className={cn(
                          "flex items-center justify-start rounded-none border-b border-gray-200 px-4 py-3 font-normal h-auto",
                          activeTab === "integrations" ? "bg-gray-50 border-r-4 border-r-primary-600" : "bg-white"
                        )}
                      >
                        <Database className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Integrations</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="appearance" 
                        className={cn(
                          "flex items-center justify-start rounded-none border-b border-gray-200 px-4 py-3 font-normal h-auto",
                          activeTab === "appearance" ? "bg-gray-50 border-r-4 border-r-primary-600" : "bg-white"
                        )}
                      >
                        <Palette className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Appearance</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="language" 
                        className={cn(
                          "flex items-center justify-start rounded-none border-b border-gray-200 px-4 py-3 font-normal h-auto",
                          activeTab === "language" ? "bg-gray-50 border-r-4 border-r-primary-600" : "bg-white"
                        )}
                      >
                        <Globe className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Language</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="api" 
                        className={cn(
                          "flex items-center justify-start rounded-none px-4 py-3 font-normal h-auto",
                          activeTab === "api" ? "bg-gray-50 border-r-4 border-r-primary-600" : "bg-white"
                        )}
                      >
                        <KeyRound className="h-4 w-4 mr-2 text-gray-500" />
                        <span>API Keys</span>
                      </TabsTrigger>
                    </TabsList>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex-1">
                {/* Account Tab */}
                <TabsContent value="account" className="mt-0">
                  <Card className="border border-gray-200 shadow-sm overflow-hidden">
                    <CardHeader className="px-6 py-4 bg-white border-b border-gray-200">
                      <CardTitle className="text-xl font-semibold text-gray-900">Account Settings</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        Manage your account information and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-gray-900">Profile Picture</h3>
                          <div className="mt-2 flex space-x-3">
                            <Button variant="outline" size="sm" className="h-8">
                              Change
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-gray-600">
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First name</Label>
                          <Input id="firstName" defaultValue="Jane" className="bg-white" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last name</Label>
                          <Input id="lastName" defaultValue="Cooper" className="bg-white" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email address</Label>
                          <Input id="email" type="email" defaultValue="jane@example.com" className="bg-white" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone number</Label>
                          <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" className="bg-white" />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job title</Label>
                        <Input id="jobTitle" defaultValue="Compliance Manager" className="bg-white" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select defaultValue="compliance">
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compliance">Compliance</SelectItem>
                            <SelectItem value="legal">Legal</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="supplyChain">Supply Chain</SelectItem>
                            <SelectItem value="management">Management</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                      <Button onClick={() => handleSave('account')}>
                        Save changes
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border border-gray-200 shadow-sm overflow-hidden mt-6">
                    <CardHeader className="px-6 py-4 bg-white border-b border-gray-200">
                      <CardTitle className="text-xl font-semibold text-gray-900">Time Zone & Regional Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Time zone</Label>
                        <Select defaultValue="Europe/Paris">
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select time zone" />
                          </SelectTrigger>
                          <SelectContent>
                            {timezones.map(tz => (
                              <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dateFormat">Date format</Label>
                        <Select defaultValue="dd/MM/yyyy">
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select date format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (01/31/2025)</SelectItem>
                            <SelectItem value="dd/MM/yyyy">DD/MM/YYYY (31/01/2025)</SelectItem>
                            <SelectItem value="yyyy-MM-dd">YYYY-MM-DD (2025-01-31)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select defaultValue="EUR">
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                            <SelectItem value="USD">US Dollar ($)</SelectItem>
                            <SelectItem value="GBP">British Pound (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                      <Button onClick={() => handleSave('regional settings')}>
                        Save changes
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Language Tab */}
                <TabsContent value="language" className="mt-0">
                  <Card className="border border-gray-200 shadow-sm overflow-hidden">
                    <CardHeader className="px-6 py-4 bg-white border-b border-gray-200">
                      <CardTitle className="text-xl font-semibold text-gray-900">Language Settings</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        Choose your preferred language for the interface
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                          <Label htmlFor="language" className="text-base font-medium text-gray-900 mb-1 block">Interface Language</Label>
                          <p className="text-sm text-gray-500 mb-3">Select the language you want to use for the application interface</p>
                          <div className="space-y-4">
                            <div className={cn("flex items-center px-4 py-3 border rounded-lg", 
                              language === "en" ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-white"
                            )}>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="mr-2 text-base font-medium">English</span>
                                  <Badge variant="outline" className="bg-gray-100 text-gray-800 px-2 py-0.5 text-xs">Default</Badge>
                                </div>
                                <p className="text-sm text-gray-500">English (United States)</p>
                              </div>
                              {language === "en" ? (
                                <div className="flex-shrink-0 h-6 w-6 bg-primary-500 rounded-full flex items-center justify-center">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8"
                                  onClick={() => handleLanguageChange('en')}
                                >
                                  Select
                                </Button>
                              )}
                            </div>
                            
                            <div className={cn("flex items-center px-4 py-3 border rounded-lg", 
                              language === "fr" ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-white"
                            )}>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="mr-2 text-base font-medium">French</span>
                                </div>
                                <p className="text-sm text-gray-500">Français</p>
                              </div>
                              {language === "fr" ? (
                                <div className="flex-shrink-0 h-6 w-6 bg-primary-500 rounded-full flex items-center justify-center">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8"
                                  onClick={() => handleLanguageChange('fr')}
                                >
                                  Select
                                </Button>
                              )}
                            </div>
                            
                            <div className={cn("flex items-center px-4 py-3 border rounded-lg", 
                              language === "de" ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-white"
                            )}>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="mr-2 text-base font-medium">German</span>
                                </div>
                                <p className="text-sm text-gray-500">Deutsch</p>
                              </div>
                              {language === "de" ? (
                                <div className="flex-shrink-0 h-6 w-6 bg-primary-500 rounded-full flex items-center justify-center">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8"
                                  onClick={() => handleLanguageChange('de')}
                                >
                                  Select
                                </Button>
                              )}
                            </div>
                            
                            <div className={cn("flex items-center px-4 py-3 border rounded-lg", 
                              language === "ar" ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-white"
                            )}>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="mr-2 text-base font-medium">Arabic</span>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-800 px-2 py-0.5 text-xs">RTL</Badge>
                                </div>
                                <p className="text-sm text-gray-500">العربية</p>
                              </div>
                              {language === "ar" ? (
                                <div className="flex-shrink-0 h-6 w-6 bg-primary-500 rounded-full flex items-center justify-center">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8"
                                  onClick={() => handleLanguageChange('ar')}
                                >
                                  Select
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 shadow-sm overflow-hidden mt-6">
                    <CardHeader className="px-6 py-4 bg-white border-b border-gray-200">
                      <CardTitle className="text-xl font-semibold text-gray-900">Export Language</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        Choose the language for exported documents and reports
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="exportLanguage" className="text-base font-medium text-gray-900">Export Language</Label>
                        <p className="text-sm text-gray-500 mb-3">Documents and reports will be exported in this language</p>
                        <Select defaultValue="follow-interface">
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select export language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="follow-interface">Follow interface language</SelectItem>
                            <SelectItem value="en">Always English</SelectItem>
                            <SelectItem value="fr">Always French</SelectItem>
                            <SelectItem value="de">Always German</SelectItem>
                            <SelectItem value="ar">Always Arabic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                      <Button onClick={() => handleSave('export language')}>
                        Save changes
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Appearance Tab */}
                <TabsContent value="appearance" className="mt-0">
                  <Card className="border border-gray-200 shadow-sm overflow-hidden">
                    <CardHeader className="px-6 py-4 bg-white border-b border-gray-200">
                      <CardTitle className="text-xl font-semibold text-gray-900">Display Preferences</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        Customize the appearance of your EUDR Comply interface
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-6">
                        <div>
                          <Label className="text-base font-medium text-gray-900 mb-1 block">Theme</Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                            <div className="flex flex-col items-center border border-primary-500 rounded-lg p-4 bg-primary-50">
                              <div className="h-20 w-full bg-white border border-gray-200 rounded mb-3 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-4 bg-primary-500"></div>
                                <div className="absolute top-4 bottom-0 left-0 w-10 bg-gray-100"></div>
                              </div>
                              <div className="text-sm font-medium text-gray-900">Light</div>
                              <div className="text-xs text-gray-500 mt-1">Default</div>
                              <div className="mt-2">
                                <Badge variant="outline" className="bg-primary-100 text-primary-800 border-0">
                                  Active
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-center border border-gray-200 rounded-lg p-4 bg-white">
                              <div className="h-20 w-full bg-gray-900 border border-gray-700 rounded mb-3 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-4 bg-primary-600"></div>
                                <div className="absolute top-4 bottom-0 left-0 w-10 bg-gray-800"></div>
                              </div>
                              <div className="text-sm font-medium text-gray-900">Dark</div>
                              <div className="text-xs text-gray-500 mt-1">Coming soon</div>
                              <div className="mt-2">
                                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                                  Disabled
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-center border border-gray-200 rounded-lg p-4 bg-white">
                              <div className="h-20 w-full rounded mb-3 relative overflow-hidden" style={{ background: 'linear-gradient(to right, white 50%, #1e293b 50%)' }}>
                                <div className="absolute top-0 left-0 right-0 h-4 bg-primary-500" style={{ background: 'linear-gradient(to right, #0891b2 50%, #06b6d4 50%)' }}></div>
                                <div className="absolute top-4 bottom-0 left-0 w-10 bg-gray-100" style={{ background: 'linear-gradient(to right, #f1f5f9 50%, #334155 50%)' }}></div>
                              </div>
                              <div className="text-sm font-medium text-gray-900">System</div>
                              <div className="text-xs text-gray-500 mt-1">Coming soon</div>
                              <div className="mt-2">
                                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                                  Disabled
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          <Label className="text-base font-medium text-gray-900 mb-1 block">Density</Label>
                          <div className="flex flex-col space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                              <div>
                                <div className="text-sm font-medium text-gray-900">Comfortable</div>
                                <div className="text-xs text-gray-500">More space between items (default)</div>
                              </div>
                              <div className="h-5 w-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                                <div className="h-2.5 w-2.5 rounded-full bg-primary-500"></div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                              <div>
                                <div className="text-sm font-medium text-gray-900">Compact</div>
                                <div className="text-xs text-gray-500">Reduced spacing to fit more content</div>
                              </div>
                              <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          <Label className="text-base font-medium text-gray-900 mb-1 block">Home Page</Label>
                          <div className="space-y-2">
                            <Label htmlFor="homePage">Default page after login</Label>
                            <Select defaultValue="dashboard">
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select default page" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dashboard">Dashboard</SelectItem>
                                <SelectItem value="supply-chain">Supply Chain</SelectItem>
                                <SelectItem value="compliance">Compliance</SelectItem>
                                <SelectItem value="declarations">EUDR Declarations</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                      <Button onClick={() => handleSave('appearance')}>
                        Save changes
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Placeholder for other tabs */}
                {["security", "organization", "billing", "notifications", "integrations", "api"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-0">
                    <Card className="border border-gray-200 shadow-sm overflow-hidden">
                      <CardHeader className="px-6 py-4 bg-white border-b border-gray-200">
                        <CardTitle className="text-xl font-semibold text-gray-900">{tab.charAt(0).toUpperCase() + tab.slice(1)} Settings</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          Manage your {tab} settings and preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 min-h-[300px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="mb-4 border border-gray-200 rounded-full p-4 inline-block">
                            {tab === "security" && <Shield className="h-8 w-8 text-primary-500" />}
                            {tab === "organization" && <Building className="h-8 w-8 text-primary-500" />}
                            {tab === "billing" && <CreditCard className="h-8 w-8 text-primary-500" />}
                            {tab === "notifications" && <Bell className="h-8 w-8 text-primary-500" />}
                            {tab === "integrations" && <Database className="h-8 w-8 text-primary-500" />}
                            {tab === "api" && <KeyRound className="h-8 w-8 text-primary-500" />}
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} settings will be available soon
                          </h3>
                          <p className="text-gray-500 mb-4">
                            This section is currently under development and will be available in a future update.
                          </p>
                          <Button variant="outline">
                            Request early access
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}