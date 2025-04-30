import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isRTL } = useLanguage();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={cn("min-h-screen flex flex-col md:flex-row", isRTL && "rtl")}>
      <div className={cn(
        "md:block",
        sidebarOpen ? "block" : "hidden"
      )}>
        <Sidebar />
      </div>
      
      <main className="flex-1 overflow-x-hidden">
        <TopBar title={title} toggleSidebar={toggleSidebar} />
        {children}
      </main>
    </div>
  );
};
