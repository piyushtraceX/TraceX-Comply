import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { isRTL } = useLanguage();

  return (
    <div className={cn("min-h-screen flex flex-col", isRTL && "rtl")}>
      <Sidebar />
      
      <main className="flex-1 overflow-x-hidden md:ml-64">
        <TopBar title={title} />
        {children}
      </main>
    </div>
  );
};
