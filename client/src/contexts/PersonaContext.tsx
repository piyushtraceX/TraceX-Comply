import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Shield, ShieldCheck, Users, FileText, Search, Building, User, Briefcase } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export type PersonaId = 
  | 'admin'
  | 'complianceOfficer'
  | 'supplierManager'
  | 'declarationSpecialist'
  | 'auditor'
  | 'supplier'
  | 'customer'
  | 'euOperator';

export type Persona = {
  id: PersonaId;
  name: string;
  icon: React.ReactNode;
  description?: string;
};

type PersonaContextType = {
  personas: Persona[];
  activePersona: Persona;
  setActivePersona: (personaId: PersonaId) => void;
  canAccess: (featureId: string) => boolean;
};

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export const PersonaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  
  // Define personas with their access rights
  const allPersonas: Persona[] = [
    { 
      id: 'admin', 
      name: t('personaSwitcher.admin'), 
      icon: <Shield className="h-4 w-4" />,
      description: t('personaSwitcher.adminDescription')
    },
    { 
      id: 'complianceOfficer', 
      name: t('personaSwitcher.complianceOfficer'), 
      icon: <ShieldCheck className="h-4 w-4" />,
      description: t('personaSwitcher.complianceOfficerDescription')
    },
    { 
      id: 'supplierManager', 
      name: t('personaSwitcher.supplierManager'), 
      icon: <Users className="h-4 w-4" />,
      description: t('personaSwitcher.supplierManagerDescription')
    },
    { 
      id: 'declarationSpecialist', 
      name: t('personaSwitcher.declarationSpecialist'), 
      icon: <FileText className="h-4 w-4" />,
      description: t('personaSwitcher.declarationSpecialistDescription')
    },
    { 
      id: 'auditor', 
      name: t('personaSwitcher.auditor'), 
      icon: <Search className="h-4 w-4" />,
      description: t('personaSwitcher.auditorDescription')
    },
    { 
      id: 'supplier', 
      name: t('personaSwitcher.supplier'), 
      icon: <Building className="h-4 w-4" />,
      description: t('personaSwitcher.supplierDescription')
    },
    { 
      id: 'customer', 
      name: t('personaSwitcher.customer'), 
      icon: <User className="h-4 w-4" />,
      description: t('personaSwitcher.customerDescription')
    },
    { 
      id: 'euOperator', 
      name: t('personaSwitcher.euOperator'), 
      icon: <Briefcase className="h-4 w-4" />,
      description: t('personaSwitcher.euOperatorDescription')
    },
  ];

  // Define feature access by persona
  const featureAccess: Record<PersonaId, string[]> = {
    admin: ['all'], // Admin has access to all features
    complianceOfficer: ['dashboard', 'compliance', 'suppliers', 'declarations', 'reports', 'saq'],
    supplierManager: ['dashboard', 'suppliers', 'supplyChain', 'onboarding'],
    declarationSpecialist: ['dashboard', 'declarations', 'document-management'],
    auditor: ['dashboard', 'reports', 'compliance', 'audit-trails'],
    supplier: ['dashboard', 'my-declarations', 'document-upload', 'profile'],
    customer: ['dashboard', 'my-suppliers', 'reports'],
    euOperator: ['dashboard', 'declarations', 'reports', 'due-diligence'],
  };

  // Get stored persona from localStorage or default to admin
  const getInitialPersona = (): PersonaId => {
    const stored = localStorage.getItem('activePersona');
    return (stored as PersonaId) || 'admin';
  };

  const [activePersonaId, setActivePersonaId] = useState<PersonaId>(getInitialPersona());

  // Get the active persona object
  const activePersona = allPersonas.find(p => p.id === activePersonaId) || allPersonas[0];

  // Update the active persona
  const setActivePersona = (personaId: PersonaId) => {
    setActivePersonaId(personaId);
    localStorage.setItem('activePersona', personaId);
  };

  // Check if the current persona can access a feature
  const canAccess = (featureId: string): boolean => {
    const access = featureAccess[activePersonaId];
    return access.includes('all') || access.includes(featureId);
  };

  // Update active persona when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('activePersona');
      if (stored && stored !== activePersonaId) {
        setActivePersonaId(stored as PersonaId);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activePersonaId]);

  return (
    <PersonaContext.Provider value={{ 
      personas: allPersonas,
      activePersona,
      setActivePersona,
      canAccess
    }}>
      {children}
    </PersonaContext.Provider>
  );
};

export const usePersona = () => {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
};