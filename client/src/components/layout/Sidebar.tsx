import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';

import {
  LayoutDashboard,
  Network,
  ShieldCheck,
  FileText,
  Users,
  Settings,
  User,
  LogOut
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [location] = useLocation();

  // Navigation items in the order specified by the reference app
  const navItems: NavItem[] = [
    {
      href: '/',
      label: t('nav.dashboard'),
      icon: <LayoutDashboard className={cn('h-5 w-5', isRTL ? 'ml-3 rtl-flip' : 'mr-3')} />,
    },
    {
      href: '/supply-chain',
      label: t('nav.supplyChain'),
      icon: <Network className={cn('h-5 w-5', isRTL ? 'ml-3 rtl-flip' : 'mr-3')} />,
    },
    {
      href: '/compliance',
      label: t('nav.compliance'),
      icon: <ShieldCheck className={cn('h-5 w-5', isRTL ? 'ml-3 rtl-flip' : 'mr-3')} />,
    },
    {
      href: '/declarations',
      label: t('nav.eudrDeclarations'),
      icon: <FileText className={cn('h-5 w-5', isRTL ? 'ml-3 rtl-flip' : 'mr-3')} />,
    },
    {
      href: '/customers',
      label: t('nav.customers'),
      icon: <Users className={cn('h-5 w-5', isRTL ? 'ml-3 rtl-flip' : 'mr-3')} />,
    },
    {
      href: '/settings',
      label: t('nav.settings'),
      icon: <Settings className={cn('h-5 w-5', isRTL ? 'ml-3 rtl-flip' : 'mr-3')} />,
    },
  ];

  return (
    <aside className="bg-white border-r border-gray-200 w-full md:w-64 flex-shrink-0 fixed md:sticky bottom-0 md:top-0 md:h-screen z-30 transition-all duration-300">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812a3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className={cn('ml-3 text-lg font-bold text-gray-900', isRTL && 'mr-3 ml-0')}>{t('app.name')}</h1>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.href} className="relative">
                <Link href={item.href}>
                  <div
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150',
                      location === item.href
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    
                    {/* Active indicator bar */}
                    {location === item.href && (
                      <div className={cn("absolute inset-y-0 w-1 bg-primary-600 rounded-tr-md rounded-br-md", 
                        isRTL ? "right-0" : "left-0")}></div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className={cn('flex items-center', isRTL && 'flex-row-reverse')}>
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <div className={cn('ml-3', isRTL && 'mr-3 ml-0 text-right')}>
              <p className="text-sm font-medium text-gray-900">{t('user.name')}</p>
              <p className="text-xs font-medium text-gray-500">{t('user.email')}</p>
            </div>
            <button className={cn('ml-auto flex-shrink-0 bg-white rounded-full p-1 text-gray-400 hover:text-gray-500', isRTL && 'mr-auto ml-0')}>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};