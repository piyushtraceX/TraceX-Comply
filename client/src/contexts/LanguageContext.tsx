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
    
    // Set RTL for Arabic language
    const isRtl = lang === 'ar';
    setIsRTL(isRtl);
    localStorage.setItem('i18nextLng', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    
    // Get proper language name
    const languageNames: Record<string, string> = {
      'en': 'English',
      'fr': 'French',
      'de': 'German',
      'ar': 'Arabic'
    };
    
    const languageName = languageNames[lang] || 'Unknown';
    
    toast({
      title: "Language Changed",
      description: `Interface language changed to ${languageName}`,
      duration: 2000,
    });
  };
  
  // Toggle between available languages cycling through English, French, German, Arabic
  const toggleLanguage = () => {
    const languageOrder = ['en', 'fr', 'de', 'ar'];
    const currentIndex = languageOrder.indexOf(language);
    const nextIndex = (currentIndex + 1) % languageOrder.length;
    const newLang = languageOrder[nextIndex];
    changeLanguage(newLang);
  };

  useEffect(() => {
    // Initialize with the stored language or default to English
    const storedLanguage = localStorage.getItem('i18nextLng') || 'en';
    // Allow all supported languages
    const supportedLanguages = ['en', 'fr', 'de', 'ar'];
    const validLang = supportedLanguages.includes(storedLanguage) ? storedLanguage : 'en';
    changeLanguage(validLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, toggleLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
