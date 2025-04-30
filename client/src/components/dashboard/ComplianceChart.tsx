import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface ComplianceData {
  name: string;
  value: number;
  color: string;
  count: number;
}

export const ComplianceChart: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  // Compliance data
  const data: ComplianceData[] = [
    {
      name: t('complianceStatus.compliant'),
      value: 68,
      color: '#10b981', // green-500
      count: 97,
    },
    {
      name: t('complianceStatus.pending'),
      value: 22,
      color: '#f59e0b', // amber-500
      count: 31,
    },
    {
      name: t('complianceStatus.nonCompliant'),
      value: 10,
      color: '#ef4444', // red-500
      count: 15,
    },
  ];

  return (
    <div className="relative" style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout={isRTL ? "vertical" : "horizontal"}
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis
            dataKey="name"
            type="category"
            hide={isRTL}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            hide={!isRTL}
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            mirror={isRTL}
          />
          <Tooltip 
            formatter={(value) => [`${value}%`, t('complianceStatus.percentage')]}
            labelFormatter={(name) => name as string}
          />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            barSize={60}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6">
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.name} className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                <span
                  className={cn("w-3 h-3 rounded-full mr-2.5", isRTL && "ml-2.5 mr-0")}
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <span className="text-sm font-medium text-gray-900">{t('complianceStatus.totalLegend')}</span>
          <span className="text-sm font-medium text-gray-900">143</span>
        </div>
        <div className={cn("mt-4", isRTL && "text-right")}>
          <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            {t('complianceStatus.detailedReport')} {isRTL ? '←' : '→'}
          </a>
        </div>
      </div>
    </div>
  );
};
