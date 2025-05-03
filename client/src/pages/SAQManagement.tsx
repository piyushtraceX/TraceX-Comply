import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Plus, 
  FileDown, 
  Eye, 
  Edit, 
  Trash,
  Download, 
  CheckCircle,
  AlertCircle,
  Clock,
  ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SAQ {
  id: number;
  title: string;
  description: string;
  status: 'published' | 'draft' | 'archived';
  deadline: string;
  suppliers: string[];
  totalQuestions: number;
  mandatoryQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export default function SAQManagement() {
  console.log("SAQManagement component rendering");
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSAQ, setSelectedSAQ] = useState<SAQ | null>(null);

  // Mock data for SAQs
  const saqData: SAQ[] = [
    {
      id: 1,
      title: 'EUDR Basic Compliance Assessment',
      description: 'Basic assessment for suppliers to verify compliance with EU Deforestation Regulation',
      status: 'published',
      deadline: '2023-12-31',
      suppliers: ['Eco Timber Solutions', 'Green Forest Products'],
      totalQuestions: 25,
      mandatoryQuestions: 15,
      createdAt: '2023-01-15',
      updatedAt: '2023-03-20'
    },
    {
      id: 2,
      title: 'Supply Chain Due Diligence Questionnaire',
      description: 'Detailed assessment for supply chain transparency and traceability',
      status: 'draft',
      deadline: '2024-01-15',
      suppliers: ['Sustainable Woods Inc.'],
      totalQuestions: 42,
      mandatoryQuestions: 30,
      createdAt: '2023-02-10',
      updatedAt: '2023-04-05'
    },
    {
      id: 3,
      title: 'Timber Sourcing Risk Assessment',
      description: 'Comprehensive risk assessment for timber sourcing operations',
      status: 'published',
      deadline: '2023-11-30',
      suppliers: ['ForestCert Partners', 'Global Wood Traders'],
      totalQuestions: 35,
      mandatoryQuestions: 20,
      createdAt: '2023-03-05',
      updatedAt: '2023-05-12'
    },
    {
      id: 4,
      title: 'EUDR Implementation Readiness Check',
      description: 'Advanced questionnaire to verify supplier readiness for EUDR implementation',
      status: 'archived',
      deadline: '2023-09-15',
      suppliers: ['EcoHarvest Ltd.'],
      totalQuestions: 30,
      mandatoryQuestions: 25,
      createdAt: '2023-01-25',
      updatedAt: '2023-06-18'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Archived
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredSAQs = saqData
    .filter(saq => 
      statusFilter === 'all' || saq.status === statusFilter
    )
    .filter(saq => 
      saq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      saq.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleDeleteClick = (saq: SAQ) => {
    setSelectedSAQ(saq);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Here you would delete the SAQ in a real implementation
    console.log(`Deleting SAQ with ID: ${selectedSAQ?.id}`);
    setIsDeleteDialogOpen(false);
  };

  return (
    <Layout title="SAQ Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-grow">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search questionnaires..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" className="gap-1">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              New Questionnaire
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
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
                {filteredSAQs.length > 0 ? (
                  filteredSAQs.map((saq) => (
                    <tr key={saq.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{saq.title}</div>
                          <div className="text-sm text-gray-500">{saq.description}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(saq.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(saq.deadline).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {saq.suppliers.map((supplier, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-100 text-xs">
                              {supplier}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => console.log(`Viewing SAQ with ID: ${saq.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => console.log(`Editing SAQ with ID: ${saq.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteClick(saq)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No questionnaires found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the questionnaire "{selectedSAQ?.title}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}