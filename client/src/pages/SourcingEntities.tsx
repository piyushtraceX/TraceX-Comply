import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
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

type Entity = {
  id: number;
  name: string;
  region: string;
  status: 'active' | 'pending' | 'inactive';
};

type EntityFormData = {
  name: string;
  region: string;
  status: 'active' | 'pending' | 'inactive';
};

// Type-safe mock data for entities
const initialEntities: Entity[] = [
  { id: 1, name: 'Acme Foods', region: 'North America', status: 'active' },
  { id: 2, name: 'EcoPalm Suppliers', region: 'Southeast Asia', status: 'active' },
  { id: 3, name: 'Cocoa Cooperative', region: 'West Africa', status: 'pending' },
  { id: 4, name: 'Timber Resources Ltd', region: 'South America', status: 'active' },
  { id: 5, name: 'Coffee Exports Inc', region: 'Central America', status: 'inactive' },
];

export default function SourcingEntities() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  
  const [entities, setEntities] = useState<Entity[]>(initialEntities);
  const [formData, setFormData] = useState<EntityFormData>({
    name: '',
    region: '',
    status: 'active',
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentEntityId, setCurrentEntityId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      region: '',
      status: 'active',
    });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Entity name is required';
    }
    
    if (!formData.region.trim()) {
      newErrors.region = 'Region is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddEntity = () => {
    if (!validateForm()) return;
    
    const newEntity: Entity = {
      id: Math.max(0, ...entities.map(e => e.id)) + 1,
      ...formData,
    };
    
    setEntities([...entities, newEntity]);
    setIsAddDialogOpen(false);
    resetForm();
    
    toast({
      title: "Entity added",
      description: `${newEntity.name} has been added successfully.`,
    });
  };

  const handleEditEntity = () => {
    if (!validateForm() || currentEntityId === null) return;
    
    setEntities(entities.map(entity => 
      entity.id === currentEntityId 
        ? { ...entity, ...formData } 
        : entity
    ));
    
    setIsEditDialogOpen(false);
    resetForm();
    
    toast({
      title: "Entity updated",
      description: `${formData.name} has been updated successfully.`,
    });
  };

  const handleDeleteEntity = (id: number) => {
    const entityName = entities.find(entity => entity.id === id)?.name;
    setEntities(entities.filter(entity => entity.id !== id));
    
    toast({
      title: "Entity deleted",
      description: `${entityName} has been deleted.`,
      variant: "destructive",
    });
  };

  const openEditDialog = (entity: Entity) => {
    setCurrentEntityId(entity.id);
    setFormData({
      name: entity.name,
      region: entity.region,
      status: entity.status,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (entity: Entity) => {
    setCurrentEntityId(entity.id);
    setFormData({
      name: entity.name,
      region: entity.region,
      status: entity.status,
    });
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: Entity['status']) => {
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

  return (
    <Layout title="Sourcing Entities">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold leading-7 text-gray-900 sm:text-2xl sm:truncate">
              Sourcing Entities
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your sourcing entities and their regional supply chains
            </p>
          </div>
          <div className={cn("mt-4 flex md:mt-0 md:ml-4", isRTL && "flex-row-reverse md:mr-4 md:ml-0")}>
            <Button onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }} className={cn("flex items-center", isRTL && "flex-row-reverse")}>
              <Plus className={cn("-ml-1 mr-2 h-4 w-4", isRTL && "-mr-1 ml-2")} />
              Add Entity
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
                    Region
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entities.map((entity) => (
                  <tr key={entity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entity.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entity.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(entity.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(entity)}
                          className="text-gray-500 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(entity)}
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
                                This action will permanently delete the entity "{entity.name}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteEntity(entity.id)}
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

      {/* Add Entity Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Sourcing Entity</DialogTitle>
            <DialogDescription>
              Create a new sourcing entity to manage suppliers and products in a specific region.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Entity Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter entity name"
                value={formData.name}
                onChange={handleInputChange}
                className={cn(errors.name && "border-red-500")}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="region">Region <span className="text-red-500">*</span></Label>
              <Input
                id="region"
                name="region"
                placeholder="Enter region (e.g., Southeast Asia)"
                value={formData.region}
                onChange={handleInputChange}
                className={cn(errors.region && "border-red-500")}
              />
              {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleAddEntity}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Entity Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sourcing Entity</DialogTitle>
            <DialogDescription>
              Update the details of your sourcing entity.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Entity Name <span className="text-red-500">*</span></Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Enter entity name"
                value={formData.name}
                onChange={handleInputChange}
                className={cn(errors.name && "border-red-500")}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-region">Region <span className="text-red-500">*</span></Label>
              <Input
                id="edit-region"
                name="region"
                placeholder="Enter region (e.g., Southeast Asia)"
                value={formData.region}
                onChange={handleInputChange}
                className={cn(errors.region && "border-red-500")}
              />
              {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleEditEntity}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Entity Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Entity Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-gray-500">Name:</div>
              <div className="col-span-2">{formData.name}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-gray-500">Region:</div>
              <div className="col-span-2">{formData.region}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-gray-500">Status:</div>
              <div className="col-span-2">{getStatusBadge(formData.status)}</div>
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