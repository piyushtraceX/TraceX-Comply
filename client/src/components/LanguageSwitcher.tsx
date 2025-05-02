import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLanguageName, getLanguageFlag } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ar', name: 'Arabic' },
];

export const LanguageSwitcher = () => {
  const { language, changeLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "flex items-center gap-2 h-9 px-3 py-2 border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
            isRTL && "flex-row-reverse"
          )}
        >
          <img
            src={getLanguageFlag(language)}
            className="lang-flag w-5 h-4 object-cover border border-gray-200 rounded-sm shadow-sm"
            alt={getLanguageName(language)}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">
            {language.toUpperCase()}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              open ? "transform rotate-180" : "",
              isRTL && open ? "transform -rotate-180" : ""
            )}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1 shadow-lg border border-gray-200 rounded-md">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={cn(
              "flex items-center px-3 py-2 text-sm rounded-md",
              language === lang.code ? "bg-gray-100 text-primary-600 font-medium" : "text-gray-700 hover:bg-gray-50", 
              "cursor-pointer",
              isRTL && "flex-row-reverse"
            )}
            onClick={() => {
              changeLanguage(lang.code);
              setOpen(false);
            }}
          >
            <img
              src={getLanguageFlag(lang.code)}
              className={cn(
                "lang-flag w-5 h-4 object-cover border border-gray-200 rounded-sm shadow-sm",
                isRTL ? "ml-2" : "mr-2"
              )}
              alt={lang.name}
              aria-hidden="true"
            />
            <span>{getLanguageName(lang.code)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
