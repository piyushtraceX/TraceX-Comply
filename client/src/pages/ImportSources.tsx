import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

type ImportSource = {
  id: number;
  name: string;
  type: 'csv' | 'api' | 'manual' | 'erp';
  entityId: number;
  entityName: string;
  status: 'active' | 'pending' | 'inactive';
  lastSync?: string;
};

type ImportSourceFormData = {
  name: string;
  type: 'csv' | 'api' | 'manual' | 'erp';
  entityId: number;
  status: 'active' | 'pending' | 'inactive';
  apiKey?: string;
  endpoint?: string;
  description?: string;
};

// Mock data for sourcing entities (would typically come from API)
const sourcingEntities = [
  { id: 1, name: 'Acme Foods', region: 'North America' },
  { id: 2, name: 'EcoPalm Suppliers', region: 'Southeast Asia' },
  { id: 3, name: 'Cocoa Cooperative', region: 'West Africa' },
  { id: 4, name: 'Timber Resources Ltd', region: 'South America' },
  { id: 5, name: 'Coffee Exports Inc', region: 'Central America' },
];

// Type-safe mock data for import sources
const initialImportSources: ImportSource[] = [
  { 
    id: 1, 
    name: 'Weekly CSV Import', 
    type: 'csv',
    entityId: 1,
    entityName: 'Acme Foods',
    status: 'active',
    lastSync: '2023-06-15'
  },
  { 
    id: 2, 
    name: 'ERP Integration', 
    type: 'erp',
    entityId: 2,
    entityName: 'EcoPalm Suppliers',
    status: 'active',
    lastSync: '2023-06-14'
  },
  { 
    id: 3, 
    name: 'Cooperative API', 
    type: 'api',
    entityId: 3,
    entityName: 'Cocoa Cooperative',
    status: 'pending',
    lastSync: undefined
  },
  { 
    id: 4, 
    name: 'Manual Data Entry', 
    type: 'manual',
    entityId: 4,
    entityName: 'Timber Resources Ltd',
    status: 'active',
    lastSync: '2023-06-10'
  },
  { 
    id: 5, 
    name: 'Coffee Import API', 
    type: 'api',
    entityId: 5,
    entityName: 'Coffee Exports Inc',
    status: 'inactive',
    lastSync: '2023-05-20'
  },
];

export default function ImportSources() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  
  const [importSources, setImportSources] = useState<ImportSource[]>(initialImportSources);
  const [formData, setFormData] = useState<ImportSourceFormData>({
    name: '',
    type: 'csv',
    entityId: 0,
    status: 'active',
    apiKey: '',
    endpoint: '',
    description: '',
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentSourceId, setCurrentSourceId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'csv',
      entityId: 0,
      status: 'active',
      apiKey: '',
      endpoint: '',
      description: '',
    });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Source name is required';
    }
    
    if (!formData.entityId) {
      newErrors.entityId = 'Sourcing entity is required';
    }
    
    // Validate type-specific fields
    if (formData.type === 'api') {
      if (!formData.endpoint?.trim()) {
        newErrors.endpoint = 'API endpoint is required';
      }
      if (!formData.apiKey?.trim()) {
        newErrors.apiKey = 'API key is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSource = () => {
    if (!validateForm()) return;
    
    const entityName = sourcingEntities.find(e => e.id === formData.entityId)?.name || '';
    
    const newSource: ImportSource = {
      id: Math.max(0, ...importSources.map(s => s.id)) + 1,
      name: formData.name,
      type: formData.type,
      entityId: formData.entityId,
      entityName: entityName,
      status: formData.status,
      lastSync: formData.type === 'manual' ? new Date().toISOString().split('T')[0] : undefined,
    };
    
    setImportSources([...importSources, newSource]);
    setIsAddDialogOpen(false);
    resetForm();
    
    toast({
      title: "Import source added",
      description: `${newSource.name} has been added successfully.`,
    });
  };

  const handleEditSource = () => {
    if (!validateForm() || currentSourceId === null) return;
    
    const entityName = sourcingEntities.find(e => e.id === formData.entityId)?.name || '';
    
    setImportSources(importSources.map(source => 
      source.id === currentSourceId 
        ? { 
            ...source, 
            name: formData.name,
            type: formData.type,
            entityId: formData.entityId,
            entityName: entityName,
            status: formData.status
          } 
        : source
    ));
    
    setIsEditDialogOpen(false);
    resetForm();
    
    toast({
      title: "Import source updated",
      description: `${formData.name} has been updated successfully.`,
    });
  };

  const handleDeleteSource = (id: number) => {
    const sourceName = importSources.find(source => source.id === id)?.name;
    setImportSources(importSources.filter(source => source.id !== id));
    
    toast({
      title: "Import source deleted",
      description: `${sourceName} has been deleted.`,
      variant: "destructive",
    });
  };

  const openEditDialog = (source: ImportSource) => {
    setCurrentSourceId(source.id);
    setFormData({
      name: source.name,
      type: source.type,
      entityId: source.entityId,
      status: source.status,
      apiKey: '',  // For security, don't populate API key on edit
      endpoint: '',
      description: '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (source: ImportSource) => {
    setCurrentSourceId(source.id);
    setFormData({
      name: source.name,
      type: source.type,
      entityId: source.entityId,
      status: source.status,
      apiKey: '••••••••••••',  // Hide actual API key for security
      endpoint: source.type === 'api' ? 'https://api.example.com/endpoint' : '',
      description: '',
    });
    setIsViewDialogOpen(true);
  };

  const getTypeLabel = (type: ImportSource['type']) => {
    switch (type) {
      case 'csv': return 'CSV Import';
      case 'api': return 'API Integration';
      case 'manual': return 'Manual Entry';
      case 'erp': return 'ERP System';
      default: return type;
    }
  };

  const getTypeBadge = (type: ImportSource['type']) => {
    switch (type) {
      case 'csv':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">CSV</Badge>;
      case 'api':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">API</Badge>;
      case 'manual':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Manual</Badge>;
      case 'erp':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">ERP</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: ImportSource['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Inactive</Badge>;
      default:
        return null;
    }
  };

  // Additional fields depending on the selected type
  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'api':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="endpoint">API Endpoint <span className="text-red-500">*</span></Label>
              <Input
                id="endpoint"
                name="endpoint"
                placeholder="https://api.example.com/data"
                value={formData.endpoint || ''}
                onChange={handleInputChange}
                className={cn(errors.endpoint && "border-red-500")}
              />
              {errors.endpoint && <p className="text-red-500 text-xs mt-1">{errors.endpoint}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key <span className="text-red-500">*</span></Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                placeholder="Enter API key"
                value={formData.apiKey || ''}
                onChange={handleInputChange}
                className={cn(errors.apiKey && "border-red-500")}
              />
              {errors.apiKey && <p className="text-red-500 text-xs mt-1">{errors.apiKey}</p>}
            </div>
          </>
        );
      case 'csv':
        return (
          <div className="grid gap-2">
            <Label htmlFor="description">Import Specification</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add details about CSV format, columns, etc."
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
        );
      case 'erp':
        return (
          <div className="grid gap-2">
            <Label htmlFor="endpoint">ERP System Endpoint</Label>
            <Input
              id="endpoint"
              name="endpoint"
              placeholder="Internal ERP system endpoint"
              value={formData.endpoint || ''}
              onChange={handleInputChange}
            />
          </div>
        );
      case 'manual':
        return (
          <div className="grid gap-2">
            <Label htmlFor="description">Manual Entry Guidelines</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add guidelines for manual data entry"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout title="Import Sources">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold leading-7 text-gray-900 sm:text-2xl sm:truncate">
              Import Sources
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage data import sources for your sourcing entities
            </p>
          </div>
          <div className={cn("mt-4 flex md:mt-0 md:ml-4", isRTL && "flex-row-reverse md:mr-4 md:ml-0")}>
            <Button onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }} className={cn("flex items-center", isRTL && "flex-row-reverse")}>
              <Plus className={cn("-ml-1 mr-2 h-4 w-4", isRTL && "-mr-1 ml-2")} />
              Add Import Source
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="bg-white shadow-sm rounded-md overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sourcing Entity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sync
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importSources.map((source) => (
                  <tr key={source.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {source.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getTypeBadge(source.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {source.entityName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(source.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {source.lastSync || 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(source)}
                          className="text-gray-500 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(source)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will permanently delete the import source "{source.name}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteSource(source.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Import Source Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Import Source</DialogTitle>
            <DialogDescription>
              Create a new data import source for your sourcing entities.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Source Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter source name"
                value={formData.name}
                onChange={handleInputChange}
                className={cn(errors.name && "border-red-500")}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Import Type <span className="text-red-500">*</span></Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV Import</SelectItem>
                  <SelectItem value="api">API Integration</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="erp">ERP System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="entityId">Sourcing Entity <span className="text-red-500">*</span></Label>
              <Select
                value={formData.entityId.toString()}
                onValueChange={(value) => handleSelectChange('entityId', value)}
              >
                <SelectTrigger id="entityId" className={cn(errors.entityId && "border-red-500")}>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  {sourcingEntities.map(entity => (
                    <SelectItem key={entity.id} value={entity.id.toString()}>
                      {entity.name} ({entity.region})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.entityId && <p className="text-red-500 text-xs mt-1">{errors.entityId}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Render additional fields based on selected type */}
            {renderTypeSpecificFields()}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleAddSource}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Import Source Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Import Source</DialogTitle>
            <DialogDescription>
              Update the details of your import source.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Source Name <span className="text-red-500">*</span></Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Enter source name"
                value={formData.name}
                onChange={handleInputChange}
                className={cn(errors.name && "border-red-500")}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Import Type <span className="text-red-500">*</span></Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV Import</SelectItem>
                  <SelectItem value="api">API Integration</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="erp">ERP System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-entityId">Sourcing Entity <span className="text-red-500">*</span></Label>
              <Select
                value={formData.entityId.toString()}
                onValueChange={(value) => handleSelectChange('entityId', value)}
              >
                <SelectTrigger id="edit-entityId" className={cn(errors.entityId && "border-red-500")}>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  {sourcingEntities.map(entity => (
                    <SelectItem key={entity.id} value={entity.id.toString()}>
                      {entity.name} ({entity.region})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.entityId && <p className="text-red-500 text-xs mt-1">{errors.entityId}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Render additional fields based on selected type */}
            {renderTypeSpecificFields()}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleEditSource}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Import Source Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Source Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-gray-500">Name:</div>
              <div className="col-span-2">{formData.name}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-gray-500">Type:</div>
              <div className="col-span-2">{getTypeLabel(formData.type)}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-gray-500">Entity:</div>
              <div className="col-span-2">{sourcingEntities.find(e => e.id === formData.entityId)?.name || 'Unknown'}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-gray-500">Status:</div>
              <div className="col-span-2">{getStatusBadge(formData.status)}</div>
            </div>
            
            {/* Type-specific details */}
            {formData.type === 'api' && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-medium text-gray-500">Endpoint:</div>
                  <div className="col-span-2">{formData.endpoint}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-medium text-gray-500">API Key:</div>
                  <div className="col-span-2">{formData.apiKey}</div>
                </div>
              </>
            )}
            
            {formData.description && (
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-500">Description:</div>
                <div className="col-span-2">{formData.description}</div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-gray-500">Last Sync:</div>
              <div className="col-span-2">
                {importSources.find(s => s.id === currentSourceId)?.lastSync || 'Never'}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}