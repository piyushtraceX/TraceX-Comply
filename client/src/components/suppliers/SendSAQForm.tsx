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
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription,
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SendSAQFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierName: string;
  onSubmit: (data: SAQFormData) => void;
}

const saqFormSchema = z.object({
  title: z.string().min(3, { message: 'Title is required' }),
  suppliers: z.array(z.string()).min(1, { message: 'At least one supplier must be selected' }),
  template: z.string().min(1, { message: 'Template selection is required' }),
  deadline: z.date({
    required_error: "Please select a deadline date.",
  }),
  message: z.string().optional(),
  sendReminders: z.boolean().default(true),
});

export type SAQFormData = z.infer<typeof saqFormSchema>;

export function SendSAQForm({ open, onOpenChange, supplierName, onSubmit }: SendSAQFormProps) {
  const form = useForm<SAQFormData>({
    resolver: zodResolver(saqFormSchema),
    defaultValues: {
      title: `SAQ for ${supplierName}`,
      suppliers: [supplierName],
      template: '',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      message: '',
      sendReminders: true,
    },
  });
  
  const handleSubmit = (data: SAQFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };
  
  const saqTemplates = [
    {
      id: 'eudr-basic',
      name: 'EUDR Basic Assessment',
      description: 'Basic questionnaire for EUDR compliance assessment',
      questions: 12
    },
    {
      id: 'eudr-full',
      name: 'EUDR Comprehensive Assessment',
      description: 'Full assessment for detailed EUDR compliance evaluation',
      questions: 35
    },
    {
      id: 'timber-specific',
      name: 'Timber-Specific Assessment',
      description: 'Specialized assessment for timber supply chains',
      questions: 18
    },
    {
      id: 'palm-oil',
      name: 'Palm Oil Assessment',
      description: 'Specialized assessment for palm oil producers',
      questions: 22
    }
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] modal-transition">
        <DialogHeader>
          <DialogTitle>Send Self-Assessment Questionnaire</DialogTitle>
          <DialogDescription>
            Send an assessment questionnaire to {supplierName} to evaluate their compliance with EUDR regulations.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Questionnaire Template</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {saqTemplates.map((template) => (
                      <Card 
                        key={template.id}
                        className={cn(
                          "cursor-pointer border-2 hover:border-blue-400 transition-colors", 
                          field.value === template.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        )}
                        onClick={() => form.setValue("template", template.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-gray-500">{template.description}</p>
                              <p className="text-xs text-gray-400 mt-1">{template.questions} questions</p>
                            </div>
                            {field.value === template.id && (
                              <CheckCircle className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 6))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Set a deadline for the questionnaire response.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information or instructions for the supplier..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Send Questionnaire</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}