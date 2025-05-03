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
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Match the design in the reference app screenshot
export default function SupplyChain() {
  const { t } = useTranslation();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

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
      name: "ABC Corp",
      avatar: "AC",
      address: "Berlin, Germany",
      industry: "Wood Products"
    },
    {
      id: "003",
      name: "ABC Corp",
      avatar: "AC",
      address: "Berlin, Germany",
      industry: "Wood Products"
    }
  ];

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
        {/* Tabs at the top */}
        <Tabs defaultValue="saq-management" className="w-full mb-6">
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
        </Tabs>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="bg-white rounded-lg border shadow-sm">
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
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
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
        <div className="flex justify-between items-center py-3 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Assessment Results</h3>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </Layout>
  );
}