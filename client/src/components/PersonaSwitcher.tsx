import React, { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, CornerDownRight, RefreshCw } from 'lucide-react';
import { usePersona, PersonaId } from '@/contexts/PersonaContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export const PersonaSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { personas, activePersona, setActivePersona, isChangingPersona, availableFeatures } = usePersona();
  const { isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  
  // Switch persona with or without dashboard redirection
  const handleSelectPersona = (id: PersonaId, redirectToDashboard: boolean = false) => {
    setActivePersona(id, redirectToDashboard);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          disabled={isChangingPersona}
          className={cn(
            "flex items-center gap-1.5 h-8 px-2.5 py-1.5 border-gray-200 text-xs font-medium",
            isChangingPersona 
              ? "text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed" 
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
            isRTL && "flex-row-reverse",
            "transition-all duration-200 ease-in-out",
            isChangingPersona && "animate-pulse"
          )}
        >
          <span className={cn(
            isRTL ? "ml-1" : "mr-1",
            "transition-transform", 
            isChangingPersona && "animate-spin"
          )}>
            {isChangingPersona 
              ? <RefreshCw className="h-4 w-4" /> 
              : React.cloneElement(activePersona.icon as React.ReactElement, { className: 'h-4 w-4' })
            }
          </span>
          <span className="hidden sm:inline">{activePersona.name}</span>
          <span className="sm:hidden">{t('personaSwitcher.role')}</span>
          <ChevronDown className={cn(
            "h-3.5 w-3.5 text-gray-400 transition-transform", 
            open ? "transform rotate-180" : "",
            isRTL ? "mr-1" : "ml-1"
          )} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 p-1 shadow-md border border-gray-200 rounded-md"
      >
        <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-500 flex items-center justify-between">
          <span>{t('personaSwitcher.label')}</span>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs text-gray-400 flex items-center">
                <span className="mr-1">{t('personaSwitcher.visibleFeatures')}</span>
                <span className="bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-xs">
                  {availableFeatures.length}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" align="center" className="max-w-xs">
              <p className="text-xs">{t('personaSwitcher.featureAccessHint')}</p>
            </TooltipContent>
          </Tooltip>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        
        {personas.map((persona) => (
          <DropdownMenuSub key={persona.id}>
            <DropdownMenuSubTrigger
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm rounded-md",
                activePersona.id === persona.id ? "bg-gray-100 text-primary-600 font-medium" : "text-gray-700 hover:bg-gray-50",
                "cursor-pointer",
                isRTL && "flex-row-reverse"
              )}
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
                  {persona.description}
                </span>
              </div>
              {activePersona.id === persona.id ? (
                <Check className={cn(
                  "h-3.5 w-3.5 flex-shrink-0 text-primary-600", 
                  isRTL ? "mr-2" : "ml-2"
                )} />
              ) : (
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 ml-2 text-gray-400",
                  "-rotate-90"
                )} />
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                className="w-56 p-1 bg-white shadow-md border border-gray-200 rounded-md"
              >
                <DropdownMenuItem
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-50",
                    "cursor-pointer",
                    isRTL && "flex-row-reverse"
                  )}
                  onClick={() => handleSelectPersona(persona.id, false)}
                >
                  <span className={cn(isRTL ? "ml-2" : "mr-2")}>
                    {React.cloneElement(persona.icon as React.ReactElement, { className: 'h-4 w-4' })}
                  </span>
                  <span>{t('personaSwitcher.switchOnly')}</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-50",
                    "cursor-pointer",
                    isRTL && "flex-row-reverse"
                  )}
                  onClick={() => handleSelectPersona(persona.id, true)}
                >
                  <span className={cn(isRTL ? "ml-2" : "mr-2")}>
                    <CornerDownRight className="h-4 w-4" />
                  </span>
                  <span>{t('personaSwitcher.switchAndRedirect')}</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        ))}
        
        <DropdownMenuSeparator className="my-1" />
        <div className="px-3 py-2 text-xs text-gray-500">
          {t('personaSwitcher.roleDescription')}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};