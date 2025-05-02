import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PersonaSwitcher } from '@/components/PersonaSwitcher';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  title: string;
  toggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, toggleSidebar }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className={cn('flex items-center justify-between px-4 py-3 sm:px-6', isRTL && 'flex-row-reverse')}>
        {/* Left side: Page title and optionally mobile menu button */}
        <div className={cn('flex items-center', isRTL && 'flex-row-reverse')}>
          {/* Mobile menu button - only visible on mobile */}
          {toggleSidebar && (
            <button 
              type="button" 
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors mr-3"
              onClick={toggleSidebar}
              aria-label="Open sidebar menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          
          {/* Page title */}
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        
        {/* Search - hidden on mobile */}
        <div className={cn('hidden md:flex md:flex-1 md:items-center md:max-w-md mx-4', isRTL && 'md:justify-end')}>
          <div className="relative w-full">
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
        <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
          {/* Persona Switcher - hidden on mobile */}
          <div className="hidden md:block">
            {/* Conditionally render PersonaSwitcher to handle potential errors */}
            <React.Suspense fallback={<Button variant="outline" className="flex items-center gap-2 h-9">Administrator</Button>}>
              <PersonaSwitcher />
            </React.Suspense>
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <span className="sr-only">{t('notifications.label')}</span>
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </Button>
          
          {/* Language switcher - more prominent */}
          <div className="relative px-1">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};
