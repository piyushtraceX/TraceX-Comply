import React, { useState } from 'react';
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
import { Check, ChevronDown, User, Shield, Briefcase, FileText, Search, Users, Building, ShieldCheck } from 'lucide-react';

type Persona = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

export const PersonaSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const [activePersona, setActivePersona] = useState<string>('admin');
  
  const personas: Persona[] = [
    { 
      id: 'admin', 
      name: t('personaSwitcher.admin'), 
      icon: <Shield className="h-4 w-4 mr-2" /> 
    },
    { 
      id: 'complianceOfficer', 
      name: t('personaSwitcher.complianceOfficer'), 
      icon: <ShieldCheck className="h-4 w-4 mr-2" /> 
    },
    { 
      id: 'supplierManager', 
      name: t('personaSwitcher.supplierManager'), 
      icon: <Users className="h-4 w-4 mr-2" /> 
    },
    { 
      id: 'declarationSpecialist', 
      name: t('personaSwitcher.declarationSpecialist'), 
      icon: <FileText className="h-4 w-4 mr-2" /> 
    },
    { 
      id: 'auditor', 
      name: t('personaSwitcher.auditor'), 
      icon: <Search className="h-4 w-4 mr-2" /> 
    },
    { 
      id: 'supplier', 
      name: t('personaSwitcher.supplier'), 
      icon: <Building className="h-4 w-4 mr-2" /> 
    },
    { 
      id: 'customer', 
      name: t('personaSwitcher.customer'), 
      icon: <User className="h-4 w-4 mr-2" /> 
    },
    { 
      id: 'euOperator', 
      name: t('personaSwitcher.euOperator'), 
      icon: <Briefcase className="h-4 w-4 mr-2" /> 
    },
  ];
  
  const activePersonaObj = personas.find(p => p.id === activePersona);
  
  const handleSelectPersona = (id: string) => {
    setActivePersona(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 h-9">
          {activePersonaObj?.icon}
          <span>{activePersonaObj?.name}</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{t('personaSwitcher.label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {personas.map((persona) => (
          <DropdownMenuItem 
            key={persona.id}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => handleSelectPersona(persona.id)}
          >
            <div className="flex items-center">
              {persona.icon}
              <span>{persona.name}</span>
            </div>
            {activePersona === persona.id && (
              <Check className="h-4 w-4 ml-2 text-primary-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};