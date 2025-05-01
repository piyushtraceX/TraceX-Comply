import React, { useState } from 'react';
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
  Calendar, 
  Building, 
  Package, 
  MapPin, 
  FileText,
  Globe,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Define the form validation schema
const formSchema = z.object({
  declarationType: z.enum(['inbound', 'outbound']),
  productType: z.string().min(1, 'Product type is required'),
  productCode: z.string().min(1, 'Product code is required'),
  volume: z.string().min(1, 'Volume is required'),
  unit: z.string().min(1, 'Unit is required'),
  region: z.string().min(1, 'Region is required'),
  supplier: z.string().optional(),
  customer: z.string().optional(),
  notes: z.string().optional(),
  riskAssessment: z.enum(['low', 'medium', 'high']),
  certifications: z.array(z.string()).optional(),
  documentVerification: z.boolean(),
  traceabilityVerification: z.boolean(),
  complianceCheck: z.boolean()
}).refine(data => {
  if (data.declarationType === 'inbound' && !data.supplier) {
    return false;
  }
  if (data.declarationType === 'outbound' && !data.customer) {
    return false;
  }
  return true;
}, {
  message: "Supplier is required for inbound declarations, Customer is required for outbound declarations",
  path: ['supplier', 'customer']
});

type FormData = z.infer<typeof formSchema>;

export default function AddDeclaration() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'basic' | 'compliance' | 'documents'>('basic');
  
  // Parse URL query parameters
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const urlDeclarationType = searchParams.get('type') || 'inbound';
  const isNewDeclaration = searchParams.get('new') === 'true';
  const isFromExisting = searchParams.get('existing') === 'true';
  
  // Sample data - would come from API in real application
  const suppliers = [
    { id: 1, name: "Eco Forestry Ltd." },
    { id: 2, name: "Green Palm Farms" },
    { id: 3, name: "Cacao Harvest Co." },
    { id: 4, name: "Global Coffee Traders" },
    { id: 5, name: "Amazonia Rubber Inc." }
  ];
  
  const customers = [
    { id: 1, name: "Eco Solutions GmbH" },
    { id: 2, name: "Sweet Delights Ltd" },
    { id: 3, name: "EcoBox Corp" },
    { id: 4, name: "Home Luxury Inc." }
  ];
  
  const productTypes = [
    "Wood Products", 
    "Palm Oil", 
    "Cocoa", 
    "Coffee", 
    "Rubber", 
    "Soy", 
    "Timber", 
    "Processed Wood",
    "Wooden Furniture",
    "Paper Products",
    "Cocoa Products"
  ];
  
  const units = ["tons", "kilograms", "liters", "cubic meters", "pieces", "items"];
  
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
  
  // Define form with default values based on URL parameters
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      declarationType: urlDeclarationType as 'inbound' | 'outbound',
      productType: '',
      productCode: '',
      volume: '',
      unit: 'tons',
      region: '',
      supplier: '',
      customer: '',
      notes: '',
      riskAssessment: 'low',
      certifications: [],
      documentVerification: false,
      traceabilityVerification: false,
      complianceCheck: false
    }
  });
  
  // Watch the declaration type to conditionally render form fields
  const formDeclarationType = form.watch('declarationType');
  
  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    
    // In a real app, this would call an API to save the data
    // For now, we'll just navigate back to the declarations page
    navigate('/declarations');
  };

  return (
    <Layout title="Add Declaration">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6">
          <Link href="/declarations" className="text-primary-600 hover:text-primary-700 flex items-center mb-4">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Declarations</span>
          </Link>
          
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Add EUDR Declaration
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Create a new EUDR declaration for your supply chain
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Declaration Type</CardTitle>
                <CardDescription>
                  Select whether this is an inbound (from supplier) or outbound (to customer) declaration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="declarationType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="inbound" id="inbound" />
                            <Label htmlFor="inbound" className="font-normal">
                              Inbound Declaration (from supplier)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="outbound" id="outbound" />
                            <Label htmlFor="outbound" className="font-normal">
                              Outbound Declaration (to customer)
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Tabs 
              defaultValue="basic" 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as 'basic' | 'compliance' | 'documents')} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Basic Information</span>
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>Risk & Compliance</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Documents</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Basic Information Tab */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Enter the basic details about this declaration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Partner Selection (Supplier or Customer) */}
                    {formDeclarationType === 'inbound' ? (
                      <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {suppliers.map(supplier => (
                                  <SelectItem key={supplier.id} value={supplier.name}>
                                    {supplier.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="customer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customers.map(customer => (
                                  <SelectItem key={customer.id} value={customer.name}>
                                    {customer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {/* Product Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="productType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {productTypes.map(type => (
                                  <SelectItem key={type} value={type}>
                                    {type}
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
                        name="productCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Code</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. WP-2023-01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Volume Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="volume"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Volume</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder="e.g. 250" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {units.map(unit => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Region Information */}
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origin/Destination Region</FormLabel>
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
                    
                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add any additional information or notes about this declaration"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Risk & Compliance Tab */}
              <TabsContent value="compliance">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment & Compliance</CardTitle>
                    <CardDescription>
                      Assess the compliance risk level for this declaration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="riskAssessment"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Risk Assessment</FormLabel>
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
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Verification Checklist</h3>
                      
                      <FormField
                        control={form.control}
                        name="documentVerification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Document Verification
                              </FormLabel>
                              <FormDescription>
                                All required documents have been verified
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
                        name="traceabilityVerification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Traceability Verification
                              </FormLabel>
                              <FormDescription>
                                Product can be traced through the supply chain
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
                        name="complianceCheck"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                EUDR Compliance Check
                              </FormLabel>
                              <FormDescription>
                                Verified that this declaration meets EUDR requirements
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
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Documents Tab */}
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Supporting Documents</CardTitle>
                    <CardDescription>
                      Upload supporting documents for this declaration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="declaration-doc">Declaration Document</Label>
                      <Input id="declaration-doc" type="file" />
                    </div>
                    
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="certificate-doc">Certificate of Origin</Label>
                      <Input id="certificate-doc" type="file" />
                    </div>
                    
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="compliance-doc">Compliance Documentation</Label>
                      <Input id="compliance-doc" type="file" />
                    </div>
                    
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="additional-doc">Additional Documentation</Label>
                      <Input id="additional-doc" type="file" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => navigate('/declarations')}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Declaration
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}