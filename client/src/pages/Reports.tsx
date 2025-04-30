import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';

export default function Reports() {
  const { t } = useTranslation();
  
  return (
    <Layout title={t('nav.reports')}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {t('nav.reports')}
        </h2>
        <p className="mt-4 text-gray-500">
          {t('pages.reports.description')}
        </p>
      </div>
    </Layout>
  );
}
