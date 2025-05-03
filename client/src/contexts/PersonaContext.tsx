import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Shield, ShieldCheck, Users, FileText, Search, Building, User, Briefcase } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

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
  dashboardRoute?: string; // Default route for this persona
  features?: string[]; // Features this persona can access
};

export type PersonaFeatures = {
  [key in string]: {
    id: string;
    name: string;
    description?: string;
    route?: string;
  };
};

type PersonaContextType = {
  personas: Persona[];
  activePersona: Persona;
  setActivePersona: (personaId: PersonaId, redirectToDashboard?: boolean) => void;
  canAccess: (featureId: string) => boolean;
  availableFeatures: string[];
  isChangingPersona: boolean;
};

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

// Default routes for each persona
const personaDashboards: Record<PersonaId, string> = {
  admin: '/dashboard',
  complianceOfficer: '/compliance',
  supplierManager: '/supply-chain',
  declarationSpecialist: '/declarations',
  auditor: '/reports',
  supplier: '/dashboard?view=supplier',
  customer: '/dashboard?view=customer',
  euOperator: '/declarations?view=operator',
};

export const PersonaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isChangingPersona, setIsChangingPersona] = useState(false);
  
  // Define features available in the application
  const features: PersonaFeatures = {
    dashboard: {
      id: 'dashboard',
      name: t('nav.dashboard'),
      route: '/dashboard'
    },
    compliance: {
      id: 'compliance',
      name: t('nav.compliance'),
      route: '/compliance'
    },
    suppliers: {
      id: 'suppliers',
      name: 'Suppliers',
      route: '/supplier'
    },
    declarations: {
      id: 'declarations',
      name: t('nav.eudrDeclarations'),
      route: '/declarations'
    },
    reports: {
      id: 'reports',
      name: 'Reports',
      route: '/reports'
    },
    supplyChain: {
      id: 'supplyChain',
      name: t('nav.supplyChain'),
      route: '/supply-chain'
    },
    saq: {
      id: 'saq',
      name: t('nav.saqManagement'),
      route: '/saq-management'
    },
    customers: {
      id: 'customers',
      name: t('nav.customers'),
      route: '/customers'
    },
    settings: {
      id: 'settings',
      name: t('nav.settings'),
      route: '/settings'
    }
  };
  
  // Define feature access by persona
  const featureAccess: Record<PersonaId, string[]> = {
    admin: Object.keys(features), // Admin has access to all features
    complianceOfficer: ['dashboard', 'compliance', 'suppliers', 'declarations', 'reports', 'saq'],
    supplierManager: ['dashboard', 'suppliers', 'supplyChain', 'onboarding', 'settings'],
    declarationSpecialist: ['dashboard', 'declarations', 'document-management', 'settings'],
    auditor: ['dashboard', 'reports', 'compliance', 'audit-trails', 'settings'],
    supplier: ['dashboard', 'my-declarations', 'document-upload', 'profile', 'settings'],
    customer: ['dashboard', 'my-suppliers', 'reports', 'settings'],
    euOperator: ['dashboard', 'declarations', 'reports', 'due-diligence', 'settings'],
  };

  // Define personas with their access rights
  const allPersonas: Persona[] = [
    { 
      id: 'admin', 
      name: t('personaSwitcher.admin'), 
      icon: <Shield className="h-4 w-4" />,
      description: t('personaSwitcher.adminDescription'),
      dashboardRoute: personaDashboards.admin,
      features: featureAccess.admin
    },
    { 
      id: 'complianceOfficer', 
      name: t('personaSwitcher.complianceOfficer'), 
      icon: <ShieldCheck className="h-4 w-4" />,
      description: t('personaSwitcher.complianceOfficerDescription'),
      dashboardRoute: personaDashboards.complianceOfficer,
      features: featureAccess.complianceOfficer
    },
    { 
      id: 'supplierManager', 
      name: t('personaSwitcher.supplierManager'), 
      icon: <Users className="h-4 w-4" />,
      description: t('personaSwitcher.supplierManagerDescription'),
      dashboardRoute: personaDashboards.supplierManager,
      features: featureAccess.supplierManager
    },
    { 
      id: 'declarationSpecialist', 
      name: t('personaSwitcher.declarationSpecialist'), 
      icon: <FileText className="h-4 w-4" />,
      description: t('personaSwitcher.declarationSpecialistDescription'),
      dashboardRoute: personaDashboards.declarationSpecialist,
      features: featureAccess.declarationSpecialist
    },
    { 
      id: 'auditor', 
      name: t('personaSwitcher.auditor'), 
      icon: <Search className="h-4 w-4" />,
      description: t('personaSwitcher.auditorDescription'),
      dashboardRoute: personaDashboards.auditor,
      features: featureAccess.auditor
    },
    { 
      id: 'supplier', 
      name: t('personaSwitcher.supplier'), 
      icon: <Building className="h-4 w-4" />,
      description: t('personaSwitcher.supplierDescription'),
      dashboardRoute: personaDashboards.supplier,
      features: featureAccess.supplier
    },
    { 
      id: 'customer', 
      name: t('personaSwitcher.customer'), 
      icon: <User className="h-4 w-4" />,
      description: t('personaSwitcher.customerDescription'),
      dashboardRoute: personaDashboards.customer,
      features: featureAccess.customer
    },
    { 
      id: 'euOperator', 
      name: t('personaSwitcher.euOperator'), 
      icon: <Briefcase className="h-4 w-4" />,
      description: t('personaSwitcher.euOperatorDescription'),
      dashboardRoute: personaDashboards.euOperator,
      features: featureAccess.euOperator
    },
  ];

  // Get stored persona from localStorage or default to admin
  const getInitialPersona = (): PersonaId => {
    const stored = localStorage.getItem('activePersona');
    return (stored as PersonaId) || 'admin';
  };

  const [activePersonaId, setActivePersonaId] = useState<PersonaId>(getInitialPersona());

  // Get the active persona object
  const activePersona = allPersonas.find(p => p.id === activePersonaId) || allPersonas[0];
  
  // Get available features for active persona
  const availableFeatures = activePersona.features || [];

  // Update the active persona with option to redirect
  const setActivePersona = (personaId: PersonaId, redirectToDashboard: boolean = false) => {
    setIsChangingPersona(true);
    
    // Store previous persona for animation or comparison if needed
    const previousPersona = activePersonaId;
    
    // Update state and localStorage
    setActivePersonaId(personaId);
    localStorage.setItem('activePersona', personaId);
    
    // Find the persona object
    const newPersona = allPersonas.find(p => p.id === personaId);
    
    if (newPersona) {
      // Show toast notification
      toast({
        title: t('personaSwitcher.switchedTo', { 
          defaultValue: "Switched to {{role}} role",
          role: newPersona.name
        }),
        description: newPersona.description,
        duration: 3000,
      });
      
      // Redirect to persona dashboard if requested
      if (redirectToDashboard && newPersona.dashboardRoute) {
        // Small delay to allow toast to show before redirect
        setTimeout(() => {
          setLocation(newPersona.dashboardRoute || '/dashboard');
          setIsChangingPersona(false);
        }, 300);
      } else {
        setTimeout(() => {
          setIsChangingPersona(false);
        }, 300);
      }
      
      // Dispatch custom event for other components that might be listening
      const event = new CustomEvent('personaChanged', { 
        detail: { 
          newPersona: personaId, 
          previousPersona 
        } 
      });
      window.dispatchEvent(event);
    }
  };

  // Check if the current persona can access a feature
  const canAccess = (featureId: string): boolean => {
    return availableFeatures.includes(featureId) || availableFeatures.includes('all');
  };

  // Update active persona when localStorage changes (for multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'activePersona' && e.newValue && e.newValue !== activePersonaId) {
        setActivePersonaId(e.newValue as PersonaId);
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
      canAccess,
      availableFeatures,
      isChangingPersona
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