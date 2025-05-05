import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download, 
  FileText, 
  MessageSquare, 
  Clock, 
  User
} from 'lucide-react';

interface ViewResponseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string;
  supplierName: string;
}

export function ViewResponseForm({ open, onOpenChange, supplierId, supplierName }: ViewResponseFormProps) {
  // Mock data for the SAQ response
  const responseData = {
    id: supplierId,
    supplierName: supplierName,
    completionDate: '2025-04-30',
    dueDate: '2025-05-15',
    status: 'completed',
    completionRate: 100,
    totalQuestions: 35,
    answeredQuestions: 35,
    score: 92,
    riskScore: 'low',
    categories: [
      { name: 'Due Diligence System', score: 95, maxScore: 100 },
      { name: 'Supply Chain Mapping', score: 85, maxScore: 100 },
      { name: 'Risk Assessment', score: 90, maxScore: 100 },
      { name: 'Risk Mitigation', score: 95, maxScore: 100 },
      { name: 'Traceability', score: 92, maxScore: 100 },
    ],
    attachments: [
      { name: 'EUDR Certification.pdf', size: '1.2 MB', date: '2025-04-30' },
      { name: 'Supply Chain Map.xlsx', size: '895 KB', date: '2025-04-30' },
      { name: 'Risk Assessment Report.pdf', size: '2.3 MB', date: '2025-04-29' },
    ],
    comments: [
      { 
        author: 'Jane Doe', 
        role: 'Compliance Officer', 
        text: 'All required documentation has been provided and verified.', 
        date: '2025-05-01' 
      },
      { 
        author: 'John Smith', 
        role: 'Auditor', 
        text: 'Risk assessment methodology is robust and well-documented.', 
        date: '2025-05-02' 
      }
    ]
  };
  
  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High Risk</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low Risk</Badge>;
      default:
        return null;
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };
  
  const getCategoryProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto modal-transition">
        <DialogHeader>
          <DialogTitle className="text-xl">SAQ Response: {supplierName}</DialogTitle>
          <DialogDescription>
            Review the self-assessment questionnaire response from {supplierName}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Summary Card */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{responseData.supplierName}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  ID: {responseData.id}
                </Badge>
                {getRiskBadge(responseData.riskScore)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold ${getScoreColor(responseData.score)}`}>
                {responseData.score}%
              </span>
              <Button variant="outline" size="sm" className="gap-1 transition-all duration-200">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <p className="text-lg font-semibold capitalize mt-1">
                {responseData.status}
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Questions</span>
              </div>
              <p className="text-lg font-semibold mt-1">
                {responseData.answeredQuestions} / {responseData.totalQuestions}
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium">Completion Date</span>
              </div>
              <p className="text-lg font-semibold mt-1">
                {responseData.completionDate}
              </p>
            </div>
          </div>
          
          {/* Tabs */}
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories" className="space-y-4">
              {responseData.categories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm">{category.score}/{category.maxScore}</span>
                  </div>
                  <Progress 
                    value={(category.score / category.maxScore) * 100} 
                    className={`h-2 ${getCategoryProgressColor(category.score)}`}
                  />
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="attachments" className="space-y-2">
              {responseData.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{attachment.name}</p>
                      <p className="text-xs text-gray-500">
                        {attachment.size} • Uploaded on {attachment.date}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="comments" className="space-y-4">
              {responseData.comments.map((comment, index) => (
                <div key={index} className="p-3 border rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">{comment.author}</p>
                      <p className="text-xs text-gray-500">{comment.role} • {comment.date}</p>
                    </div>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
              ))}
              
              <div className="pt-3">
                <Button variant="outline" className="w-full gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Add Comment
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}