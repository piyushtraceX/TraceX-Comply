import React, { useState, useEffect } from 'react';
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Debug mounting of the Layout component
  useEffect(() => {
    console.log("Layout component mounted with title:", title);
    setIsLoaded(true);
    
    // Log when layout components are ready
    return () => {
      console.log("Layout component unmounted");
    };
  }, [title]);

  const toggleSidebar = () => {
    console.log("Toggling sidebar, current state:", isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Simple loading indicator while the layout is preparing
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading layout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex bg-gray-100", isRTL && "rtl")}>
      <Sidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300", 
        !isMobile && "md:ml-60",
        isRTL && !isMobile && "md:mr-60 md:ml-0"
      )}>
        <TopBar 
          title={title} 
          toggleSidebar={toggleSidebar} 
        />
        <main className="flex-1 overflow-x-hidden p-3 sm:p-4 md:p-4 mx-auto w-full max-w-[1800px]">
          <div className="mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
