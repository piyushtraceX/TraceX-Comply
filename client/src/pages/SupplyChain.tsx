import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { 
  Eye,
  Download,
  CheckCircle,
  AlertCircle,
  Mail,
  User,
  Building,
  Plus,
  ChevronDown,
  Search,
  Upload,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import our custom forms
import { AddSupplierForm, type SupplierFormData } from '@/components/suppliers/AddSupplierForm';
import { SendSAQForm, type SAQFormData } from '@/components/suppliers/SendSAQForm';
import { ViewResponseForm } from '@/components/suppliers/ViewResponseForm';

// Match the design in the reference app screenshots
export default function SupplyChain() {
  const { t } = useTranslation();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('onboarding');
  
  // Form states
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [addSupplierType, setAddSupplierType] = useState<'single' | 'bulk' | 'csv'>('single');
  const [sendSAQOpen, setSendSAQOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState('');
  const [viewResponseOpen, setViewResponseOpen] = useState(false);
  const [currentSupplierId, setCurrentSupplierId] = useState('');

  // SAQ Management Tab Data
  const summaryCards = [
    {
      title: "Sent SAQs",
      count: 156,
      icon: <Mail className="h-5 w-5 text-amber-500" />,
      color: "border-l-amber-500 bg-amber-50"
    },
    {
      title: "Responded",
      count: 89,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      color: "border-l-green-500 bg-green-50"
    },
    {
      title: "Not Responded",
      count: 67,
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      color: "border-l-red-500 bg-red-50"
    }
  ];

  const supplierResponses = [
    {
      id: "001",
      name: "ABC Corp",
      avatar: "AC",
      address: "Berlin, Germany",
      industry: "Wood Products"
    },
    {
      id: "002",
      name: "XYZ Industries",
      avatar: "XI",
      address: "Paris, France",
      industry: "Sustainable Timber"
    },
    {
      id: "003",
      name: "EcoGlobal",
      avatar: "EG",
      address: "Madrid, Spain",
      industry: "Rubber Products"
    }
  ];

  // Onboarding Tab Data
  const onboardingSuppliers = [
    {
      name: "Mediterranean Agro SpA",
      address: "Italy",
      industry: "Olives, Sustainable Cork",
      status: "Compliant"
    },
    {
      name: "Nordique Forestry SA",
      address: "France",
      industry: "Sustainable Timber, Paper Products",
      status: "Compliant"
    },
    {
      name: "GermanOrganic GmbH",
      address: "Germany",
      industry: "Organic Cacao, Palm Oil",
      status: "Compliant"
    },
    {
      name: "EcoRubber Solutions",
      address: "Malaysia",
      industry: "Rubber Wood, Sustainable Rubber",
      status: "Compliant"
    },
    {
      name: "AsiaRubber Plantations",
      address: "Thailand",
      industry: "Natural Rubber, Latex",
      status: "Compliant"
    }
  ];
  
  // Action handlers for the buttons
  const handleImport = () => {
    console.log("Import button clicked");
    setAddSupplierType('csv');
    setAddSupplierOpen(true);
  };
  
  const handleAddSupplier = () => {
    console.log("Add Supplier button clicked");
    setAddSupplierType('single');
    setAddSupplierOpen(true);
  };
  
  const handleAddSingleSupplier = () => {
    console.log("Add Single Supplier selected");
    setAddSupplierType('single');
    setAddSupplierOpen(true);
  };
  
  const handleImportCSV = () => {
    console.log("Import CSV selected");
    setAddSupplierType('csv');
    setAddSupplierOpen(true);
  };
  
  const handleBulkAdd = () => {
    console.log("Bulk Add selected");
    setAddSupplierType('bulk');
    setAddSupplierOpen(true);
  };
  
  const handleSendSAQ = (supplierName: string) => {
    console.log(`Send SAQ for ${supplierName}`);
    setCurrentSupplier(supplierName);
    setSendSAQOpen(true);
  };
  
  const handleViewResponse = (supplierId: string, supplierName: string) => {
    console.log(`View response for ${supplierName} (ID: ${supplierId})`);
    setCurrentSupplierId(supplierId);
    setCurrentSupplier(supplierName);
    setViewResponseOpen(true);
  };
  
  const handleExportResults = () => {
    console.log("Export results clicked");
    alert("Assessment results would be exported");
  };
  
  const handleSupplierSubmit = (data: SupplierFormData) => {
    console.log("Supplier form submitted:", data);
    alert(`Supplier ${data.name} added successfully!`);
  };
  
  const handleSAQSubmit = (data: SAQFormData) => {
    console.log("SAQ form submitted:", data);
    alert(`SAQ "${data.title}" sent to ${data.suppliers.join(", ")} with deadline ${data.deadline.toLocaleDateString()}`);
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllRows = () => {
    if (selectedRows.length === supplierResponses.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(supplierResponses.map(sr => sr.id));
    }
  };

  return (
    <Layout title="Supply Chain">
      <div className="space-y-6">
        {/* Add Supplier Form Dialog */}
        <AddSupplierForm
          open={addSupplierOpen}
          onOpenChange={setAddSupplierOpen}
          onSubmit={handleSupplierSubmit}
          formType={addSupplierType}
        />
        
        {/* Send SAQ Form Dialog */}
        <SendSAQForm
          open={sendSAQOpen}
          onOpenChange={setSendSAQOpen}
          supplierName={currentSupplier}
          onSubmit={handleSAQSubmit}
        />
        
        {/* View Response Dialog */}
        <ViewResponseForm
          open={viewResponseOpen}
          onOpenChange={setViewResponseOpen}
          supplierId={currentSupplierId}
          supplierName={currentSupplier}
        />
        
        {/* Tabs at the top */}
        <Tabs 
          defaultValue="onboarding" 
          className="w-full mb-6"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="inline-flex h-10 items-center rounded-md bg-gray-100 p-1 text-gray-600">
            <TabsTrigger
              value="onboarding"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              <Building className="mr-2 h-4 w-4" />
              Onboarding
            </TabsTrigger>
            <TabsTrigger
              value="saq-management"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              <User className="mr-2 h-4 w-4" />
              SAQ Management
            </TabsTrigger>
          </TabsList>

          {/* Onboarding Tab Content */}
          <TabsContent value="onboarding" className="mt-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Supplier Management</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={handleImport}
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      className="gap-1"
                      onClick={handleAddSupplier}
                    >
                      <Plus className="h-4 w-4" />
                      Add Supplier
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={handleAddSingleSupplier}>
                      Add Single Supplier
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleImportCSV}>
                      Import CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleBulkAdd}>
                      Bulk Add
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-4">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search suppliers..." className="pl-9 bg-white" />
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  <Select defaultValue="all-status">
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-status">All Status</SelectItem>
                      <SelectItem value="compliant">Compliant</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="all-industries">
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-industries">All Industries</SelectItem>
                      <SelectItem value="timber">Timber</SelectItem>
                      <SelectItem value="palm-oil">Palm Oil</SelectItem>
                      <SelectItem value="cacao">Cacao</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="all-locations">
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-locations">All Locations</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="africa">Africa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-gray-50">
                    <TableHead className="w-12">
                      <Checkbox aria-label="Select all" />
                    </TableHead>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Industry/Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {onboardingSuppliers.map((supplier, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="py-3">
                        <Checkbox aria-label={`Select supplier ${supplier.name}`} />
                      </TableCell>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.address}</TableCell>
                      <TableCell>{supplier.industry}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 font-normal">
                          {supplier.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => handleSendSAQ(supplier.name)}
                        >
                          <Copy className="mr-1 h-4 w-4" />
                          Send SAQ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* SAQ Management Tab Content */}
          <TabsContent value="saq-management" className="mt-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {summaryCards.map((card, index) => (
                <Card key={index} className={`border-l-4 ${card.color} shadow-sm`}>
                  <CardContent className="flex justify-between items-center p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{card.title}</p>
                      <h3 className="text-2xl font-bold mt-1">{card.count}</h3>
                    </div>
                    <div className="rounded-full bg-white p-2 shadow-sm">
                      {card.icon}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Supplier Responses Table */}
            <div className="bg-white rounded-lg border shadow-sm mb-6">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Supplier Responses
                </h3>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedRows.length === supplierResponses.length && supplierResponses.length > 0}
                        onCheckedChange={handleSelectAllRows}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="w-20">Sr. No.</TableHead>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Industry/Product</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierResponses.map((supplier) => (
                    <TableRow key={supplier.id} className="hover:bg-gray-50">
                      <TableCell className="py-3">
                        <Checkbox
                          checked={selectedRows.includes(supplier.id)}
                          onCheckedChange={() => handleSelectRow(supplier.id)}
                          aria-label={`Select row ${supplier.id}`}
                        />
                      </TableCell>
                      <TableCell>{supplier.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center text-sm text-gray-600">
                            {supplier.avatar}
                          </div>
                          <span>{supplier.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{supplier.address}</TableCell>
                      <TableCell>{supplier.industry}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => handleViewResponse(supplier.id, supplier.name)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View Response
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Assessment Results Section */}
            <div className="py-3 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Assessment Results</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={handleExportResults}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    New Questionnaire
                  </Button>
                </div>
              </div>
              
              {/* SAQ Management Table */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-b border-gray-200">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search questionnaires..."
                      className="w-full pl-9"
                    />
                  </div>
                  
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Questionnaire Title</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Deadline</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Assigned Suppliers</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">EUDR Basic Compliance Assessment</div>
                            <div className="text-sm text-gray-500">Basic assessment for suppliers to verify compliance with EU Deforestation Regulation</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Published
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          2023-12-31
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="bg-gray-100 text-xs">
                              Eco Timber Solutions
                            </Badge>
                            <Badge variant="outline" className="bg-gray-100 text-xs">
                              Green Forest Products
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex justify-end items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">Supply Chain Due Diligence Questionnaire</div>
                            <div className="text-sm text-gray-500">Detailed assessment for supply chain transparency and traceability</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          2024-01-15
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="bg-gray-100 text-xs">
                              Sustainable Woods Inc.
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex justify-end items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}