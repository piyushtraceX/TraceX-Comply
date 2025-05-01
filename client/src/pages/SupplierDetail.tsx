import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useParams, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft,
  Building, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  FileCheck, 
  Check, 
  CheckCircle2, 
  AlertTriangle,
  ListChecks,
  FileText,
  Leaf,
  Edit,
  Calendar,
  User,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Sample supplier data (would come from API in real application)
const supplierData = {
  id: 1,
  name: "Eco Forestry Ltd.",
  location: "Brazil",
  address: "123 Rainforest Avenue, São Paulo, Brazil",
  products: ["Wood", "Paper"],
  status: "approved",
  risk: "low",
  lastUpdate: "2023-04-15",
  contactPerson: "Maria Silva",
  email: "maria@ecoforestry.com",
  phone: "+55 11 1234 5678",
  website: "www.ecoforestry.com",
  certifications: ["FSC", "PEFC", "Rainforest Alliance"],
  description: "Eco Forestry Ltd. is a sustainable forestry company operating in Brazil. They specialize in responsibly harvested wood and paper products with a strong focus on environmental protection and community support.",
  // SAQ data
  saq: {
    completionDate: "2023-03-20",
    lastUpdated: "2023-04-01",
    completionScore: 85,
    environmentalScore: 90,
    socialScore: 82,
    governanceScore: 78,
    riskAssessment: "low",
    sections: [
      {
        name: "General Information",
        completed: true,
        status: "complete"
      },
      {
        name: "Environmental Compliance",
        completed: true,
        status: "complete"
      },
      {
        name: "Labor Practices",
        completed: true,
        status: "complete"
      },
      {
        name: "Supply Chain Transparency",
        completed: true,
        status: "complete"
      },
      {
        name: "Certifications & Documentation",
        completed: true,
        status: "complete"
      },
      {
        name: "Risk Mitigation Plans",
        completed: false,
        status: "incomplete"
      }
    ],
    // Detailed responses for SAQ questions
    responses: [
      {
        question: "Do you have a deforestation-free policy?",
        response: "Yes",
        additionalInfo: "Implemented in 2018, covers all sourcing areas",
        status: "compliant"
      },
      {
        question: "Do you monitor your supply chain for EUDR compliance?",
        response: "Yes",
        additionalInfo: "Using satellite monitoring and regular field audits",
        status: "compliant"
      },
      {
        question: "Can you trace products to specific harvesting areas?",
        response: "Partial",
        additionalInfo: "80% of products have full traceability, 20% have partial",
        status: "partial"
      },
      {
        question: "Do you have Free, Prior and Informed Consent procedures?",
        response: "Yes",
        additionalInfo: "Documented process in place since 2020",
        status: "compliant"
      },
      {
        question: "Do you have third-party certification for your products?",
        response: "Yes",
        additionalInfo: "FSC and PEFC certified for all major product lines",
        status: "compliant"
      }
    ]
  }
};

// This component would receive the supplier ID from the URL in a real application
export default function SupplierDetail() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const params = useParams();
  const supplierId = params.id; // For a real application, fetch the supplier by ID
  const [activeTab, setActiveTab] = useState('profile');
  
  // Get supplier status badge
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
  
  // Get supplier risk badge
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
  
  // Get SAQ section status indicator
  const getSectionStatus = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'incomplete':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'missing':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };
  
  // Get SAQ response status
  const getResponseStatus = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Compliant</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Partial</Badge>;
      case 'non-compliant':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Non-Compliant</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout title={supplierData.name}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6">
          <Link href="/supply-chain" className="text-primary-600 hover:text-primary-700 flex items-center mb-4">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Supply Chain</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
                {supplierData.name}
                {getStatusBadge(supplierData.status)}
                <span className="ml-3">{getRiskBadge(supplierData.risk)}</span>
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Last updated: {supplierData.lastUpdate}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button variant="outline" className="mr-2 flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
        
        {/* Supplier Tabs */}
        <Tabs defaultValue="profile" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="saq">Self Assessment Questionnaire</TabsTrigger>
            <TabsTrigger value="declarations">Declarations</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Supplier Info Card */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2 text-gray-500" />
                      Supplier Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-500">Description</h4>
                      <p className="text-sm text-gray-700">{supplierData.description}</p>
                    </div>
                    
                    <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Location</h4>
                          <p className="text-sm text-gray-700 flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            {supplierData.address}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Products</h4>
                          <div className="flex flex-wrap gap-1">
                            {supplierData.products.map((product, index) => (
                              <Badge key={index} variant="secondary" className="text-sm">
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Website</h4>
                          <p className="text-sm text-gray-700 flex items-center">
                            <Globe className="h-4 w-4 mr-1 text-gray-400" />
                            <a href={`https://${supplierData.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                              {supplierData.website}
                            </a>
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Primary Contact</h4>
                          <p className="text-sm text-gray-700 flex items-center">
                            <User className="h-4 w-4 mr-1 text-gray-400" />
                            {supplierData.contactPerson}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Email</h4>
                          <p className="text-sm text-gray-700 flex items-center">
                            <Mail className="h-4 w-4 mr-1 text-gray-400" />
                            <a href={`mailto:${supplierData.email}`} className="text-primary-600 hover:underline">
                              {supplierData.email}
                            </a>
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                          <p className="text-sm text-gray-700 flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                            {supplierData.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Certifications & EUDR Status Card */}
              <div>
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Leaf className="h-5 w-5 mr-2 text-green-600" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {supplierData.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <FileCheck className="h-5 w-5 mr-2 text-blue-600" />
                      EUDR Compliance Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Overall Compliance:</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Compliant</Badge>
                        </div>
                        <Progress value={85} className="h-2 bg-gray-100" />
                        <p className="text-xs text-gray-500 text-right">85% Complete</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Documentation Status:</span>
                          <span className="text-sm text-amber-600">1 Item Pending</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center">
                              <Check className="h-4 w-4 text-green-600 mr-1" />
                              Deforestation Policy
                            </span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Verified</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center">
                              <Check className="h-4 w-4 text-green-600 mr-1" />
                              Environmental Impact Assessment
                            </span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Verified</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center">
                              <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                              Traceability Documentation
                            </span>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Pending</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Self Assessment Questionnaire Tab */}
          <TabsContent value="saq">
            <div className="space-y-6">
              {/* SAQ Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ListChecks className="h-5 w-5 mr-2 text-gray-500" />
                    Self Assessment Questionnaire Overview
                  </CardTitle>
                  <CardDescription>
                    Completed on {supplierData.saq.completionDate}, last updated {supplierData.saq.lastUpdated}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gray-50 border">
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-base">Overall Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-gray-800">{supplierData.saq.completionScore}%</div>
                        <Progress value={supplierData.saq.completionScore} className="h-2 mt-2" />
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-50 border">
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-base">Environmental</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">{supplierData.saq.environmentalScore}%</div>
                        <Progress value={supplierData.saq.environmentalScore} className="h-2 mt-2 bg-gray-200" />
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-50 border">
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-base">Social</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{supplierData.saq.socialScore}%</div>
                        <Progress value={supplierData.saq.socialScore} className="h-2 mt-2 bg-gray-200" />
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-50 border">
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-base">Governance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-purple-600">{supplierData.saq.governanceScore}%</div>
                        <Progress value={supplierData.saq.governanceScore} className="h-2 mt-2 bg-gray-200" />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SAQ Sections */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Questionnaire Sections</h3>
                      <ul className="space-y-4">
                        {supplierData.saq.sections.map((section, index) => (
                          <li key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center">
                              {getSectionStatus(section.status)}
                              <span className="ml-2 text-gray-800">{section.name}</span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={section.completed 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-amber-50 text-amber-700 border-amber-200"
                              }
                            >
                              {section.completed ? 'Complete' : 'Incomplete'}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Risk Assessment & Controls */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Risk Assessment</h3>
                      <Card className="bg-gray-50 border">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-medium">Overall Risk Level:</span>
                            <Badge 
                              variant="outline" 
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Low Risk
                            </Badge>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="deforestation-monitoring">Deforestation Monitoring</Label>
                              <Switch id="deforestation-monitoring" checked={true} />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="traceability-system">Full Traceability System</Label>
                              <Switch id="traceability-system" checked={true} />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="certification-verification">Certification Verification</Label>
                              <Switch id="certification-verification" checked={true} />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="community-consultation">Community Consultation</Label>
                              <Switch id="community-consultation" checked={false} />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="regular-audits">Regular Audits</Label>
                              <Switch id="regular-audits" checked={true} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* SAQ Key Responses */}
              <Card>
                <CardHeader>
                  <CardTitle>Key EUDR Compliance Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {supplierData.saq.responses.map((response, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <h4 className="text-md font-medium text-gray-800">{response.question}</h4>
                          {getResponseStatus(response.status)}
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-500">Response</h5>
                            <p className="text-sm">{response.response}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-500">Additional Information</h5>
                            <p className="text-sm">{response.additionalInfo}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-gray-50 flex justify-end">
                  <Button variant="outline" className="mr-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Re-assessment
                  </Button>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Export SAQ Report
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Declarations Tab */}
          <TabsContent value="declarations">
            <Card>
              <CardHeader>
                <CardTitle>EUDR Declarations</CardTitle>
                <CardDescription>
                  Overview of all declarations related to this supplier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No Declarations Yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are no EUDR declarations associated with this supplier yet.
                  </p>
                  <div className="mt-6">
                    <Link href="/add-declaration">
                      <Button className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Declaration
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  Documentation and certificates for this supplier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <h4 className="text-md font-medium">Deforestation-Free Policy</h4>
                        <p className="text-sm text-gray-500">Uploaded on May 12, 2023</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <h4 className="text-md font-medium">FSC Certificate</h4>
                        <p className="text-sm text-gray-500">Uploaded on April 3, 2023</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-purple-600 mr-3" />
                      <div>
                        <h4 className="text-md font-medium">Environmental Impact Assessment</h4>
                        <p className="text-sm text-gray-500">Uploaded on March 21, 2023</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg flex items-center justify-between bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-amber-500 mr-3" />
                      <div>
                        <h4 className="text-md font-medium">Supply Chain Mapping</h4>
                        <p className="text-sm text-gray-500">Pending verification</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-gray-50 flex justify-end">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}