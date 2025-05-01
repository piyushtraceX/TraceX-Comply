import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Building, 
  MapPin, 
  PackageCheck 
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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

interface Supplier {
  id: number;
  name: string;
  location: string;
  products: string[];
  status: 'approved' | 'pending' | 'flagged';
  risk: 'high' | 'medium' | 'low';
  lastUpdate: string;
}

export default function SupplyChain() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [filter, setFilter] = useState('all');
  
  // Sample data - would come from API in real application
  const suppliers: Supplier[] = [
    {
      id: 1,
      name: "Eco Forestry Ltd.",
      location: "Brazil",
      products: ["Wood", "Paper"],
      status: "approved",
      risk: "low",
      lastUpdate: "2023-04-15"
    },
    {
      id: 2,
      name: "Green Palm Farms",
      location: "Indonesia",
      products: ["Palm Oil"],
      status: "pending",
      risk: "medium",
      lastUpdate: "2023-04-10"
    },
    {
      id: 3,
      name: "Cacao Harvest Co.",
      location: "Ghana",
      products: ["Cocoa"],
      status: "approved",
      risk: "low",
      lastUpdate: "2023-04-08"
    },
    {
      id: 4,
      name: "Global Coffee Traders",
      location: "Colombia",
      products: ["Coffee Beans"],
      status: "flagged",
      risk: "high",
      lastUpdate: "2023-04-05"
    },
    {
      id: 5,
      name: "Amazonia Rubber Inc.",
      location: "Peru",
      products: ["Rubber"],
      status: "approved",
      risk: "medium",
      lastUpdate: "2023-04-01"
    }
  ];
  
  const filteredSuppliers = filter === 'all' 
    ? suppliers 
    : suppliers.filter(supplier => supplier.status === filter);
  
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
    <Layout title={t('nav.supplyChain')}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {t('nav.supplyChain')}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t('pages.supplyChain.description')}
            </p>
          </div>
          <div className={cn("mt-4 flex space-x-3 md:mt-0", isRTL && "flex-row-reverse")}>
            <Button variant="outline" className={cn("flex items-center", isRTL && "flex-row-reverse")}>
              <Download className={cn("mr-2 h-4 w-4", isRTL && "mr-0 ml-2")} />
              Export
            </Button>
            <Button className={cn("flex items-center", isRTL && "flex-row-reverse")}>
              <Plus className={cn("mr-2 h-4 w-4", isRTL && "mr-0 ml-2")} />
              Add Supplier
            </Button>
          </div>
        </div>
        
        {/* Supplier Onboarding Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Supplier Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center p-4 border rounded-lg bg-blue-50 border-blue-200">
                <Building className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium">Invite Suppliers</h3>
                <p className="text-sm text-center text-gray-500 mt-2">Send invitation to your suppliers to join the platform</p>
                <Button variant="link" className="mt-2">Send Invites</Button>
              </div>
              
              <div className="flex flex-col items-center p-4 border rounded-lg bg-green-50 border-green-200">
                <PackageCheck className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium">Verify Documentation</h3>
                <p className="text-sm text-center text-gray-500 mt-2">Review and approve supplier documentation</p>
                <Button variant="link" className="mt-2">View Pending</Button>
              </div>
              
              <div className="flex flex-col items-center p-4 border rounded-lg bg-purple-50 border-purple-200">
                <MapPin className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium">Map Supply Chain</h3>
                <p className="text-sm text-center text-gray-500 mt-2">Visualize your end-to-end supply chain network</p>
                <Button variant="link" className="mt-2">Open Map</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Suppliers
            </h3>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-md w-full relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search suppliers" 
                  className="pl-9 bg-white"
                />
              </div>
              <div className="mt-3 sm:mt-0 flex items-center">
                <Filter className="h-4 w-4 text-gray-500 mr-2" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-sm text-gray-500">Last updated: {supplier.lastUpdate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.products.join(", ")}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(supplier.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRiskBadge(supplier.risk)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/supplier/${supplier.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">View</span>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Edit</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                          <span className="sr-only">Delete</span>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredSuppliers.length} of {suppliers.length} suppliers
              </div>
              <div className="flex-1 flex justify-center sm:justify-end">
                <Button variant="outline" className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white" disabled>
                  Previous
                </Button>
                <Button variant="outline" className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}