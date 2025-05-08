import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContextV2';
import { X, Menu, LayoutDashboard, Network, ShieldCheck, FileText, Users, Settings, User, LogOut, ClipboardList, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simple logo component
export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="font-bold text-primary-600 text-xl">EUDR Comply</div>
    </div>
  );
};

// Navigation item type
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
  const { logout } = useAuth();
  const { toast } = useToast();

  // Navigation items in the order specified by the reference app
  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: t('nav.dashboard'),
      icon: <LayoutDashboard className={cn('h-4 w-4', isRTL ? 'ml-2.5 rtl-flip' : 'mr-2.5')} />,
    },
    {
      href: '/supply-chain',
      label: t('nav.supplyChain'),
      icon: <Network className={cn('h-4 w-4', isRTL ? 'ml-2.5 rtl-flip' : 'mr-2.5')} />,
      // SAQ Management is now part of Supply Chain page
    },
    {
      href: '/compliance',
      label: t('nav.compliance'),
      icon: <ShieldCheck className={cn('h-4 w-4', isRTL ? 'ml-2.5 rtl-flip' : 'mr-2.5')} />,
      children: [
        {
          href: '/declarations',
          label: t('nav.eudrDeclarations'),
          icon: <FileText className={cn('h-4 w-4', isRTL ? 'ml-2.5 rtl-flip' : 'mr-2.5')} />,
        },
      ]
    },
    {
      href: '/customers',
      label: t('nav.customers'),
      icon: <Users className={cn('h-4 w-4', isRTL ? 'ml-2.5 rtl-flip' : 'mr-2.5')} />,
    },
    {
      href: '/settings',
      label: t('nav.settings'),
      icon: <Settings className={cn('h-4 w-4', isRTL ? 'ml-2.5 rtl-flip' : 'mr-2.5')} />,
    },
    {
      href: '/test-language',
      label: t('test.title') || 'Language Test',
      icon: <Globe className={cn('h-4 w-4', isRTL ? 'ml-2.5 rtl-flip' : 'mr-2.5')} />,
    },
    {
      href: '/test-persona',
      label: t('personaTest.title') || 'Persona Test',
      icon: <User className={cn('h-4 w-4', isRTL ? 'ml-2.5 rtl-flip' : 'mr-2.5')} />,
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

  // Handle logout
  const handleLogout = () => {
    console.log("Logging out...");
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <>
      {/* Mobile menu toggle button - independent of sidebar state */}
      {isMobile && !isOpen && (
        <button
          className="fixed md:hidden top-3 left-3 z-50 p-1.5 bg-white rounded-md shadow-sm"
          onClick={onClose}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
      )}
    
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-200 h-screen overflow-hidden z-40 transition-all duration-300",
        isMobile ? (
          isOpen 
            ? "fixed inset-0 w-full md:w-60"
            : "hidden"
        ) : "fixed w-60 md:block"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <Logo />
            {isMobile && isOpen && onClose && (
              <button 
                onClick={onClose}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
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
                          <div className={cn("absolute inset-y-0 w-1 bg-primary-600", 
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
                                    <div className={cn("absolute inset-y-0 w-1 bg-primary-600", 
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
          <div className="border-t border-gray-200 p-4 mt-auto">
            <div className={cn('flex items-center', isRTL && 'flex-row-reverse')}>
              <div className="flex-shrink-0">
                <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
              </div>
              <div className={cn('ml-3', isRTL && 'mr-3 ml-0 text-right')}>
                <p className="text-sm font-medium text-gray-900">{t('user.name')}</p>
                <p className="text-xs font-medium text-gray-500">{t('user.email')}</p>
              </div>
              <button 
                onClick={handleLogout}
                className={cn('ml-auto flex-shrink-0 bg-white rounded-full p-1 text-gray-400 hover:text-gray-500', isRTL && 'mr-auto ml-0')}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
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