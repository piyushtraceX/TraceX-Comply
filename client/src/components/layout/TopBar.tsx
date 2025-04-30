import React, { useState } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title: string;
  toggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, toggleSidebar }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className={cn('flex items-center justify-between px-4 py-3 sm:px-6', isRTL && 'flex-row-reverse')}>
        {/* Mobile menu button */}
        <button 
          type="button" 
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Page title (visible on mobile only) */}
        <h1 className="text-lg font-semibold text-gray-900 md:hidden">{title}</h1>
        
        {/* Search */}
        <div className={cn('hidden md:flex md:flex-1 md:items-center', isRTL && 'md:justify-end')}>
          <div className="relative max-w-md w-full">
            <div className={cn('absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none', isRTL && 'left-auto right-0 pl-0 pr-3')}>
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              className={cn(
                'block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm',
                isRTL && 'pl-3 pr-10 text-right'
              )} 
              placeholder={t('search.placeholder')}
            />
          </div>
        </div>
        
        {/* Right navigation */}
        <div className={cn('flex items-center space-x-4', isRTL && 'flex-row-reverse space-x-0 space-x-reverse')}>
          {/* Notifications */}
          <button type="button" className="p-1 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 relative">
            <span className="sr-only">{t('notifications.label')}</span>
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          
          {/* Language switcher */}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
