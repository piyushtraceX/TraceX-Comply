import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Link, useLocation, useRoute } from 'wouter';
import { 
  ChevronLeft,
  Building,
  MapPin,
  Mail,
  Phone,
  Globe,
  User,
  AlertTriangle,
  CheckCircle2,
  Edit,
  Download,
  Clock,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export default function SupplierDetail() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [match, params] = useRoute('/supplier/:id');
  const supplierId = params?.id || '1';
  
  // Mock data for a supplier - in a real app would come from API
  const supplier = {
    id: parseInt(supplierId),
    name: "Eco Forestry Ltd.",
    logo: null,
    status: "approved",
    risk: "low",
    location: "Brazil",
    address: "Av. Paulista 1000, Sao Paulo, Brazil",
    email: "contact@ecoforestry.com",
    phone: "+55 11 5555-1234",
    website: "www.ecoforestry.com",
    contactPerson: "Carlos Silva",
    products: ["Wood", "Paper", "Plywood"],
    certifications: [
      { name: "FSC", status: "valid", expiryDate: "2025-06-20" },
      { name: "PEFC", status: "valid", expiryDate: "2024-11-15" }
    ],
    lastUpdated: "2023-04-15",
    saq: {
      completionStatus: 78,
      lastUpdated: "2023-03-28",
      sections: [
        {
          name: "Company Information",
          status: "complete",
          questions: [
            { id: 1, question: "Legal company name", answer: "Eco Forestry Ltd.", required: true },
            { id: 2, question: "Tax identification number", answer: "BR12345678901", required: true },
            { id: 3, question: "Year established", answer: "1998", required: true },
            { id: 4, question: "Number of employees", answer: "250-500", required: true }
          ]
        },
        {
          name: "Supply Chain Transparency",
          status: "incomplete",
          questions: [
            { id: 5, question: "Do you have a supply chain mapping system?", answer: "Yes", required: true },
            { id: 6, question: "How many tiers of suppliers can you trace?", answer: "Tier 2", required: true },
            { id: 7, question: "Do you conduct supplier audits?", answer: "Yes, annually", required: true },
            { id: 8, question: "Do you use any third-party verification?", answer: "", required: true }
          ]
        },
        {
          name: "Due Diligence System",
          status: "incomplete",
          questions: [
            { id: 9, question: "Do you have a documented due diligence system?", answer: "Yes", required: true },
            { id: 10, question: "How often is the system reviewed?", answer: "Annually", required: true },
            { id: 11, question: "Do you have a designated person responsible for due diligence?", answer: "Yes", required: true },
            { id: 12, question: "Have you received training on EUDR requirements?", answer: "", required: true }
          ]
        },
        {
          name: "Risk Assessment",
          status: "not_started",
          questions: [
            { id: 13, question: "Do you have a documented risk assessment procedure?", answer: "", required: true },
            { id: 14, question: "What criteria are used for risk assessment?", answer: "", required: true },
            { id: 15, question: "How often do you update risk assessments?", answer: "", required: true },
            { id: 16, question: "Do you have mitigation measures for identified risks?", answer: "", required: true }
          ]
        }
      ]
    }
  };
  
  const getSectionStatus = (status: string) => {
    switch (status) {
      case 'complete':
        return (
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">Complete</span>
          </div>
        );
      case 'incomplete':
        return (
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-amber-500 mr-2" />
            <span className="text-amber-700">Incomplete</span>
          </div>
        );
      case 'not_started':
        return (
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">Not Started</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'flagged':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Flagged</Badge>;
      default:
        return null;
    }
  };
  
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High Risk</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low Risk</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout title={supplier.name}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Back button and page header */}
        <div className="mb-6">
          <Link href="/supply-chain" className="text-primary-600 hover:text-primary-700 flex items-center mb-4">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Suppliers</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <div className="mr-4 flex-shrink-0 p-3 bg-gray-100 rounded-lg">
                  <Building className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    {supplier.name}
                  </h2>
                  <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {supplier.location}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {supplier.contactPerson}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-start md:mt-0 md:ml-4 space-x-3">
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tabs for different sections */}
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="saq">Self Assessment Questionnaire</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Supplier Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    {getStatusBadge(supplier.status)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Risk Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    {getRiskBadge(supplier.risk)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {supplier.products.map((product, idx) => (
                      <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Last Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900">{supplier.lastUpdated}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Contact details for {supplier.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Address</h4>
                    <p className="text-gray-900">{supplier.address}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Contact Person</h4>
                    <p className="text-gray-900">{supplier.contactPerson}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <a href={`mailto:${supplier.email}`} className="text-primary-600 hover:text-primary-700">
                        {supplier.email}
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <a href={`tel:${supplier.phone}`} className="text-gray-900">
                        {supplier.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Website</h4>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-400 mr-2" />
                      <a href={`https://${supplier.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                        {supplier.website}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
                <CardDescription>
                  Current certifications and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplier.certifications.map((cert, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{cert.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {cert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{cert.expiryDate}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  + Add Certification
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Self Assessment Questionnaire (SAQ) Tab */}
          <TabsContent value="saq" className="space-y-6">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Self Assessment Questionnaire</CardTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Last Updated: {supplier.saq.lastUpdated}
                  </Badge>
                </div>
                <CardDescription>
                  Track progress on EUDR due diligence requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completion Status: {supplier.saq.completionStatus}%</span>
                    <div className="flex items-center">
                      <ShieldCheck className="h-5 w-5 text-amber-500 mr-1" />
                      <span className="text-sm text-amber-700">In Progress</span>
                    </div>
                  </div>
                  <Progress value={supplier.saq.completionStatus} className="h-2" />
                </div>
                
                <div className="space-y-6 mt-6">
                  {supplier.saq.sections.map((section, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">{section.name}</h3>
                        {getSectionStatus(section.status)}
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/2">Question</TableHead>
                            <TableHead className="w-1/2">Response</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {section.questions.map((q) => (
                            <TableRow key={q.id}>
                              <TableCell>
                                {q.question}
                                {q.required && <span className="text-red-500 ml-1">*</span>}
                              </TableCell>
                              <TableCell>
                                {q.answer ? (
                                  <span>{q.answer}</span>
                                ) : (
                                  <span className="text-red-500">Not Answered</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Section
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export SAQ
                </Button>
                <Button>
                  Submit Questionnaire
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}