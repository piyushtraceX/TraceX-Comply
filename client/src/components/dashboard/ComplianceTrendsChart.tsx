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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const data = [
  { month: 'Jan', overallCompliance: 65, supplierCompliance: 60, documentStatus: 70 },
  { month: 'Feb', overallCompliance: 68, supplierCompliance: 62, documentStatus: 73 },
  { month: 'Mar', overallCompliance: 70, supplierCompliance: 65, documentStatus: 75 },
  { month: 'Apr', overallCompliance: 72, supplierCompliance: 69, documentStatus: 77 },
  { month: 'May', overallCompliance: 75, supplierCompliance: 72, documentStatus: 80 },
  { month: 'Jun', overallCompliance: 78, supplierCompliance: 75, documentStatus: 84 },
];

export const ComplianceTrendsChart: React.FC = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = React.useState('6m');

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          {t('charts.complianceTrends')}
        </h3>
        <Select defaultValue={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('charts.selectTimeRange')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">{t('charts.timeRanges.oneMonth')}</SelectItem>
            <SelectItem value="3m">{t('charts.timeRanges.threeMonths')}</SelectItem>
            <SelectItem value="6m">{t('charts.timeRanges.sixMonths')}</SelectItem>
            <SelectItem value="1y">{t('charts.timeRanges.oneYear')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="overallCompliance" 
              name={t('charts.series.overallCompliance')}
              stackId="1" 
              stroke="#3B82F6" 
              fill="#3B82F6" 
              fillOpacity={0.3} 
            />
            <Area 
              type="monotone" 
              dataKey="supplierCompliance" 
              name={t('charts.series.supplierCompliance')}
              stackId="2" 
              stroke="#10B981" 
              fill="#10B981" 
              fillOpacity={0.3} 
            />
            <Area 
              type="monotone" 
              dataKey="documentStatus" 
              name={t('charts.series.documentStatus')}
              stackId="3" 
              stroke="#FBBF24" 
              fill="#FBBF24" 
              fillOpacity={0.3} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};