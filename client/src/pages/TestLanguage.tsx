import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestLanguage() {
  const { language, toggleLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();

  return (
    <Layout title={t('test.title')}>
      <div className="container mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('test.languageTest')}</span>
              <span className="text-sm font-normal text-gray-500">
                {language === 'en' ? 'English' : 'German'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{t('test.currentLanguage')}</h3>
                <p className="text-gray-600">{language.toUpperCase()}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">{t('test.translatedTexts')}</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>{t('dashboard.title')}</li>
                  <li>{t('nav.dashboard')}</li>
                  <li>{t('nav.supplyChain')}</li>
                  <li>{t('nav.compliance')}</li>
                  <li>{t('nav.settings')}</li>
                </ul>
              </div>
              
              <div className="pt-4">
                <Button onClick={toggleLanguage} className="w-full">
                  {t('test.toggleLanguage')}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  {t('test.toggleDescription')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('test.directionTest')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{t('test.currentDirection')}</h3>
                <p className="text-gray-600">{isRTL ? 'RTL' : 'LTR'}</p>
              </div>
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                <div className="w-8 h-8 bg-red-500 rounded-full"></div>
              </div>
              
              <p className="text-xs text-gray-500">
                {t('test.directionDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}