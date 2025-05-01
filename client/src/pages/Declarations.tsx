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
  ArrowUpDown
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

interface Declaration {
  id: number;
  supplier: string;
  productType: string;
  region: string;
  status: 'compliant' | 'pending' | 'non-compliant';
  submissionDate: string;
  lastUpdated: string;
}

export default function Declarations() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
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
      lastUpdated: "2023-03-20"
    },
    {
      id: 1002,
      supplier: "Green Palm Farms",
      productType: "Palm Oil",
      region: "Indonesia",
      status: "pending",
      submissionDate: "2023-03-18",
      lastUpdated: "2023-03-18"
    },
    {
      id: 1003,
      supplier: "Cacao Harvest Co.",
      productType: "Cocoa",
      region: "Ghana",
      status: "compliant",
      submissionDate: "2023-03-02",
      lastUpdated: "2023-03-12"
    },
    {
      id: 1004,
      supplier: "Global Coffee Traders",
      productType: "Coffee",
      region: "Colombia",
      status: "non-compliant",
      submissionDate: "2023-02-28",
      lastUpdated: "2023-03-05"
    },
    {
      id: 1005,
      supplier: "Amazonia Rubber Inc.",
      productType: "Rubber",
      region: "Peru",
      status: "pending",
      submissionDate: "2023-03-10",
      lastUpdated: "2023-03-10"
    },
    {
      id: 1006,
      supplier: "African Timber Co.",
      productType: "Timber",
      region: "Cameroon",
      status: "compliant",
      submissionDate: "2023-02-20",
      lastUpdated: "2023-03-01"
    },
    {
      id: 1007,
      supplier: "Soy Harvest Cooperative",
      productType: "Soy",
      region: "Brazil",
      status: "pending",
      submissionDate: "2023-03-05",
      lastUpdated: "2023-03-05"
    }
  ];
  
  // Apply filters
  const filteredDeclarations = declarations.filter(declaration => {
    return (statusFilter === 'all' || declaration.status === statusFilter) &&
           (supplierFilter === 'all' || declaration.supplier === supplierFilter);
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredDeclarations.length / itemsPerPage);
  const paginatedDeclarations = filteredDeclarations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const supplierOptions = [
    { value: 'all', label: 'All Suppliers' },
    ...Array.from(new Set(declarations.map(d => d.supplier))).map(supplier => ({
      value: supplier,
      label: supplier
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

  return (
    <Layout title={t('nav.eudrDeclarations')}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <Link href="/compliance">
                <a className="text-primary-600 hover:text-primary-700 flex items-center mr-2">
                  <ChevronLeft className="h-5 w-5" />
                  <span>Compliance</span>
                </a>
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
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Declaration
            </Button>
          </div>
        </div>
        
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplierOptions.map(option => (
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
        
        {/* Declarations Table */}
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
      </div>
    </Layout>
  );
}