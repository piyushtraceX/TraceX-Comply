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
  MapPin, 
  Mail, 
  Phone, 
  Globe,
  User,
  CheckCircle2
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
import { Badge } from '@/components/ui/badge';

// Define the form validation schema
const formSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(1, 'Address is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  website: z.string().optional(),
  products: z.string().min(1, 'Products are required'),
  riskLevel: z.enum(['low', 'medium', 'high']),
  certifications: z.array(z.string()).optional(),
  sendWelcomeEmail: z.boolean().default(true),
  requestDocumentation: z.boolean().default(true),
  notes: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

export default function AddSupplier() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [location, navigate] = useLocation();

  // Define form with default values
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      address: '',
      contactPerson: '',
      email: '',
      phone: '',
      website: '',
      products: '',
      riskLevel: 'low',
      certifications: [],
      sendWelcomeEmail: true,
      requestDocumentation: true,
      notes: ''
    }
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    
    // In a real app, this would call an API to save the data
    // For now, we'll just navigate back to the supply chain page
    navigate('/supply-chain');
  };

  const regions = [
    "Brazil", 
    "Indonesia", 
    "Ghana", 
    "Colombia", 
    "Peru", 
    "Cameroon",
    "Europe",
    "North America",
    "Asia",
    "Africa"
  ];
  
  const certifications = [
    "FSC", 
    "PEFC", 
    "Rainforest Alliance", 
    "RSPO", 
    "Fairtrade",
    "Organic"
  ];

  return (
    <Layout title="Add Supplier">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6">
          <Link href="/supply-chain" className="text-primary-600 hover:text-primary-700 flex items-center mb-4">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Supply Chain</span>
          </Link>
          
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Add New Supplier
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Add a new supplier to your supply chain network
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic details about this supplier
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region/Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map(region => (
                              <SelectItem key={region} value={region}>
                                {region}
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
                </div>
                
                <FormField
                  control={form.control}
                  name="products"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Products</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Wood, Paper, Rubber (comma separated)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the products supplied, separated by commas
                      </FormDescription>
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
                  Contact details for the supplier
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
            
            {/* Risk & Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Risk & Compliance</CardTitle>
                <CardDescription>
                  Assess the supplier's risk level and compliance information
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
                
                {/* Certifications (would typically use a multi-select in a real implementation) */}
                <div className="space-y-1">
                  <FormLabel className="text-base">Certifications</FormLabel>
                  <FormDescription>
                    Select all applicable certifications for this supplier
                  </FormDescription>
                  
                  <div className="grid grid-cols-2 mt-3 gap-2">
                    {certifications.map((cert) => (
                      <div key={cert} className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {cert}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="sendWelcomeEmail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Send Welcome Email
                          </FormLabel>
                          <FormDescription>
                            Send an automatic welcome email to the supplier
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
                    name="requestDocumentation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Request Documentation
                          </FormLabel>
                          <FormDescription>
                            Request compliance documentation from the supplier
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
                          placeholder="Enter any additional notes about this supplier"
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
              <Button type="button" variant="outline" onClick={() => navigate('/supply-chain')}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Supplier
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}