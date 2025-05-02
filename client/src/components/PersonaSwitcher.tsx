import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import { usePersona, PersonaId } from '@/contexts/PersonaContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export const PersonaSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { personas, activePersona, setActivePersona } = usePersona();
  const { isRTL } = useLanguage();
  
  const handleSelectPersona = (id: PersonaId) => {
    setActivePersona(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "flex items-center gap-2 h-9 px-3 py-2 border-gray-200 text-sm text-gray-700 hover:bg-gray-50",
            isRTL && "flex-row-reverse"
          )}
        >
          <span className={cn(isRTL ? "ml-1" : "mr-1")}>
            {React.cloneElement(activePersona.icon as React.ReactElement, { className: 'h-4 w-4' })}
          </span>
          <span className="hidden sm:inline">{activePersona.name}</span>
          <span className="sm:hidden">Persona</span>
          <ChevronDown className={cn("h-4 w-4 text-gray-400", isRTL ? "mr-1" : "ml-1")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-1 shadow-lg border border-gray-200 rounded-md">
        <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-500">
          {t('personaSwitcher.label')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        {personas.map((persona) => (
          <DropdownMenuItem 
            key={persona.id}
            className={cn(
              "flex items-center justify-between px-3 py-2 text-sm rounded-md",
              activePersona.id === persona.id ? "bg-gray-100 text-primary-600 font-medium" : "text-gray-700 hover:bg-gray-50",
              "cursor-pointer",
              isRTL && "flex-row-reverse"
            )}
            onClick={() => handleSelectPersona(persona.id)}
          >
            <div className={cn("flex flex-col", isRTL && "items-end")}>
              <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                <span className={cn(isRTL ? "ml-2" : "mr-2")}>
                  {React.cloneElement(persona.icon as React.ReactElement, { className: 'h-4 w-4' })}
                </span>
                <span>{persona.name}</span>
              </div>
              <span className={cn(
                "text-xs text-gray-500 mt-0.5", 
                isRTL ? "mr-6" : "ml-6"
              )}>
                {t(`personaSwitcher.${persona.id}Description`)}
              </span>
            </div>
            {activePersona.id === persona.id && (
              <Check className={cn(
                "h-4 w-4 flex-shrink-0", 
                isRTL ? "mr-2" : "ml-2"
              )} />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};