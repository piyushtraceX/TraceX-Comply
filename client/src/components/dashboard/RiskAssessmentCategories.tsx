import React from 'react';
import { useTranslation } from '@/hooks/use-translation';

interface RiskCategory {
  name: string;
  color: string;
  score: number;
  status: 'high' | 'medium' | 'low';
}

export const RiskAssessmentCategories: React.FC = () => {
  const { t } = useTranslation();
  
  const categories: RiskCategory[] = [
    {
      name: t('riskCategories.environmental'),
      color: '#FBBF24', // yellow
      score: 8,
      status: 'medium'
    },
    {
      name: t('riskCategories.social'),
      color: '#10B981', // green
      score: 4,
      status: 'low'
    },
    {
      name: t('riskCategories.governance'),
      color: '#EF4444', // red
      score: 12,
      status: 'high'
    },
    {
      name: t('riskCategories.deforestation'),
      color: '#3B82F6', // blue
      score: 7,
      status: 'medium'
    }
  ];
  
  const getStatusClass = (status: string) => {
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
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        {t('riskCategories.title')}
      </h3>
      
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="text-sm font-medium text-gray-800">{category.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">{category.score}</span>
              <span className={`text-xs font-medium ${getStatusClass(category.status)}`}>
                {t(`riskCategories.status.${category.status}`)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
          {t('riskCategories.viewDetailedReport')}
        </a>
      </div>
    </div>
  );
};