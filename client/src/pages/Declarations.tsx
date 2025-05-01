import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { 
  Search, 
  Filter, 
  Plus, 
  FileDown, 
  Eye, 
  Edit, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  Calendar,
  Building,
  FileText,
  AlertTriangle
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
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface Declaration {
  id: number;
  supplier: string;
  productType: string;
  region: string;
  status: 'compliant' | 'pending' | 'non-compliant';
  submissionDate: string;
  lastUpdated: string;
  volume?: string;
  productCode?: string;
  direction: 'inbound' | 'outbound';
  customer?: string;
}

export default function Declarations() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [statusFilter, setStatusFilter] = useState('all');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'inbound' | 'outbound'>('inbound');
  const itemsPerPage = 10;
  
  // Sample data - would come from API in real application
  const declarations: Declaration[] = [
    {
      id: 1001,
      supplier: "Eco Forestry Ltd.",
      productType: "Wood Products",
      region: "Brazil",
      status: "compliant",
      submissionDate: "2023-03-15",
      lastUpdated: "2023-03-20",
      volume: "250 tons",
      productCode: "WP-2023-01",
      direction: "inbound"
    },
    {
      id: 1002,
      supplier: "Green Palm Farms",
      productType: "Palm Oil",
      region: "Indonesia",
      status: "pending",
      submissionDate: "2023-03-18",
      lastUpdated: "2023-03-18",
      volume: "500 liters",
      productCode: "PO-2023-02",
      direction: "inbound"
    },
    {
      id: 1003,
      supplier: "Cacao Harvest Co.",
      productType: "Cocoa",
      region: "Ghana",
      status: "compliant",
      submissionDate: "2023-03-02",
      lastUpdated: "2023-03-12",
      volume: "120 tons",
      productCode: "CC-2023-01",
      direction: "inbound"
    },
    {
      id: 1004,
      supplier: "Global Coffee Traders",
      productType: "Coffee",
      region: "Colombia",
      status: "non-compliant",
      submissionDate: "2023-02-28",
      lastUpdated: "2023-03-05",
      volume: "80 tons",
      productCode: "CF-2023-04",
      direction: "inbound"
    },
    {
      id: 1005,
      supplier: "Amazonia Rubber Inc.",
      productType: "Rubber",
      region: "Peru",
      status: "pending",
      submissionDate: "2023-03-10",
      lastUpdated: "2023-03-10",
      volume: "60 tons",
      productCode: "RB-2023-02",
      direction: "inbound"
    },
    {
      id: 2001,
      supplier: "Global Consumer Goods",
      productType: "Processed Wood",
      region: "Europe",
      status: "compliant",
      submissionDate: "2023-03-20",
      lastUpdated: "2023-03-25",
      volume: "150 tons",
      productCode: "PW-2023-01",
      direction: "outbound",
      customer: "Eco Solutions GmbH"
    },
    {
      id: 2002,
      supplier: "Organic Products Inc.",
      productType: "Cocoa Products",
      region: "Europe",
      status: "pending",
      submissionDate: "2023-03-15",
      lastUpdated: "2023-03-15",
      volume: "50 tons",
      productCode: "CP-2023-02",
      direction: "outbound",
      customer: "Sweet Delights Ltd"
    },
    {
      id: 2003,
      supplier: "Green Packaging Co.",
      productType: "Paper Products",
      region: "North America",
      status: "compliant",
      submissionDate: "2023-03-05",
      lastUpdated: "2023-03-10",
      volume: "200 tons",
      productCode: "PP-2023-01",
      direction: "outbound",
      customer: "EcoBox Corp"
    },
    {
      id: 2004,
      supplier: "Furniture Makers Ltd.",
      productType: "Wooden Furniture",
      region: "Asia",
      status: "non-compliant",
      submissionDate: "2023-02-25",
      lastUpdated: "2023-03-01",
      volume: "300 items",
      productCode: "WF-2023-03",
      direction: "outbound",
      customer: "Home Luxury Inc."
    }
  ];
  
  // Filter declarations by direction (inbound/outbound)
  const inboundDeclarations = declarations.filter(d => d.direction === 'inbound');
  const outboundDeclarations = declarations.filter(d => d.direction === 'outbound');
  
  // Get current declarations based on active tab
  const currentDeclarations = activeTab === 'inbound' ? inboundDeclarations : outboundDeclarations;
  
  // Apply filters
  const filteredDeclarations = currentDeclarations.filter(declaration => {
    const partnerField = activeTab === 'inbound' ? declaration.supplier : declaration.customer;
    return (statusFilter === 'all' || declaration.status === statusFilter) &&
           (partnerFilter === 'all' || partnerField === partnerFilter);
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredDeclarations.length / itemsPerPage);
  const paginatedDeclarations = filteredDeclarations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Get unique partner options (suppliers for inbound, customers for outbound)
  const partnerOptions = [
    { value: 'all', label: activeTab === 'inbound' ? 'All Suppliers' : 'All Customers' },
    ...Array.from(
      new Set(
        currentDeclarations.map(d => activeTab === 'inbound' ? d.supplier : d.customer)
      )
    ).map(partner => ({
      value: partner || '',
      label: partner || ''
    }))
  ];
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Compliant</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'non-compliant':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Non-Compliant</Badge>;
      default:
        return null;
    }
  };
  
  // Reset page when changing tabs or filters
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'inbound' | 'outbound');
    setCurrentPage(1);
    setPartnerFilter('all');
  };
  
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  
  const handlePartnerFilterChange = (value: string) => {
    setPartnerFilter(value);
    setCurrentPage(1);
  };

  return (
    <Layout title={t('nav.eudrDeclarations')}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <Link href="/compliance" className="text-primary-600 hover:text-primary-700 flex items-center mr-2">
                <ChevronLeft className="h-5 w-5" />
                <span>Compliance</span>
              </Link>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                EUDR Declarations
              </h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {t('pages.declarations.description')}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0">
            <Link href="/add-declaration">
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                New Declaration
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Declaration Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-600" />
                Total Declarations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{declarations.length}</div>
              <p className="text-sm text-gray-500">Last updated: Today</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                Suppliers Covered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{new Set(inboundDeclarations.map(d => d.supplier)).size}</div>
              <p className="text-sm text-gray-500">Across {inboundDeclarations.length} declarations</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Due This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">4</div>
              <p className="text-sm text-gray-500">Renewals required</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Compliance Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{declarations.filter(d => d.status === 'non-compliant').length}</div>
              <p className="text-sm text-gray-500">Require attention</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs 
          defaultValue="inbound" 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex mb-4 md:mb-0">
              <TabsTrigger value="inbound" className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                <span>Inbound Declarations</span>
              </TabsTrigger>
              <TabsTrigger value="outbound" className="flex items-center">
                <FileDown className="h-4 w-4 mr-2" />
                <span>Outbound Declarations</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex space-x-2">
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>
              <Button variant="outline" className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <TabsContent value="inbound">
            {/* Filters */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Filters
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search declarations" 
                      className="pl-9 bg-white"
                    />
                  </div>
                  
                  <div>
                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="compliant">Compliant</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Select value={partnerFilter} onValueChange={handlePartnerFilterChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {partnerOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Inbound Declarations Table */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1 cursor-pointer">
                          <span>ID</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1 cursor-pointer">
                          <span>Supplier</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Code
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1 cursor-pointer">
                          <span>Date</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedDeclarations.map((declaration) => (
                      <tr key={declaration.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{declaration.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {declaration.supplier}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {declaration.productType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {declaration.productCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {declaration.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(declaration.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Submitted: {declaration.submissionDate}</div>
                          <div className="text-xs">Updated: {declaration.lastUpdated}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600">
                              <span className="sr-only">View</span>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600">
                              <span className="sr-only">Edit</span>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600">
                              <span className="sr-only">Download</span>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, filteredDeclarations.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredDeclarations.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <Button 
                          variant="outline" 
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage <= 1}
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                          const pageNumber = idx + 1;
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              className="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                        
                        <Button 
                          variant="outline" 
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage >= totalPages}
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="outbound">
            {/* Filters - Outbound */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Filters
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search declarations" 
                      className="pl-9 bg-white"
                    />
                  </div>
                  
                  <div>
                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="compliant">Compliant</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Select value={partnerFilter} onValueChange={handlePartnerFilterChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {partnerOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Outbound Declarations Table */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1 cursor-pointer">
                          <span>ID</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1 cursor-pointer">
                          <span>Customer</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Code
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1 cursor-pointer">
                          <span>Date</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedDeclarations.map((declaration) => (
                      <tr key={declaration.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{declaration.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {declaration.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {declaration.productType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {declaration.productCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {declaration.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(declaration.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Submitted: {declaration.submissionDate}</div>
                          <div className="text-xs">Updated: {declaration.lastUpdated}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600">
                              <span className="sr-only">View</span>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600">
                              <span className="sr-only">Edit</span>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600">
                              <span className="sr-only">Download</span>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, filteredDeclarations.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredDeclarations.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <Button 
                          variant="outline" 
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage <= 1}
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                          const pageNumber = idx + 1;
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              className="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                        
                        <Button 
                          variant="outline" 
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage >= totalPages}
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}