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
  progress?: number;
  progressColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBgColor,
  iconColor,
  changeColor,
  progress,
  progressColor,
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
            <dd>
              <div className={cn("flex items-baseline", isRTL && "flex-row-reverse justify-end")}>
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change !== 0 && (
                  <div className={cn(`ml-2 flex items-baseline text-sm font-semibold ${changeColor}`, isRTL && "mr-2 ml-0")}>
                    {changeIcon}
                    <span className="sr-only">{change > 0 ? 'Increased by' : change < 0 ? 'Decreased by' : 'No change'}</span>
                    {Math.abs(change)}%
                  </div>
                )}
              </div>
              
              {progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${progressColor || 'bg-primary-600'}`} 
                    style={{ width: `${progress}%` }}
                  ></div>
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

  // Sample data for stats cards
  const statCards = [
    {
      title: t('stats.totalDeclarations'),
      value: 142,
      change: 12,
      icon: <FileText className="h-6 w-6 text-white" />,
      iconBgColor: 'bg-primary-600',
      iconColor: 'text-white',
      changeColor: 'text-green-600',
      progress: 85,
      progressColor: 'bg-primary-600'
    },
    {
      title: t('stats.completedAssessments'),
      value: 78,
      change: 5,
      icon: <CheckCircle className="h-6 w-6 text-white" />,
      iconBgColor: 'bg-green-600',
      iconColor: 'text-white',
      changeColor: 'text-green-600',
      progress: 78,
      progressColor: 'bg-green-600'
    },
    {
      title: t('stats.pendingReviews'),
      value: 23,
      change: -8,
      icon: <Clock className="h-6 w-6 text-white" />,
      iconBgColor: 'bg-amber-500',
      iconColor: 'text-white',
      changeColor: 'text-amber-500',
      progress: 62,
      progressColor: 'bg-amber-500'
    },
    {
      title: t('stats.complianceIssues'),
      value: 6,
      change: -15,
      icon: <AlertTriangle className="h-6 w-6 text-white" />,
      iconBgColor: 'bg-red-600',
      iconColor: 'text-white',
      changeColor: 'text-green-600',
      progress: 35,
      progressColor: 'bg-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {statCards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
};
