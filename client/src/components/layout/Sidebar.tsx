import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Logo } from '@/components/ui/logo';
import { useIsMobile } from '@/hooks/use-mobile';
import { X } from 'lucide-react';

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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen = false,
  onClose
}) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [location] = useLocation();
  const isMobile = useIsMobile();

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
      children: [
        {
          href: '/saq-management',
          label: t('nav.saqManagement') || 'SAQ Management',
          icon: <ClipboardList className={cn('h-5 w-5', isRTL ? 'ml-3 rtl-flip' : 'mr-3')} />,
        },
      ]
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

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile && isOpen && onClose) {
      onClose();
    }
  }, [location, isMobile, isOpen, onClose]);

  // Close mobile menu on window resize (switching to desktop)
  useEffect(() => {
    const handleResize = () => {
      if (!isMobile && isOpen && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile, isOpen, onClose]);

  return (
    <>
      <aside className={cn(
        "bg-white border-r border-gray-200 md:w-64 flex-shrink-0 fixed md:sticky md:top-0 md:h-screen z-40 transition-all duration-300",
        isMobile ? (
          isOpen 
            ? "top-0 left-0 right-0 bottom-0 h-screen w-full"
            : "hidden md:block"
        ) : "w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo and close button on mobile */}
          <div className="px-6 py-6 border-b border-gray-200 flex items-center justify-between">
            <Logo />
            {isMobile && isOpen && (
              <button 
                onClick={onClose}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                // Check if this item is active or has an active child
                const hasActiveChild = item.children?.some(
                  child => location === child.href || location.startsWith(child.href + '/')
                );
                const isActive = location === item.href || location.startsWith(item.href + '/') || hasActiveChild;
                
                return (
                  <li key={item.href} className="relative">
                    <Link href={item.href}>
                      <div
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150',
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                          item.children && 'mb-1',  
                          isRTL && 'flex-row-reverse'
                        )}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className={cn("absolute inset-y-0 w-1 bg-primary-600 rounded-tr-md rounded-br-md", 
                            isRTL ? "right-0" : "left-0")}></div>
                        )}
                      </div>
                    </Link>
                    
                    {/* Render children if they exist */}
                    {item.children && item.children.length > 0 && (
                      <ul className="mt-1 pl-6 space-y-1">
                        {item.children.map((child) => {
                          // Check if this is the current location OR if it's a parent of current location
                          const isActive = location === child.href || location.startsWith(child.href + '/');
                          
                          return (
                            <li key={child.href} className="relative">
                              <Link href={child.href}>
                                <div
                                  className={cn(
                                    'flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150',
                                    isActive
                                      ? 'bg-primary-50 text-primary-700'
                                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                                    isRTL && 'flex-row-reverse'
                                  )}
                                >
                                  {child.icon}
                                  <span>{child.label}</span>
                                  
                                  {/* Active indicator bar */}
                                  {isActive && (
                                    <div className={cn("absolute inset-y-0 w-1 bg-primary-600 rounded-tr-md rounded-br-md", 
                                      isRTL ? "right-0" : "left-0")}></div>
                                  )}
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
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
      
      {/* Overlay for mobile menu */}
      {isMobile && isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}
    </>
  );
};