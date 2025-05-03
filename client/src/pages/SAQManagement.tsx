import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { usePersona } from '@/contexts/PersonaContext';
import { Button } from '@/components/ui/button';
import { Plus, FileQuestion, ListFilter, Pencil, Trash2, Upload, Download, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { CSVUploader, CSVTable } from '@/components/compliance/CSVUploader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define the SAQ interface
interface SAQ {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'expired' | 'completed';
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
  assignedSuppliers: number[]; // IDs of assigned suppliers
}

// Define the supplier interface
interface Supplier {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'pending';
}

// Mock data for initial testing
const mockSuppliers: Supplier[] = [
  { id: 1, name: 'Eco Timber Solutions', location: 'Brazil', status: 'active' },
  { id: 2, name: 'Green Forest Products', location: 'Indonesia', status: 'active' },
  { id: 3, name: 'Sustainable Woods Inc.', location: 'Canada', status: 'active' },
  { id: 4, name: 'Global Timber Trading', location: 'Malaysia', status: 'pending' },
  { id: 5, name: 'Europa Wood Imports', location: 'Germany', status: 'inactive' },
];

const initialSAQs: SAQ[] = [
  {
    id: 1,
    title: 'EUDR Basic Compliance Assessment',
    description: 'Basic assessment for suppliers to verify compliance with EU Deforestation Regulation',
    status: 'published',
    deadline: new Date(2023, 11, 31),
    createdAt: new Date(2023, 5, 15),
    updatedAt: new Date(2023, 5, 15),
    assignedSuppliers: [1, 2],
  },
  {
    id: 2,
    title: 'Supply Chain Due Diligence Questionnaire',
    description: 'Detailed assessment for supply chain transparency and traceability',
    status: 'draft',
    deadline: new Date(2023, 12, 15),
    createdAt: new Date(2023, 6, 1),
    updatedAt: new Date(2023, 7, 10),
    assignedSuppliers: [3],
  },
  {
    id: 3,
    title: 'Deforestation Risk Assessment',
    description: 'Assessment for evaluating deforestation risks in current operations',
    status: 'completed',
    deadline: new Date(2023, 7, 30),
    createdAt: new Date(2023, 4, 10),
    updatedAt: new Date(2023, 7, 28),
    assignedSuppliers: [1, 4, 5],
  },
  {
    id: 4,
    title: 'Supplier EUDR Readiness Check',
    description: 'Quick assessment to evaluate supplier readiness for EUDR compliance',
    status: 'expired',
    deadline: new Date(2023, 4, 15),
    createdAt: new Date(2023, 2, 1),
    updatedAt: new Date(2023, 2, 1),
    assignedSuppliers: [],
  },
];

export default function SAQManagement() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const { canAccess } = usePersona();
  
  // State for SAQs and suppliers
  const [saqs, setSaqs] = useState<SAQ[]>(initialSAQs);
  const [suppliers] = useState<Supplier[]>(mockSuppliers);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  
  // State for SAQ form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedSAQ, setSelectedSAQ] = useState<SAQ | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<SAQ['status']>('draft');
  const [formDeadline, setFormDeadline] = useState<Date | undefined>(new Date());
  const [formAssignedSuppliers, setFormAssignedSuppliers] = useState<number[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // CSV data state
  const [csvData, setCsvData] = useState<{ headers: string[]; rows: string[][] } | null>(null);

  // Reset form data
  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormStatus('draft');
    setFormDeadline(new Date());
    setFormAssignedSuppliers([]);
  };

  // Initialize edit form
  const initEditForm = (saq: SAQ) => {
    setFormTitle(saq.title);
    setFormDescription(saq.description);
    setFormStatus(saq.status);
    setFormDeadline(saq.deadline);
    setFormAssignedSuppliers(saq.assignedSuppliers);
    setSelectedSAQ(saq);
    setIsEditDialogOpen(true);
  };

  // Handle form submission
  const handleAddSAQ = () => {
    // Validate form
    if (!formTitle.trim()) {
      toast({
        variant: 'destructive',
        title: t('saq.validation.titleRequired'),
        description: t('saq.validation.pleaseEnterTitle'),
      });
      return;
    }
    
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      const newSAQ: SAQ = {
        id: Math.max(...saqs.map(s => s.id), 0) + 1,
        title: formTitle,
        description: formDescription,
        status: formStatus,
        deadline: formDeadline || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedSuppliers: formAssignedSuppliers,
      };
      
      setSaqs([...saqs, newSAQ]);
      setIsLoading(false);
      setIsAddDialogOpen(false);
      resetForm();
      
      toast({
        title: t('saq.notifications.created'),
        description: t('saq.notifications.saqCreatedSuccess'),
      });
    }, 500);
  };

  // Handle edit submission
  const handleEditSAQ = () => {
    if (!selectedSAQ) return;
    
    // Validate form
    if (!formTitle.trim()) {
      toast({
        variant: 'destructive',
        title: t('saq.validation.titleRequired'),
        description: t('saq.validation.pleaseEnterTitle'),
      });
      return;
    }
    
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      const updatedSAQ: SAQ = {
        ...selectedSAQ,
        title: formTitle,
        description: formDescription,
        status: formStatus,
        deadline: formDeadline || selectedSAQ.deadline,
        updatedAt: new Date(),
        assignedSuppliers: formAssignedSuppliers,
      };
      
      const updatedSAQs = saqs.map(s => s.id === selectedSAQ.id ? updatedSAQ : s);
      setSaqs(updatedSAQs);
      setIsLoading(false);
      setIsEditDialogOpen(false);
      setSelectedSAQ(null);
      resetForm();
      
      toast({
        title: t('saq.notifications.updated'),
        description: t('saq.notifications.saqUpdatedSuccess'),
      });
    }, 500);
  };

  // Handle delete
  const handleDeleteSAQ = () => {
    if (!selectedSAQ) return;
    
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      const updatedSAQs = saqs.filter(s => s.id !== selectedSAQ.id);
      setSaqs(updatedSAQs);
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedSAQ(null);
      
      toast({
        title: t('saq.notifications.deleted'),
        description: t('saq.notifications.saqDeletedSuccess'),
      });
    }, 500);
  };

  // Handle CSV upload
  const handleCSVUpload = (data: { headers: string[]; rows: string[][] }) => {
    setCsvData(data);
    
    toast({
      title: t('saq.notifications.questionsUploaded'),
      description: t('saq.notifications.questionsUploadedSuccess', { count: data.rows.length }),
    });
  };

  // Filter SAQs based on active tab
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredSAQs = saqs.filter(saq => {
    if (activeTab === 'all') return true;
    return saq.status === activeTab;
  });

  // Status badge renderer
  const renderStatusBadge = (status: SAQ['status']) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {t('saq.status.draft')}
          </Badge>
        );
      case 'published':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3" />
            {t('saq.status.published')}
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3" />
            {t('saq.status.completed')}
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3" />
            {t('saq.status.expired')}
          </Badge>
        );
      default:
        return null;
    }
  };

  // Check if user can edit/delete
  const canEdit = canAccess('edit-saq');
  const canDelete = canAccess('delete-saq');

  return (
    <Layout title={t('nav.saqManagement')}>
      <div className="container mx-auto p-4 md:p-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('saq.title')}
          </h1>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="flex items-center gap-1.5"
              onClick={() => setFilter(filter === 'all' ? 'published' : 'all')}
            >
              <ListFilter className="h-4 w-4" />
              <span>
                {filter === 'all' 
                  ? t('saq.actions.filterActive') 
                  : t('saq.actions.showAll')}
              </span>
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              className="flex items-center gap-1.5"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              <span>{t('saq.actions.uploadQuestions')}</span>
            </Button>
            
            <Button 
              className="flex items-center gap-1.5"
              onClick={() => { resetForm(); setIsAddDialogOpen(true); }}
            >
              <Plus className="h-4 w-4" />
              <span>{t('saq.actions.addSAQ')}</span>
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="all">{t('saq.tabs.all')}</TabsTrigger>
            <TabsTrigger value="draft">{t('saq.tabs.draft')}</TabsTrigger>
            <TabsTrigger value="published">{t('saq.tabs.published')}</TabsTrigger>
            <TabsTrigger value="completed">{t('saq.tabs.completed')}</TabsTrigger>
            <TabsTrigger value="expired">{t('saq.tabs.expired')}</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* SAQ List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredSAQs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileQuestion className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {t('saq.emptyState.title')}
              </h3>
              <p className="text-gray-500 mb-4 max-w-md">
                {t('saq.emptyState.description')}
              </p>
              <Button
                onClick={() => { resetForm(); setIsAddDialogOpen(true); }}
                className="flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>{t('saq.actions.addSAQ')}</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">{t('saq.fields.title')}</TableHead>
                    <TableHead>{t('saq.fields.status')}</TableHead>
                    <TableHead>{t('saq.fields.deadline')}</TableHead>
                    <TableHead>{t('saq.fields.assignedSuppliers')}</TableHead>
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
                            {saq.description || t('saq.noDescription')}
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
                            {t('saq.noSuppliersAssigned')}
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
                          {canEdit && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                              onClick={() => initEditForm(saq)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-red-600 hover:text-red-700"
                              onClick={() => { setSelectedSAQ(saq); setIsDeleteDialogOpen(true); }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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
      
      {/* Add SAQ Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('saq.dialogs.add.title')}</DialogTitle>
            <DialogDescription>
              {t('saq.dialogs.add.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">{t('saq.fields.title')} *</Label>
              <Input
                id="title"
                placeholder={t('saq.placeholders.title')}
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">{t('saq.fields.description')}</Label>
              <Textarea
                id="description"
                placeholder={t('saq.placeholders.description')}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">{t('saq.fields.status')}</Label>
                <Select
                  value={formStatus}
                  onValueChange={(value: SAQ['status']) => setFormStatus(value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder={t('saq.placeholders.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('saq.status.draft')}</SelectItem>
                    <SelectItem value="published">{t('saq.status.published')}</SelectItem>
                    <SelectItem value="completed">{t('saq.status.completed')}</SelectItem>
                    <SelectItem value="expired">{t('saq.status.expired')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="deadline">{t('saq.fields.deadline')}</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="deadline"
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !formDeadline && "text-muted-foreground"
                      )}
                    >
                      {formDeadline ? format(formDeadline, "PPP") : (
                        <span>{t('saq.placeholders.deadline')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formDeadline}
                      onSelect={(date) => {
                        setFormDeadline(date);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="suppliers">{t('saq.fields.assignSuppliers')}</Label>
              <Select
                value=""
                onValueChange={(value: string) => {
                  const supplierId = parseInt(value, 10);
                  if (!formAssignedSuppliers.includes(supplierId)) {
                    setFormAssignedSuppliers([...formAssignedSuppliers, supplierId]);
                  }
                }}
              >
                <SelectTrigger id="suppliers">
                  <SelectValue placeholder={t('saq.placeholders.selectSuppliers')} />
                </SelectTrigger>
                <SelectContent>
                  {suppliers
                    .filter(s => s.status === 'active')
                    .filter(s => !formAssignedSuppliers.includes(s.id))
                    .map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name} ({supplier.location})
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              
              {formAssignedSuppliers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formAssignedSuppliers.map(supplierId => {
                    const supplier = suppliers.find(s => s.id === supplierId);
                    return supplier ? (
                      <Badge 
                        key={supplierId} 
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
                      >
                        <span>{supplier.name}</span>
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => setFormAssignedSuppliers(
                            formAssignedSuppliers.filter(id => id !== supplierId)
                          )}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className={isRTL ? 'justify-start' : ''}>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={handleAddSAQ} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t('common.processing')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit SAQ Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('saq.dialogs.edit.title')}</DialogTitle>
            <DialogDescription>
              {t('saq.dialogs.edit.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">{t('saq.fields.title')} *</Label>
              <Input
                id="edit-title"
                placeholder={t('saq.placeholders.title')}
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">{t('saq.fields.description')}</Label>
              <Textarea
                id="edit-description"
                placeholder={t('saq.placeholders.description')}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status">{t('saq.fields.status')}</Label>
                <Select
                  value={formStatus}
                  onValueChange={(value: SAQ['status']) => setFormStatus(value)}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder={t('saq.placeholders.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('saq.status.draft')}</SelectItem>
                    <SelectItem value="published">{t('saq.status.published')}</SelectItem>
                    <SelectItem value="completed">{t('saq.status.completed')}</SelectItem>
                    <SelectItem value="expired">{t('saq.status.expired')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-deadline">{t('saq.fields.deadline')}</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="edit-deadline"
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !formDeadline && "text-muted-foreground"
                      )}
                    >
                      {formDeadline ? format(formDeadline, "PPP") : (
                        <span>{t('saq.placeholders.deadline')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formDeadline}
                      onSelect={(date) => {
                        setFormDeadline(date);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-suppliers">{t('saq.fields.assignSuppliers')}</Label>
              <Select
                value=""
                onValueChange={(value: string) => {
                  const supplierId = parseInt(value, 10);
                  if (!formAssignedSuppliers.includes(supplierId)) {
                    setFormAssignedSuppliers([...formAssignedSuppliers, supplierId]);
                  }
                }}
              >
                <SelectTrigger id="edit-suppliers">
                  <SelectValue placeholder={t('saq.placeholders.selectSuppliers')} />
                </SelectTrigger>
                <SelectContent>
                  {suppliers
                    .filter(s => s.status === 'active')
                    .filter(s => !formAssignedSuppliers.includes(s.id))
                    .map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name} ({supplier.location})
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              
              {formAssignedSuppliers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formAssignedSuppliers.map(supplierId => {
                    const supplier = suppliers.find(s => s.id === supplierId);
                    return supplier ? (
                      <Badge 
                        key={supplierId} 
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
                      >
                        <span>{supplier.name}</span>
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => setFormAssignedSuppliers(
                            formAssignedSuppliers.filter(id => id !== supplierId)
                          )}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className={isRTL ? 'justify-start' : ''}>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={handleEditSAQ} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t('common.processing')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete SAQ Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('saq.dialogs.delete.title')}</DialogTitle>
            <DialogDescription>
              {t('saq.dialogs.delete.description')}
              <p className="mt-2 text-red-500 font-medium">
                {t('saq.dialogs.delete.warning')}
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className={isRTL ? 'justify-start' : ''}>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteSAQ} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t('common.processing')}
                </>
              ) : (
                t('common.delete')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Upload Questions Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t('saq.dialogs.upload.title')}</DialogTitle>
            <DialogDescription>
              {t('saq.dialogs.upload.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <CSVUploader
              onDataLoaded={handleCSVUpload}
              allowedExtensions={['.csv']}
              className="mb-6"
            />
            
            {csvData && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">{t('saq.dialogs.upload.preview')}</h3>
                <CSVTable data={csvData} className="max-h-[300px] overflow-auto" />
              </div>
            )}
          </div>
          
          <DialogFooter className={isRTL ? 'justify-start' : ''}>
            <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              type="button" 
              disabled={!csvData} 
              onClick={() => {
                setIsUploadDialogOpen(false);
                setCsvData(null);
                toast({
                  title: t('saq.notifications.questionsSaved'),
                  description: t('saq.notifications.questionsSavedSuccess'),
                });
              }}
            >
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}