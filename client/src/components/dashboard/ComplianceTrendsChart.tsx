import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';

// Sample data based on the screenshot
const data = [
  { month: 'Dec', overallCompliance: 78, supplierCompliance: 85, documentStatus: 82 },
  { month: 'Jan', overallCompliance: 76, supplierCompliance: 79, documentStatus: 83 },
  { month: 'Feb', overallCompliance: 79, supplierCompliance: 82, documentStatus: 87 },
  { month: 'Mar', overallCompliance: 72, supplierCompliance: 75, documentStatus: 79 },
  { month: 'Apr', overallCompliance: 74, supplierCompliance: 77, documentStatus: 80 },
  { month: 'May', overallCompliance: 77, supplierCompliance: 80, documentStatus: 84 },
  { month: 'May', overallCompliance: 71, supplierCompliance: 78, documentStatus: 82 },
];

export const ComplianceTrendsChart: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('6m');
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="px-4 py-3 flex justify-between items-center border-b border-gray-200">
        <CardTitle className="text-base font-medium text-gray-900">
          Compliance Trends
        </CardTitle>
        <div className="flex items-center">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="min-h-8 h-8 text-xs py-0 px-3 border-gray-200">
              <SelectValue placeholder="Time Range">
                <div className="flex items-center text-sm">
                  Last 6 months <ChevronDown className="ml-1 h-4 w-4" />
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last 1 month</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last 1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500"></span>
            <span className="text-sm text-gray-700">Overall Compliance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-gray-700">Supplier Compliance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
            <span className="text-sm text-gray-700">Document Status</span>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSupplier" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDocument" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, '']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{ 
                  borderRadius: '4px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="overallCompliance" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOverall)" 
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={500}
              />
              <Area 
                type="monotone" 
                dataKey="supplierCompliance" 
                stroke="#10B981" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSupplier)" 
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={500}
              />
              <Area 
                type="monotone" 
                dataKey="documentStatus" 
                stroke="#FBBF24" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDocument)" 
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};