import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users,
  AlertOctagon,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  changeColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBgColor,
  iconColor,
  changeColor,
}) => {
  const { isRTL } = useLanguage();

  let changeIcon = <Minus className="h-5 w-5 flex-shrink-0 self-center" />;
  if (change > 0) {
    changeIcon = <TrendingUp className="h-5 w-5 flex-shrink-0 self-center" />;
  } else if (change < 0) {
    changeIcon = <TrendingDown className="h-5 w-5 flex-shrink-0 self-center" />;
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
          <div className={cn(`flex-shrink-0 ${iconBgColor} rounded-md p-3`)}>
            {icon}
          </div>
          <div className={cn("ml-5 w-0 flex-1", isRTL && "mr-5 ml-0 text-right")}>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className={cn("flex items-baseline", isRTL && "flex-row-reverse justify-end")}>
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {change !== 0 && (
                <div className={cn(`ml-2 flex items-baseline text-sm font-semibold ${changeColor}`, isRTL && "mr-2 ml-0")}>
                  {changeIcon}
                  <span className="sr-only">{change > 0 ? 'Increased by' : change < 0 ? 'Decreased by' : 'No change'}</span>
                  {Math.abs(change)}%
                </div>
              )}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StatsCards: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('stats.totalDeclarations'),
      value: 143,
      change: 12,
      icon: <FileText className="h-6 w-6 text-primary-600" />,
      iconBgColor: 'bg-primary-100',
      iconColor: 'text-primary-600',
      changeColor: 'text-green-600',
    },
    {
      title: t('stats.compliantProducts'),
      value: 97,
      change: 8,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      changeColor: 'text-green-600',
    },
    {
      title: t('stats.pendingReview'),
      value: 31,
      change: 0,
      icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
      iconBgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      changeColor: 'text-amber-600',
    },
    {
      title: t('stats.nonCompliant'),
      value: 15,
      change: -5,
      icon: <AlertCircle className="h-6 w-6 text-red-600" />,
      iconBgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      changeColor: 'text-red-600',
    },
    {
      title: t('stats.totalSuppliers'),
      value: 58,
      change: 7,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      changeColor: 'text-green-600',
    },
    {
      title: t('stats.highRiskSuppliers'),
      value: 12,
      change: -3,
      icon: <AlertOctagon className="h-6 w-6 text-orange-600" />,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      changeColor: 'text-green-600',
    },
    {
      title: t('stats.pendingDeclarations'),
      value: 26,
      change: 5,
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      changeColor: 'text-red-600',
    },
  ];

  // We'll display them in two rows for better layout
  const firstRowStats = stats.slice(0, 4);
  const secondRowStats = stats.slice(4);

  return (
    <div className="space-y-6 mb-6">
      {/* First row - 4 original stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {firstRowStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      
      {/* Second row - 3 new metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {secondRowStats.map((stat, index) => (
          <StatCard key={index + 4} {...stat} />
        ))}
      </div>
    </div>
  );
};
