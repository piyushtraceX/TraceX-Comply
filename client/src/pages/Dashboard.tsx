import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { SupplierList } from '@/components/dashboard/SupplierList';
import { TopLevelMetrics } from '@/components/dashboard/TopLevelMetrics';
import { ComplianceTrendsChart } from '@/components/dashboard/ComplianceTrendsChart';
import { RiskAssessmentCategories } from '@/components/dashboard/RiskAssessmentCategories';
import { useTranslation } from '@/hooks/use-translation';
import { Calendar, Download, Plus, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/utils';

export default function Dashboard() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  // Last updated date would typically come from an API
  const lastUpdated = formatDate(new Date());

  return (
    <Layout title={t('dashboard.title')}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold leading-7 text-gray-900 sm:text-2xl sm:truncate">
              {t('dashboard.title')}
            </h2>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className={cn("mt-2 flex items-center text-sm text-gray-500", isRTL && "flex-row-reverse sm:space-x-reverse")}>
                <Calendar className={cn("flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400", isRTL && "ml-1.5 mr-0")} />
                <span>{t('dashboard.lastUpdated', { date: lastUpdated })}</span>
              </div>
            </div>
          </div>
          <div className={cn("mt-4 flex md:mt-0 md:ml-4", isRTL && "flex-row-reverse md:mr-4 md:ml-0")}>
            <Button variant="outline" className={cn("flex items-center", isRTL && "flex-row-reverse")}>
              <Download className={cn("-ml-1 mr-2 h-5 w-5 text-gray-500", isRTL && "-mr-1 ml-2")} />
              {t('dashboard.exportBtn')}
            </Button>
            <Button className={cn("ml-3 flex items-center", isRTL && "mr-3 ml-0 flex-row-reverse")}>
              <Plus className={cn("-ml-1 mr-2 h-5 w-5", isRTL && "-mr-1 ml-2")} />
              {t('dashboard.newDeclarationBtn')}
            </Button>
          </div>
        </div>
        
        {/* Top Level Metrics */}
        <TopLevelMetrics />
        
        {/* Stats cards */}
        <StatsCards />
        
        {/* Two-column layout for trends and risk assessment */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
          <ComplianceTrendsChart />
          <RiskAssessmentCategories />
        </div>
        
        {/* Supplier Compliance Status */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Supplier Compliance Status
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Compliance</span>
                  <span className="text-sm font-medium text-gray-700">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Tier 1 Suppliers</span>
                    <span className="text-sm font-medium text-gray-700">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Tier 2 Suppliers</span>
                    <span className="text-sm font-medium text-gray-700">64%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Tier 3 Suppliers</span>
                    <span className="text-sm font-medium text-gray-700">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Compliance by Product Category
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Cocoa</span>
                    <span className="text-sm font-medium text-gray-700">88%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Palm Oil</span>
                    <span className="text-sm font-medium text-gray-700">76%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '76%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Coffee</span>
                    <span className="text-sm font-medium text-gray-700">62%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Timber</span>
                    <span className="text-sm font-medium text-gray-700">54%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '54%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Rubber</span>
                    <span className="text-sm font-medium text-gray-700">39%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '39%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Three-column layout for additional content */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Suppliers */}
          <div className="bg-white shadow rounded-lg md:col-span-1">
            <div className="px-4 py-3 border-b border-gray-200 sm:px-6">
              <h3 className="text-base font-medium text-gray-900">
                {t('recentSuppliers.title')}
              </h3>
            </div>
            <div className="overflow-hidden">
              <SupplierList />
              
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="flex items-center justify-center">
                  <a 
                    href="#" 
                    className={cn(
                      "inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    {t('recentSuppliers.viewAll')}
                    {isRTL ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5 text-gray-400 rtl-flip" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activities */}
          <div className="bg-white shadow rounded-lg md:col-span-1">
            <div className="px-4 py-3 border-b border-gray-200 sm:px-6">
              <h3 className="text-base font-medium text-gray-900">
                Recent Activities
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <li key={item} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        EUDR Declaration Updated
                      </p>
                      <p className="text-sm text-gray-500">
                        By Jane Cooper • 2 hours ago
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 px-4 py-4 sm:px-6 text-center">
              <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all activities
              </a>
            </div>
          </div>
          
          {/* Upcoming Tasks */}
          <div className="bg-white shadow rounded-lg md:col-span-2 lg:col-span-1">
            <div className="px-4 py-3 border-b border-gray-200 sm:px-6">
              <h3 className="text-base font-medium text-gray-900">
                Upcoming Tasks
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {[1, 2, 3, 4].map((item) => (
                <li key={item} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Review compliance documentation
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Due in 3 days
                      </p>
                    </div>
                    <div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Medium
                      </Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center">
              <span className="text-sm text-gray-500">4 of 12 tasks</span>
              <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all tasks
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
