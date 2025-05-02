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
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-3 border-b border-gray-200 sm:px-6">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium text-gray-900">
            {t('charts.complianceTrends')}
          </h3>
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px] h-7 text-xs py-0 px-3 border-gray-200">
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
      </div>
      
      <div className="p-5">
        <div className="h-72">
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
    </div>
  );
};