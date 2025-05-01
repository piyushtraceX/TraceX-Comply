import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Logo } from '@/components/ui/logo';

import {
  LayoutDashboard,
  Network,
  ShieldCheck,
  FileText,
  Users,
  Settings,
  User,
  LogOut,
  ClipboardList
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
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
      children: [
        {
          href: '/declarations',
          label: t('nav.eudrDeclarations'),
          icon: <FileText className={cn('h-5 w-5', isRTL ? 'ml-3 rtl-flip' : 'mr-3')} />,
        },
        {
          href: '/saq-management',
          label: t('nav.saqManagement') || 'SAQ Management',
          icon: <ClipboardList className={cn('h-5 w-5', isRTL ? 'ml-3 rtl-flip' : 'mr-3')} />,
        },
      ]
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
          <Logo />
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
                      item.children && 'mb-1',  
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
                
                {/* Render children if they exist */}
                {item.children && item.children.length > 0 && (
                  <ul className="mt-1 pl-6 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.href} className="relative">
                        <Link href={child.href}>
                          <div
                            className={cn(
                              'flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150',
                              location === child.href
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                              isRTL && 'flex-row-reverse'
                            )}
                          >
                            {child.icon}
                            <span>{child.label}</span>
                            
                            {/* Active indicator bar */}
                            {location === child.href && (
                              <div className={cn("absolute inset-y-0 w-1 bg-primary-600 rounded-tr-md rounded-br-md", 
                                isRTL ? "right-0" : "left-0")}></div>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
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