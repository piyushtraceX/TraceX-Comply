import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Plus, FileQuestion, Pencil, Trash2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

// Define the SAQ interface
interface SAQ {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'expired' | 'completed';
  deadline: Date;
  assignedSuppliers: number[];
}

// Define the supplier interface
interface Supplier {
  id: number;
  name: string;
  location: string;
}

// Mock data
const mockSAQs: SAQ[] = [
  {
    id: 1,
    title: 'EUDR Basic Compliance Assessment',
    description: 'Basic assessment for suppliers to verify compliance with EU Deforestation Regulation',
    status: 'published',
    deadline: new Date(2023, 11, 31),
    assignedSuppliers: [1, 2]
  },
  {
    id: 2,
    title: 'Supply Chain Due Diligence Questionnaire',
    description: 'Detailed assessment for supply chain transparency and traceability',
    status: 'draft',
    deadline: new Date(2023, 12, 15),
    assignedSuppliers: [3]
  },
  {
    id: 3,
    title: 'Deforestation Risk Assessment',
    description: 'Assessment for evaluating deforestation risks in current operations',
    status: 'completed',
    deadline: new Date(2023, 7, 30),
    assignedSuppliers: [1, 4, 5]
  },
  {
    id: 4,
    title: 'Supplier EUDR Readiness Check',
    description: 'Quick assessment to evaluate supplier readiness for EUDR compliance',
    status: 'expired',
    deadline: new Date(2023, 4, 15),
    assignedSuppliers: []
  }
];

const mockSuppliers: Supplier[] = [
  { id: 1, name: 'Eco Timber Solutions', location: 'Brazil' },
  { id: 2, name: 'Green Forest Products', location: 'Indonesia' },
  { id: 3, name: 'Sustainable Woods Inc.', location: 'Canada' },
  { id: 4, name: 'Global Timber Trading', location: 'Malaysia' },
  { id: 5, name: 'Europa Wood Imports', location: 'Germany' }
];

export default function SAQManagement() {
  const { t } = useTranslation();
  const [saqs] = useState<SAQ[]>(mockSAQs);
  const [suppliers] = useState<Supplier[]>(mockSuppliers);
  const [activeTab, setActiveTab] = useState('all');

  // Filter SAQs based on active tab
  const filteredSAQs = saqs.filter(saq => {
    if (activeTab === 'all') return true;
    return saq.status === activeTab;
  });

  // Status badge renderer
  const renderStatusBadge = (status: SAQ['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'published':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Published</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout title={t('nav.saqManagement')}>
      <div className="container mx-auto p-4 md:p-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            SAQ Management
          </h1>
          
          <Button 
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add SAQ</span>
          </Button>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* SAQ List as a table */}
        {filteredSAQs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileQuestion className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No SAQs Found
              </h3>
              <p className="text-gray-500 mb-4 max-w-md">
                No self-assessment questionnaires found with the current filter.
              </p>
              <Button className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Add SAQ</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Suppliers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSAQs.map((saq) => (
                    <TableRow key={saq.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{saq.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-[250px]">
                            {saq.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(saq.status)}
                      </TableCell>
                      <TableCell>{format(saq.deadline, 'PPP')}</TableCell>
                      <TableCell>
                        {saq.assignedSuppliers.length === 0 ? (
                          <span className="text-sm text-gray-500 italic">
                            No suppliers assigned
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {saq.assignedSuppliers.slice(0, 2).map(supplierId => {
                              const supplier = suppliers.find(s => s.id === supplierId);
                              return supplier ? (
                                <Badge key={supplierId} variant="secondary" className="text-xs">
                                  {supplier.name}
                                </Badge>
                              ) : null;
                            })}
                            
                            {saq.assignedSuppliers.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{saq.assignedSuppliers.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}