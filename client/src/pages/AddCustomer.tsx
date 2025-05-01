import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  Save, 
  Building, 
  Mail, 
  Phone, 
  Globe,
  User,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

// Define the form validation schema
const formSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  country: z.string().min(1, 'Country is required'),
  address: z.string().min(1, 'Address is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  website: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  riskScore: z.number().min(0).max(100),
  notes: z.string().optional(),
  enableNotifications: z.boolean().default(true),
  subscribeToUpdates: z.boolean().default(true)
});

type FormData = z.infer<typeof formSchema>;

export default function AddCustomer() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [location, navigate] = useLocation();

  // Define form with default values
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      industry: '',
      country: '',
      address: '',
      contactPerson: '',
      email: '',
      phone: '',
      website: '',
      riskLevel: 'low',
      riskScore: 30,
      notes: '',
      enableNotifications: true,
      subscribeToUpdates: true
    }
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    
    // In a real app, this would call an API to save the data
    // For now, we'll just navigate back to the customers page
    navigate('/customers');
  };

  const industries = [
    "Retail",
    "Food & Beverage",
    "Apparel",
    "Technology",
    "Home Goods",
    "Manufacturing",
    "Agriculture",
    "Construction",
    "Transportation",
    "Healthcare"
  ];
  
  const countries = [
    "United States",
    "Germany",
    "France",
    "United Kingdom",
    "Netherlands",
    "Sweden",
    "Italy",
    "Spain",
    "Japan",
    "Australia"
  ];

  return (
    <Layout title="Add Customer">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6">
          <Link href="/customers" className="text-primary-600 hover:text-primary-700 flex items-center mb-4">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Customers</span>
          </Link>
          
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Add New Customer
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Add a new customer company to your network
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Enter the basic details about this customer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industries.map(industry => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
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
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map(country => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Contact details for the customer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. www.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>
                  Assess the customer's risk level and score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="riskLevel"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Risk Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="low" id="low-risk" />
                            <Label htmlFor="low-risk" className="font-normal text-green-700">
                              Low Risk
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium-risk" />
                            <Label htmlFor="medium-risk" className="font-normal text-amber-700">
                              Medium Risk
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high-risk" />
                            <Label htmlFor="high-risk" className="font-normal text-red-700">
                              High Risk
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="riskScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Score (0-100)</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Slider
                            value={[field.value]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                          <div className="flex justify-between">
                            <span className="text-sm text-green-600">Low Risk (0-30)</span>
                            <span className="text-sm text-amber-600">Medium Risk (31-70)</span>
                            <span className="text-sm text-red-600">High Risk (71-100)</span>
                          </div>
                          <div className="text-center">
                            <span className="text-xl font-semibold">{field.value}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Adjust the risk score based on your assessment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="enableNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Enable Notifications
                          </FormLabel>
                          <FormDescription>
                            Receive notifications about this customer's activities
                          </FormDescription>
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
                  
                  <FormField
                    control={form.control}
                    name="subscribeToUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Subscribe to Updates
                          </FormLabel>
                          <FormDescription>
                            Subscribe this customer to compliance updates
                          </FormDescription>
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
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter any additional notes about this customer"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => navigate('/customers')}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Customer
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}