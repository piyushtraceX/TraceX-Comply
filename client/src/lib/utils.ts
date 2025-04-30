import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getLanguageName = (code: string): string => {
  const languages: Record<string, string> = {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    ar: 'العربية',
  };
  
  return languages[code] || code;
};

export const getLanguageFlag = (code: string): string => {
  const flags: Record<string, string> = {
    en: 'https://flagcdn.com/w40/gb.png',
    fr: 'https://flagcdn.com/w40/fr.png',
    de: 'https://flagcdn.com/w40/de.png',
    ar: 'https://flagcdn.com/w40/sa.png',
  };
  
  return flags[code] || '';
};

export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);
};
