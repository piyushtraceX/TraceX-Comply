import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3,
  Building,
  Users,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Customer {
  id: number;
  name: string;
  industry: string;
  riskScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  country: string;
  contact: string;
  lastActivity: string;
}

export default function Customers() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  // Sample data - would come from API in real application
  const customers: Customer[] = [
    {
      id: 1,
      name: "Global Retail Corp",
      industry: "Retail",
      riskScore: 85,
      riskLevel: "high",
      country: "United States",
      contact: "john.smith@globalretail.com",
      lastActivity: "2023-04-10"
    },
    {
      id: 2,
      name: "Euro Foods Inc.",
      industry: "Food & Beverage",
      riskScore: 42,
      riskLevel: "medium",
      country: "Germany",
      contact: "m.schmidt@eurofoods.de",
      lastActivity: "2023-04-08"
    },
    {
      id: 3,
      name: "Fashion Forward Ltd.",
      industry: "Apparel",
      riskScore: 28,
      riskLevel: "low",
      country: "France",
      contact: "claire.dubois@fashionforward.fr",
      lastActivity: "2023-04-05"
    },
    {
      id: 4,
      name: "TechHub Solutions",
      industry: "Technology",
      riskScore: 35,
      riskLevel: "low",
      country: "Netherlands",
      contact: "p.vanderberg@techhub.nl",
      lastActivity: "2023-04-02"
    },
    {
      id: 5,
      name: "Nordic Furniture",
      industry: "Home Goods",
      riskScore: 51,
      riskLevel: "medium",
      country: "Sweden",
      contact: "lars.johansson@nordicfurniture.se",
      lastActivity: "2023-03-28"
    }
  ];
  
  // Data for Risk Distribution chart
  const riskDistributionData = [
    { name: 'High Risk', value: customers.filter(c => c.riskLevel === 'high').length, color: '#EF4444' },
    { name: 'Medium Risk', value: customers.filter(c => c.riskLevel === 'medium').length, color: '#F59E0B' },
    { name: 'Low Risk', value: customers.filter(c => c.riskLevel === 'low').length, color: '#10B981' }
  ];
  
  // Data for Industry Distribution chart
  const industryData = Array.from(
    customers.reduce((acc, current) => {
      const industry = current.industry;
      const count = acc.get(industry) || 0;
      return acc.set(industry, count + 1);
    }, new Map<string, number>()),
    ([name, value]) => ({ name, value })
  );
  
  const industryColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6'];
  
  const getRiskBadge = (riskLevel: string, score: number) => {
    switch (riskLevel) {
      case 'high':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            High ({score})
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Medium ({score})
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Low ({score})
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Layout title={t('nav.customers')}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {t('nav.customers')}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t('pages.customers.description')}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0">
            <Link href="/add-customer">
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Customer Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Risk Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                Customer Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Industry Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-500" />
                Customer by Industry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={industryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={industryColors[index % industryColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Customers Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex flex-wrap justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Customer List
              </h3>
              <div className="w-full sm:w-auto mt-3 sm:mt-0">
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search customers" 
                      className="pl-9 bg-white"
                    />
                  </div>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Building className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500">Last activity: {customer.lastActivity}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.industry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRiskBadge(customer.riskLevel, customer.riskScore)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.contact}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">View</span>
                          <Eye className="h-4 w-4" />
                        </Button>
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
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">5</span> of <span className="font-medium">35</span> customers
              </div>
              <div className="flex-1 flex justify-center sm:justify-end">
                <Button 
                  variant="outline" 
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white"
                  disabled
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white"
                >
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