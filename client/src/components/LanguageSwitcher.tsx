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
        <Button variant="ghost" size="sm" className="flex items-center text-sm text-gray-700 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          <img
            src={getLanguageFlag(language)}
            className="lang-flag mr-2 w-6 h-4.5 object-cover border border-gray-200 rounded"
            alt={getLanguageName(language)}
            aria-hidden="true"
          />
          <span className="mr-1 text-sm font-medium">
            {getLanguageName(language)}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              open ? "transform rotate-180" : ""
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
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              changeLanguage(lang.code);
              setOpen(false);
            }}
          >
            <img
              src={getLanguageFlag(lang.code)}
              className="lang-flag mr-2 w-6 h-4.5 object-cover border border-gray-200 rounded"
              alt={lang.name}
              aria-hidden="true"
            />
            <span>{t(`languages.${lang.code}`)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
