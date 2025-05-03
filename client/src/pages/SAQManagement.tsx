import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { usePersona } from '@/contexts/PersonaContext';
import { Button } from '@/components/ui/button';
import { Plus, FileQuestion, ListFilter, Pencil, Trash2, Upload, Download, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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

// Define the Supplier interface
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

  // Initialize form for editing
  const initEditForm = (saq: SAQ) => {
    setFormTitle(saq.title);
    setFormDescription(saq.description);
    setFormStatus(saq.status);
    setFormDeadline(saq.deadline);
    setFormAssignedSuppliers(saq.assignedSuppliers);
    setSelectedSAQ(saq);
    setIsEditDialogOpen(true);
  };

  // Handle SAQ creation
  const handleCreateSAQ = () => {
    if (!formTitle.trim()) {
      toast({
        title: t('saq.validation.titleRequired'),
        description: t('saq.validation.pleaseEnterTitle'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
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
    }, 800);
  };

  // Handle SAQ update
  const handleUpdateSAQ = () => {
    if (!selectedSAQ) return;
    if (!formTitle.trim()) {
      toast({
        title: t('saq.validation.titleRequired'),
        description: t('saq.validation.pleaseEnterTitle'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedSAQs = saqs.map(saq => {
        if (saq.id === selectedSAQ.id) {
          return {
            ...saq,
            title: formTitle,
            description: formDescription,
            status: formStatus,
            deadline: formDeadline || saq.deadline,
            updatedAt: new Date(),
            assignedSuppliers: formAssignedSuppliers,
          };
        }
        return saq;
      });
      
      setSaqs(updatedSAQs);
      setIsLoading(false);
      setIsEditDialogOpen(false);
      setSelectedSAQ(null);
      resetForm();
      
      toast({
        title: t('saq.notifications.updated'),
        description: t('saq.notifications.saqUpdatedSuccess'),
      });
    }, 800);
  };

  // Handle SAQ deletion
  const handleDeleteSAQ = () => {
    if (!selectedSAQ) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedSAQs = saqs.filter(saq => saq.id !== selectedSAQ.id);
      setSaqs(updatedSAQs);
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedSAQ(null);
      
      toast({
        title: t('saq.notifications.deleted'),
        description: t('saq.notifications.saqDeletedSuccess'),
      });
    }, 800);
  };

  // Handle CSV data upload for SAQ questions
  const handleCSVUpload = (data: { headers: string[]; rows: string[][] }) => {
    setCsvData(data);
    
    toast({
      title: t('saq.notifications.questionsUploaded'),
      description: t('saq.notifications.questionsUploadedSuccess', { count: data.rows.length }),
    });
  };

  // Filter SAQs based on status
  const filteredSAQs = filter === 'all' ? saqs : saqs.filter(saq => saq.status === filter);

  // Get supplier names from IDs
  const getSupplierNames = (supplierIds: number[]): string => {
    if (supplierIds.length === 0) return t('saq.noSuppliersAssigned');
    
    const names = supplierIds.map(id => {
      const supplier = suppliers.find(s => s.id === id);
      return supplier ? supplier.name : `Unknown (ID: ${id})`;
    });
    
    return names.join(', ');
  };

  // Render status badge
  const renderStatusBadge = (status: SAQ['status']) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let icon = null;
    let statusText = '';
    
    switch (status) {
      case 'draft':
        variant = "outline";
        icon = <Clock className="h-3.5 w-3.5 mr-1" />;
        statusText = t('saq.status.draft');
        break;
      case 'published':
        variant = "default";
        icon = <FileQuestion className="h-3.5 w-3.5 mr-1" />;
        statusText = t('saq.status.published');
        break;
      case 'completed':
        variant = "secondary";
        icon = <CheckCircle className="h-3.5 w-3.5 mr-1" />;
        statusText = t('saq.status.completed');
        break;
      case 'expired':
        variant = "destructive";
        icon = <AlertCircle className="h-3.5 w-3.5 mr-1" />;
        statusText = t('saq.status.expired');
        break;
    }
    
    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        <span>{statusText}</span>
      </Badge>
    );
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
        
        {/* Tabs for status filtering */}
        <Tabs defaultValue="all" className="mb-6" onValueChange={setFilter}>
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
          <div className="grid grid-cols-1 gap-4">
            {filteredSAQs.map((saq) => (
              <Card key={saq.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <CardTitle className="text-lg font-medium">
                      {saq.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {renderStatusBadge(saq.status)}
                      
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => initEditForm(saq)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">{t('saq.actions.edit')}</span>
                          </Button>
                        )}
                        
                        {canDelete && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => { setSelectedSAQ(saq); setIsDeleteDialogOpen(true); }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">{t('saq.actions.delete')}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {t('saq.fields.description')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {saq.description || t('saq.noDescription')}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {t('saq.fields.deadline')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {format(saq.deadline, 'PPP')}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {t('saq.fields.assignedSuppliers')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {getSupplierNames(saq.assignedSuppliers)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
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
                <Label htmlFor="title" className="required">
                  {t('saq.fields.title')}
                </Label>
                <Input
                  id="title"
                  placeholder={t('saq.placeholders.title')}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">
                  {t('saq.fields.description')}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('saq.placeholders.description')}
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">
                  {t('saq.fields.status')}
                </Label>
                <Select value={formStatus} onValueChange={(value) => setFormStatus(value as SAQ['status'])}>
                  <SelectTrigger>
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
                <Label htmlFor="deadline">
                  {t('saq.fields.deadline')}
                </Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formDeadline && "text-muted-foreground"
                      )}
                    >
                      {formDeadline ? format(formDeadline, 'PPP') : <span>{t('saq.placeholders.deadline')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
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
              
              <div className="grid gap-2">
                <Label htmlFor="suppliers">
                  {t('saq.fields.assignSuppliers')}
                </Label>
                <Select 
                  onValueChange={(value) => {
                    const supplierId = parseInt(value);
                    if (formAssignedSuppliers.includes(supplierId)) {
                      setFormAssignedSuppliers(formAssignedSuppliers.filter(id => id !== supplierId));
                    } else {
                      setFormAssignedSuppliers([...formAssignedSuppliers, supplierId]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('saq.placeholders.selectSuppliers')} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name} ({supplier.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {formAssignedSuppliers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formAssignedSuppliers.map(supplierId => {
                      const supplier = suppliers.find(s => s.id === supplierId);
                      return supplier ? (
                        <Badge key={supplierId} variant="secondary" className="flex items-center gap-1">
                          {supplier.name}
                          <button
                            type="button"
                            className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                            onClick={() => setFormAssignedSuppliers(formAssignedSuppliers.filter(id => id !== supplierId))}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">{t('actions.remove')}</span>
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isLoading}
              >
                {t('actions.cancel')}
              </Button>
              <Button
                onClick={handleCreateSAQ}
                disabled={isLoading}
              >
                {isLoading ? t('actions.creating') : t('actions.create')}
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
                <Label htmlFor="edit-title" className="required">
                  {t('saq.fields.title')}
                </Label>
                <Input
                  id="edit-title"
                  placeholder={t('saq.placeholders.title')}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-description">
                  {t('saq.fields.description')}
                </Label>
                <Textarea
                  id="edit-description"
                  placeholder={t('saq.placeholders.description')}
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-status">
                  {t('saq.fields.status')}
                </Label>
                <Select value={formStatus} onValueChange={(value) => setFormStatus(value as SAQ['status'])}>
                  <SelectTrigger>
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
                <Label htmlFor="edit-deadline">
                  {t('saq.fields.deadline')}
                </Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formDeadline && "text-muted-foreground"
                      )}
                    >
                      {formDeadline ? format(formDeadline, 'PPP') : <span>{t('saq.placeholders.deadline')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
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
              
              <div className="grid gap-2">
                <Label htmlFor="edit-suppliers">
                  {t('saq.fields.assignSuppliers')}
                </Label>
                <Select 
                  onValueChange={(value) => {
                    const supplierId = parseInt(value);
                    if (formAssignedSuppliers.includes(supplierId)) {
                      setFormAssignedSuppliers(formAssignedSuppliers.filter(id => id !== supplierId));
                    } else {
                      setFormAssignedSuppliers([...formAssignedSuppliers, supplierId]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('saq.placeholders.selectSuppliers')} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name} ({supplier.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {formAssignedSuppliers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formAssignedSuppliers.map(supplierId => {
                      const supplier = suppliers.find(s => s.id === supplierId);
                      return supplier ? (
                        <Badge key={supplierId} variant="secondary" className="flex items-center gap-1">
                          {supplier.name}
                          <button
                            type="button"
                            className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                            onClick={() => setFormAssignedSuppliers(formAssignedSuppliers.filter(id => id !== supplierId))}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">{t('actions.remove')}</span>
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isLoading}
              >
                {t('actions.cancel')}
              </Button>
              <Button
                onClick={handleUpdateSAQ}
                disabled={isLoading}
              >
                {isLoading ? t('actions.saving') : t('actions.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('saq.dialogs.delete.title')}</DialogTitle>
              <DialogDescription>
                {t('saq.dialogs.delete.description')}
              </DialogDescription>
            </DialogHeader>
            
            {selectedSAQ && (
              <div className="py-4">
                <p className="font-medium text-gray-900 mb-2">
                  {selectedSAQ.title}
                </p>
                <p className="text-sm text-gray-600">
                  {t('saq.dialogs.delete.warning')}
                </p>
              </div>
            )}
            
            <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isLoading}
              >
                {t('actions.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSAQ}
                disabled={isLoading}
              >
                {isLoading ? t('actions.deleting') : t('actions.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Upload SAQ Questions Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{t('saq.dialogs.upload.title')}</DialogTitle>
              <DialogDescription>
                {t('saq.dialogs.upload.description')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <CSVUploader onDataLoaded={handleCSVUpload} />
              
              {csvData && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">
                    {t('saq.dialogs.upload.preview')}
                  </h3>
                  <CSVTable data={csvData} />
                </div>
              )}
            </div>
            
            <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
              <Button 
                variant="outline" 
                onClick={() => setIsUploadDialogOpen(false)}
              >
                {t('actions.close')}
              </Button>
              <Button
                disabled={!csvData}
                onClick={() => {
                  setIsUploadDialogOpen(false);
                  toast({
                    title: t('saq.notifications.questionsSaved'),
                    description: t('saq.notifications.questionsSavedSuccess'),
                  });
                }}
              >
                {t('actions.saveQuestions')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}