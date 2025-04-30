import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';

export default function Settings() {
  const { t } = useTranslation();
  
  return (
    <Layout title={t('nav.settings')}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {t('nav.settings')}
        </h2>
        <p className="mt-4 text-gray-500">
          {t('pages.settings.description')}
        </p>
      </div>
    </Layout>
  );
}
