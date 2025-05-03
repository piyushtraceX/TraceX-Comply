import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

interface AddSupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SupplierFormData) => void;
  formType: 'single' | 'bulk' | 'csv';
}

const supplierFormSchema = z.object({
  name: z.string().min(2, { message: 'Supplier name must be at least 2 characters' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters' }),
  country: z.string().min(2, { message: 'Country is required' }),
  industry: z.string().min(2, { message: 'Industry is required' }),
  contactPerson: z.string().min(2, { message: 'Contact person name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phoneNumber: z.string().min(5, { message: 'Phone number is required' }),
  notes: z.string().optional(),
});

export type SupplierFormData = z.infer<typeof supplierFormSchema>;

export function AddSupplierForm({ open, onOpenChange, onSubmit, formType }: AddSupplierFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: '',
      address: '',
      country: '',
      industry: '',
      contactPerson: '',
      email: '',
      phoneNumber: '',
      notes: '',
    },
  });
  
  const processForm = (data: SupplierFormData) => {
    onSubmit(data);
    reset();
    onOpenChange(false);
  };
  
  const getDialogTitle = () => {
    switch (formType) {
      case 'single': return 'Add Single Supplier';
      case 'bulk': return 'Bulk Add Suppliers';
      case 'csv': return 'Import Suppliers from CSV';
      default: return 'Add Supplier';
    }
  };
  
  const getDialogDescription = () => {
    switch (formType) {
      case 'single': return 'Fill in the details to add a new supplier to your supply chain.';
      case 'bulk': return 'Add multiple suppliers at once.';
      case 'csv': return 'Upload a CSV file with supplier information.';
      default: return 'Add supplier details.';
    }
  };

  const renderCSVUpload = () => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="csvFile">CSV File</Label>
        <Input id="csvFile" type="file" accept=".csv" />
        <p className="text-sm text-muted-foreground">
          CSV file should contain columns: Name, Address, Country, Industry, Contact Person, Email, Phone Number.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="template">Template</Label>
        <Button variant="outline" size="sm" className="w-full justify-start">
          Download CSV Template
        </Button>
      </div>
    </div>
  );

  const renderBulkForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="bulkSuppliers">Add Multiple Suppliers</Label>
        <Textarea
          id="bulkSuppliers"
          placeholder="Enter one supplier per line in format: Name, Address, Country, Industry, Contact, Email, Phone"
          className="h-40"
        />
        <p className="text-sm text-muted-foreground">
          Enter one supplier per line using comma-separated values.
        </p>
      </div>
    </div>
  );

  const renderSingleForm = () => (
    <form onSubmit={handleSubmit(processForm)}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Supplier Name</Label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Select>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="germany">Germany</SelectItem>
                <SelectItem value="france">France</SelectItem>
                <SelectItem value="italy">Italy</SelectItem>
                <SelectItem value="spain">Spain</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            {...register('address')}
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.message}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="industry">Industry/Products</Label>
          <Select>
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select industry or products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timber">Timber</SelectItem>
              <SelectItem value="palm-oil">Palm Oil</SelectItem>
              <SelectItem value="cacao">Cacao</SelectItem>
              <SelectItem value="coffee">Coffee</SelectItem>
              <SelectItem value="rubber">Rubber</SelectItem>
              <SelectItem value="soy">Soy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              {...register('contactPerson')}
              className={errors.contactPerson ? 'border-red-500' : ''}
            />
            {errors.contactPerson && (
              <p className="text-sm text-red-500">{errors.contactPerson.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            {...register('phoneNumber')}
            className={errors.phoneNumber ? 'border-red-500' : ''}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register('notes')} />
        </div>
      </div>
    </form>
  );

  const renderFormContent = () => {
    switch (formType) {
      case 'single': return renderSingleForm();
      case 'bulk': return renderBulkForm();
      case 'csv': return renderCSVUpload();
      default: return renderSingleForm();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        {renderFormContent()}
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            type="submit" 
            onClick={() => handleSubmit(processForm)()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Save Supplier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}