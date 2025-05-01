import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { SupplierList } from '@/components/dashboard/SupplierList';
import { ComplianceChart } from '@/components/dashboard/ComplianceChart';
import { TopLevelMetrics } from '@/components/dashboard/TopLevelMetrics';
import { ComplianceTrendsChart } from '@/components/dashboard/ComplianceTrendsChart';
import { RiskAssessmentCategories } from '@/components/dashboard/RiskAssessmentCategories';
import { useTranslation } from '@/hooks/use-translation';
import { Calendar, Download, Plus, Factory, TrendingUp, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/utils';

export default function Dashboard() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  // Last updated date would typically come from an API
  const lastUpdated = formatDate(new Date());

  // User personas with translations
  const userPersonas = [
    {
      role: 'manufacturer',
      icon: <Factory className="h-8 w-8 text-primary-600" />,
      actions: ['uploadDeclarations', 'viewSupplyChain']
    },
    {
      role: 'trader',
      icon: <TrendingUp className="h-8 w-8 text-primary-600" />,
      actions: ['submitReports', 'verifySuppliers']
    },
    {
      role: 'importer',
      icon: <ShieldCheck className="h-8 w-8 text-primary-600" />,
      actions: ['verifyCompliance', 'submitDocuments']
    },
    {
      role: 'admin',
      icon: <Users className="h-8 w-8 text-primary-600" />,
      actions: ['viewAnalytics', 'manageTeam']
    }
  ];

  return (
    <Layout title={t('dashboard.title')}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
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
        
        {/* User Personas */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.userRoles')}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {userPersonas.map((persona, index) => (
              <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 bg-primary-100 rounded-md p-2">
                      {persona.icon}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{t(`personas.${persona.role}.title`)}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{t(`personas.${persona.role}.description`)}</p>
                  <div className="mt-5 space-y-2">
                    {persona.actions.map((action, actionIndex) => (
                      <Button 
                        key={actionIndex}
                        variant={actionIndex === 0 ? "default" : "outline"}
                        className="w-full justify-center"
                        size="sm"
                      >
                        {t(`personas.${persona.role}.actions.${action}`)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Top Level Metrics */}
        <TopLevelMetrics />
        
        {/* Stats cards */}
        <StatsCards />
        
        {/* Two-column layout for trends and risk assessment */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
          <ComplianceTrendsChart />
          <RiskAssessmentCategories />
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t('recentActivity.title')}
            </h3>
          </div>
          <div className="overflow-hidden">
            <ActivityTimeline />
            
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className="text-sm text-gray-500">
                  {t('recentActivity.showing', { count: 3, total: 25 })}
                </div>
                <div>
                  <a 
                    href="#" 
                    className={cn(
                      "inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    {t('recentActivity.viewAll')}
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
        </div>
        
        {/* Two-column layout for additional content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Suppliers */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
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
          
          {/* Compliance Status */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t('complianceStatus.title')}
              </h3>
            </div>
            <div className="px-4 py-6 sm:px-6">
              <ComplianceChart />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
