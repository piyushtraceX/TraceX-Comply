import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Match the design in the screenshot
export const RiskAssessmentCategories: React.FC = () => {
  const { isRTL } = useLanguage();
  
  // Based on the screenshot data
  const categories = [
    {
      name: 'Environmental',
      percentage: 68,
      color: '#FBBF24', // yellow/amber
      dot: <span className="h-3 w-3 rounded-full bg-amber-400"></span>,
      bar: <div className="bg-amber-400 h-2 rounded-full" style={{ width: '68%' }}></div>
    },
    {
      name: 'Social',
      percentage: 82,
      color: '#10B981', // green
      dot: <span className="h-3 w-3 rounded-full bg-green-500"></span>,
      bar: <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
    },
    {
      name: 'Governance',
      percentage: 59,
      color: '#EF4444', // red
      dot: <span className="h-3 w-3 rounded-full bg-red-500"></span>,
      bar: <div className="bg-red-500 h-2 rounded-full" style={{ width: '59%' }}></div>
    },
    {
      name: 'Deforestation',
      percentage: 76,
      color: '#3B82F6', // blue
      dot: <span className="h-3 w-3 rounded-full bg-blue-500"></span>,
      bar: <div className="bg-blue-500 h-2 rounded-full" style={{ width: '76%' }}></div>
    }
  ];
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="px-4 py-3 flex justify-between items-center border-b border-gray-200">
        <CardTitle className="text-base font-medium text-gray-900">
          Risk Assessment
        </CardTitle>
        <div className="flex items-center">
          <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
            View All
          </a>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-32">
              {category.dot}
              <span className="text-sm font-medium text-gray-700">{category.name}</span>
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-100 rounded-full h-2">
                {category.bar}
              </div>
            </div>
            <div className="w-12 text-sm font-medium text-right text-gray-700">
              {category.percentage}%
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};