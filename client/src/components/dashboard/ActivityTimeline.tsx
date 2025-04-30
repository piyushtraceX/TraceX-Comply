import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { formatDate } from '@/lib/utils';
import { FileText, Bell, X, Tag, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface Activity {
  id: number;
  title: string;
  product: string;
  status: 'compliant' | 'pending' | 'non-compliant';
  category: string;
  date: string;
  icon: React.ReactNode;
  iconBgColor: string;
}

export const ActivityTimeline: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  // Sample data for the activity timeline
  const activities: Activity[] = [
    {
      id: 1,
      title: t('activity.title', { id: '18-2023', action: 'submitted' }),
      product: t('activity.product', { product: 'Palm Oil', supplier: 'PT Sustainable Oils' }),
      status: 'compliant',
      category: t('activity.category', { category: 'Agriculture' }),
      date: formatDate('2023-04-14'),
      icon: <FileText className="h-6 w-6 text-primary-600" />,
      iconBgColor: 'bg-primary-100',
    },
    {
      id: 2,
      title: t('activity.documentRequested'),
      product: t('activity.product', { product: 'Cocoa', supplier: 'Ghana Cocoa Board' }),
      status: 'pending',
      category: t('activity.category', { category: 'Agriculture' }),
      date: formatDate('2023-04-13'),
      icon: <Bell className="h-6 w-6 text-amber-600" />,
      iconBgColor: 'bg-amber-100',
    },
    {
      id: 3,
      title: t('activity.title', { id: '16-2023', action: 'rejected' }),
      product: t('activity.product', { product: 'Timber', supplier: 'Amazon Timber Ltd' }),
      status: 'non-compliant',
      category: t('activity.category', { category: 'Forestry' }),
      date: formatDate('2023-04-12'),
      icon: <X className="h-6 w-6 text-red-600" />,
      iconBgColor: 'bg-red-100',
    },
  ];

  // Status badge color mapping
  const getStatusClasses = (status: string): string => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'non-compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ul className="divide-y divide-gray-200">
      {activities.map((activity) => (
        <li key={activity.id}>
          <div className="px-4 py-4 sm:px-6">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                <div className="flex-shrink-0">
                  <span className={cn(`h-10 w-10 rounded-full ${activity.iconBgColor} flex items-center justify-center`)}>
                    {activity.icon}
                  </span>
                </div>
                <div className={cn("ml-4", isRTL && "mr-4 ml-0 text-right")}>
                  <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                  <div className="text-sm text-gray-500">{activity.product}</div>
                </div>
              </div>
              <div className={cn("ml-2 flex-shrink-0 flex", isRTL && "mr-2 ml-0")}>
                <span className={cn(`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(activity.status)}`)}>
                  {t(`status.${activity.status}`)}
                </span>
              </div>
            </div>
            <div className={cn("mt-2 sm:flex sm:justify-between", isRTL && "flex-row-reverse")}>
              <div className="sm:flex">
                <div className={cn("mt-2 flex items-center text-sm text-gray-500 sm:mt-0", isRTL && "flex-row-reverse")}>
                  <Tag className={cn("flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400", isRTL && "ml-1.5 mr-0")} />
                  <span>{activity.category}</span>
                </div>
              </div>
              <div className={cn("mt-2 flex items-center text-sm text-gray-500 sm:mt-0", isRTL && "flex-row-reverse")}>
                <Calendar className={cn("flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400", isRTL && "ml-1.5 mr-0")} />
                <span>{activity.date}</span>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
