import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface RiskCategory {
  name: string;
  color: string;
  score: number;
  status: 'high' | 'medium' | 'low';
  description: string;
}

export const RiskAssessmentCategories: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  const categories: RiskCategory[] = [
    {
      name: t('riskCategories.environmental'),
      color: '#10B981', // green
      score: 8,
      status: 'medium',
      description: 'Assessment of environmental impact and compliance'
    },
    {
      name: t('riskCategories.social'),
      color: '#3B82F6', // blue
      score: 4,
      status: 'low',
      description: 'Human rights, labor practices, and community impact'
    },
    {
      name: t('riskCategories.governance'),
      color: '#FBBF24', // yellow/amber
      score: 7,
      status: 'medium',
      description: 'Corporate governance, ethics, and transparency'
    },
    {
      name: t('riskCategories.deforestation'),
      color: '#EF4444', // red
      score: 12,
      status: 'high',
      description: 'Specific assessment of deforestation risks'
    }
  ];
  
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-600';
      default:
        return 'bg-gray-400';
    }
  };
  
  const getStatusTextClass = (status: string) => {
    switch (status) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-amber-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {t('riskCategories.title')}
        </h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="bg-white border rounded-md overflow-hidden hover:shadow-md transition-shadow duration-200 flex"
            >
              <div className="w-2.5 flex-shrink-0" style={{ backgroundColor: category.color }}></div>
              <div className="p-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium", 
                    getStatusTextClass(category.status),
                    `bg-opacity-10 ${getStatusColorClass(category.status).replace('bg-', 'bg-')}`
                  )}>
                    {t(`riskCategories.status.${category.status}`)}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{category.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-2xl font-bold mr-1">{category.score}</div>
                    <div className="text-xs text-gray-500">/ 20</div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={getStatusColorClass(category.status)}
                      style={{ width: `${(category.score / 20) * 100}%`, height: '100%', borderRadius: '9999px' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <a href="#" className={cn(
            "text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center",
            isRTL ? "flex-row-reverse" : ""
          )}>
            {t('riskCategories.viewDetailedReport')}
            <ArrowRight className={cn("h-4 w-4", isRTL ? "mr-1 rtl-flip" : "ml-1")} />
          </a>
        </div>
      </div>
    </div>
  );
};