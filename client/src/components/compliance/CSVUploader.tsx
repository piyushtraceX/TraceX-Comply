import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FileUpload, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface CSVData {
  headers: string[];
  rows: string[][];
}

interface CSVUploaderProps {
  onDataLoaded: (data: CSVData) => void;
  allowedExtensions?: string[];
  maxFileSize?: number; // in bytes
  className?: string;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({
  onDataLoaded,
  allowedExtensions = ['.csv'],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  className,
}) => {
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV data from text
  const parseCSV = (text: string): CSVData => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Handle different delimiters (comma or semicolon)
    const delimiter = lines[0].includes(';') ? ';' : ',';
    
    const headers = lines[0].split(delimiter).map(header => header.trim());
    const rows = lines.slice(1).map(line => 
      line.split(delimiter).map(cell => cell.trim())
    );
    
    return { headers, rows };
  };

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    
    // Validate file extension
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!allowedExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file format",
        description: `Please upload a file with one of these extensions: ${allowedExtensions.join(', ')}`,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `File size should not exceed ${maxFileSize / (1024 * 1024)}MB`,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Read and parse file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        
        // Validate data
        if (data.headers.length === 0 || data.rows.length === 0) {
          throw new Error("CSV file is empty or has no valid data");
        }
        
        onDataLoaded(data);
        toast({
          title: "File Uploaded Successfully",
          description: `${file.name} has been processed with ${data.rows.length} rows of data.`,
        });
      } catch (error) {
        toast({
          title: "Error parsing CSV",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "There was an error reading the file. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  }, [allowedExtensions, maxFileSize, onDataLoaded, toast]);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle browse click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={allowedExtensions.join(',')} 
        onChange={handleInputChange}
      />
      
      {/* Drag & Drop Area */}
      <div 
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-primary-500'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        tabIndex={0}
        role="button"
        aria-label="Upload CSV file"
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadCloud className="h-12 w-12 text-gray-400" />
          
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-900">
              {isLoading ? 'Processing...' : 
                fileName ? `File: ${fileName}` : 
                'Drag and drop your CSV file here, or click to browse'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {`Supported formats: ${allowedExtensions.join(', ')} (Max size: ${maxFileSize / (1024 * 1024)}MB)`}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className={cn("mt-2", isRTL && "flex-row-reverse")}
            disabled={isLoading}
          >
            <FileUpload className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            Browse Files
          </Button>
        </div>
      </div>
    </div>
  );
};

// Table component to display CSV data
interface CSVTableProps {
  data: CSVData;
  className?: string;
}

export const CSVTable: React.FC<CSVTableProps> = ({ data, className }) => {
  const { headers, rows } = data;
  
  // Function to determine risk level color based on value
  const getRiskColor = (value: string): string => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      // Check for text indicators
      const lowerValue = value.toLowerCase();
      if (lowerValue.includes('high') || lowerValue.includes('critical')) return 'text-red-600';
      if (lowerValue.includes('medium')) return 'text-yellow-600';
      if (lowerValue.includes('low')) return 'text-green-600';
      return '';
    }
    
    // Numerical indicators
    if (numValue > 75) return 'text-red-600';
    if (numValue > 50) return 'text-yellow-600';
    if (numValue > 25) return 'text-green-600';
    return '';
  };

  // Function to determine if a cell should be highlighted
  const shouldHighlight = (header: string, value: string): boolean => {
    const lowerHeader = header.toLowerCase();
    return lowerHeader.includes('risk') || 
           lowerHeader.includes('compliance') || 
           lowerHeader.includes('score');
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th 
                key={`header-${index}`}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="hover:bg-gray-50">
              {row.map((cell, cellIndex) => {
                const header = headers[cellIndex] || '';
                const highlight = shouldHighlight(header, cell);
                
                return (
                  <td 
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className={cn(
                      'px-6 py-4 whitespace-nowrap text-sm',
                      highlight ? getRiskColor(cell) : 'text-gray-500',
                      highlight && 'font-medium'
                    )}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};