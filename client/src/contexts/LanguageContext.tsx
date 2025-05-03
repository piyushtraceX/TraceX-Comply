import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => void;
  toggleLanguage: () => void; // Toggle between EN and DE
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [isRTL, setIsRTL] = useState(i18n.dir() === 'rtl');
  const { toast } = useToast();

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    setLanguage(lang);
    setIsRTL(i18n.dir() === 'rtl');
    localStorage.setItem('i18nextLng', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = i18n.dir();
    
    // Show toast notification on language change
    const languageName = lang === 'en' ? 'English' : lang === 'de' ? 'German' : 'Unknown';
    toast({
      title: "Language Changed",
      description: `Interface language changed to ${languageName}`,
      duration: 2000,
    });
  };
  
  // Toggle between English and German as specified in requirements
  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'de' : 'en';
    changeLanguage(newLang);
  };

  useEffect(() => {
    // Initialize with the stored language or default to English
    const storedLanguage = localStorage.getItem('i18nextLng') || 'en';
    // Only allow EN and DE as per requirements
    const validLang = ['en', 'de'].includes(storedLanguage) ? storedLanguage : 'en';
    changeLanguage(validLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, toggleLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
