import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Simplified version that doesn't rely on Recharts
export const ComplianceTrendsChart: React.FC = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = React.useState('6m');

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium text-gray-900">
            Compliance Trends
          </CardTitle>
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px] h-7 text-xs py-0 px-3 border-gray-200">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="h-72 flex items-center justify-center">
          <div className="flex flex-col space-y-6 w-full">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Compliance</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Supplier Compliance</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Document Status</span>
                <span className="text-sm font-medium">84%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-4">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
            
            <div className="text-xs text-gray-500 text-center italic mt-2">
              Displaying last 6 months compliance trends
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};