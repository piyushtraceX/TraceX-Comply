import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';

export default function Declarations() {
  const { t } = useTranslation();
  
  return (
    <Layout title={t('nav.declarations')}>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {t('nav.declarations')}
        </h2>
        <p className="mt-4 text-gray-500">
          {t('pages.declarations.description')}
        </p>
      </div>
    </Layout>
  );
}
