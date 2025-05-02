import React from 'react';
import { Clock, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/use-translation';
import { Progress } from '@/components/ui/progress';

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  progress?: number;
  progressColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor,
  iconColor,
  progress,
  progressColor,
}) => {
  const { isRTL } = useLanguage();

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-4 sm:p-5">
        <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
          <div className={cn(`flex-shrink-0 ${iconBgColor} rounded-md p-2.5`)}>
            {React.cloneElement(icon as React.ReactElement, { className: 'h-5 w-5' })}
          </div>
          <div className={cn("ml-5 w-0 flex-1", isRTL && "mr-5 ml-0 text-right")}>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-xl font-medium text-gray-900">{value}</div>
              <div className="mt-0.5 text-xs text-gray-500">{subtitle}</div>
              
              {progress !== undefined && (
                <Progress 
                  value={progress} 
                  className={`h-2 mt-2 ${progressColor ? `[&>div]:${progressColor}` : ''}`}
                />
              )}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TopLevelMetrics: React.FC = () => {
  const { t } = useTranslation();

  const metrics = [
    {
      title: t('metrics.overallCompliance'),
      value: <div className="flex items-center">78% <TrendingUp className="h-4 w-4 ml-2 text-green-500" /></div>,
      subtitle: t('metrics.lastUpdated', { time: '2 hours ago' }),
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      progress: 78,
      progressColor: 'bg-blue-600'
    },
    {
      title: t('metrics.riskLevel'),
      value: '17, Medium',
      subtitle: t('metrics.highRiskItems', { count: 3 }),
      icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
      iconBgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      progress: 65,
      progressColor: 'bg-amber-600'
    },
    {
      title: t('metrics.documentStatus'),
      value: '84/100',
      subtitle: t('metrics.missingItems', { count: 8 }),
      icon: <Clock className="h-6 w-6 text-red-600" />,
      iconBgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      progress: 84,
      progressColor: 'bg-red-600'
    },
    {
      title: t('metrics.supplierSummary'),
      value: '58',
      subtitle: t('metrics.activeSuppliers', { count: 42 }),
      icon: <Users className="h-6 w-6 text-green-600" />,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      progress: 72,
      progressColor: 'bg-green-600'
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};