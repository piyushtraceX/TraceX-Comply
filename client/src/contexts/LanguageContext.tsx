import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => void;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [isRTL, setIsRTL] = useState(i18n.dir() === 'rtl');

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    setLanguage(lang);
    setIsRTL(i18n.dir() === 'rtl');
    localStorage.setItem('i18nextLng', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = i18n.dir();
  };

  useEffect(() => {
    // Set default language to English
    const defaultLanguage = 'en';
    if (i18n.language !== defaultLanguage) {
      changeLanguage(defaultLanguage);
    } else {
      setLanguage(i18n.language);
      setIsRTL(i18n.dir() === 'rtl');
      document.documentElement.lang = i18n.language;
      document.documentElement.dir = i18n.dir();
    }
  }, [i18n.language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, isRTL }}>
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
