import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { isRTL } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={cn("min-h-screen flex flex-col", isRTL && "rtl")}>
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <main className={cn(
        "flex-1 overflow-x-hidden transition-all duration-300", 
        !isMobile && "md:ml-64",
        isRTL && !isMobile && "md:mr-64 md:ml-0"
      )}>
        <TopBar 
          title={title} 
          toggleSidebar={toggleSidebar} 
        />
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
