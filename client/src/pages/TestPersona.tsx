import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from '@/hooks/use-translation';
import { usePersona, PersonaId } from '@/contexts/PersonaContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Shield, User, Users, FileText, Search, Building, Briefcase, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function TestPersona() {
  const { t } = useTranslation();
  const { activePersona, setActivePersona, availableFeatures, personas } = usePersona();
  const [lastChangedFrom, setLastChangedFrom] = useState<PersonaId | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Listen for persona changes to show animation
  useEffect(() => {
    const handlePersonaChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      
      if (detail && detail.previousPersona) {
        setLastChangedFrom(detail.previousPersona);
        setShowAnimation(true);
        
        // Hide animation after a delay
        const timer = setTimeout(() => {
          setShowAnimation(false);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    };
    
    window.addEventListener('personaChanged', handlePersonaChange);
    return () => window.removeEventListener('personaChanged', handlePersonaChange);
  }, []);
  
  // Get the previous persona object
  const previousPersona = lastChangedFrom 
    ? personas.find(p => p.id === lastChangedFrom) 
    : null;
  
  return (
    <Layout title={t('personaTest.title', "Persona Test")}>
      <div className="container mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {t('personaTest.currentPersona', "Current Role")}
              </span>
              <Badge 
                variant={showAnimation ? "outline" : "secondary"}
                className={cn(
                  "transition-all duration-500",
                  showAnimation && "animate-pulse bg-green-50 text-green-700 border-green-300"
                )}
              >
                {showAnimation ? t('personaTest.changed', "Just Changed!") : t('personaTest.active', "Active")}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className={cn(
                "p-4 rounded-full",
                "bg-primary-50 text-primary-600",
                showAnimation && "animate-bounce"
              )}>
                {React.cloneElement(activePersona.icon as React.ReactElement, {
                  className: 'h-8 w-8'
                })}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">{activePersona.name}</h3>
                <p className="text-gray-600">{activePersona.description}</p>
              </div>
            </div>
            
            {showAnimation && previousPersona && (
              <div className="mb-6 p-3 border border-amber-200 bg-amber-50 rounded-md">
                <p className="text-sm text-amber-800">
                  {t('personaTest.changedFrom', "Changed from {{role}}", {
                    role: previousPersona.name
                  })}
                </p>
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div>
              <h4 className="font-medium mb-2">{t('personaTest.availableFeatures', "Available Features")}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {availableFeatures.map((feature, index) => (
                  <div 
                    key={index} 
                    className="p-2 border border-gray-200 rounded-md text-sm bg-gray-50"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setActivePersona('admin')}
              variant={activePersona.id === 'admin' ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
            >
              <Shield className="h-4 w-4" />
              <span>{t('personaSwitcher.admin')}</span>
            </Button>
            
            <Button 
              onClick={() => setActivePersona('complianceOfficer')}
              variant={activePersona.id === 'complianceOfficer' ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{t('personaSwitcher.complianceOfficer')}</span>
            </Button>
            
            <Button 
              onClick={() => setActivePersona('supplierManager')}
              variant={activePersona.id === 'supplierManager' ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
            >
              <Users className="h-4 w-4" />
              <span>{t('personaSwitcher.supplierManager')}</span>
            </Button>
            
            <Button 
              onClick={() => setActivePersona('supplier')}
              variant={activePersona.id === 'supplier' ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
            >
              <Building className="h-4 w-4" />
              <span>{t('personaSwitcher.supplier')}</span>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('personaTest.dashboardRedirect', "Dashboard Redirection Test")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {t('personaTest.dashboardDescription', "When switching personas with redirection enabled, you'll be automatically redirected to the default dashboard for that role. Try it by clicking the buttons below.")}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {personas.slice(0, 4).map((persona) => (
                <div 
                  key={persona.id}
                  className="border border-gray-200 rounded-md p-4 hover:border-primary-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {React.cloneElement(persona.icon as React.ReactElement, {
                      className: 'h-5 w-5 text-primary-600'
                    })}
                    <h4 className="font-medium">{persona.name}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{persona.description}</p>
                  <p className="text-xs text-gray-700 mb-3">
                    {t('personaTest.dashboardPath', "Dashboard: {{path}}", {
                      path: persona.dashboardRoute || '/dashboard'
                    })}
                  </p>
                  <Button 
                    onClick={() => setActivePersona(persona.id, true)}
                    size="sm"
                    variant="secondary"
                    className="w-full"
                  >
                    {t('personaTest.switchWithRedirect', "Switch & Redirect")}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}