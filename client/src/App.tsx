import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import Dashboard from "@/pages/Dashboard";
import SupplyChain from "@/pages/SupplyChain";
import SourcingEntities from "@/pages/SourcingEntities";
import ImportSources from "@/pages/ImportSources";
import AddSupplier from "@/pages/AddSupplier";
import SupplierDetail from "@/pages/SupplierDetail";
import Compliance from "@/pages/Compliance";
import Declarations from "@/pages/Declarations";
import AddDeclaration from "@/pages/AddDeclaration";
import Customers from "@/pages/Customers";
import AddCustomer from "@/pages/AddCustomer";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
// SAQ Management is now part of the Supply Chain page
import TestLanguage from "@/pages/TestLanguage";
import TestPersona from "@/pages/TestPersona";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PersonaProvider } from "./contexts/PersonaContext";
import { Layout } from "@/components/layout/Layout";
import React, { Suspense, useEffect, useState, createContext, useContext } from "react";

// Simple loading component for suspense fallback
const Loading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-700">Loading application...</p>
    </div>
  </div>
);

// Debug component to help diagnose routing issues
const DebugInfo = () => {
  const [location, setLocation] = React.useState(window.location.pathname);
  
  React.useEffect(() => {
    console.log("Debug component mounted at:", location);
    const handleLocationChange = () => {
      const newLocation = window.location.pathname;
      console.log("Location changed to:", newLocation);
      setLocation(newLocation);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);
  
  return (
    <div className="fixed bottom-0 right-0 bg-white p-2 text-xs border border-gray-300 rounded-tl-md">
      Route: {location}
    </div>
  );
};

// Authentication context
type AuthContextType = {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

function App() {
  console.log("App component rendering");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [, navigate] = useLocation();
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const loginStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loginStatus === 'true');
  }, []);
  
  const login = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };
  
  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <div className="app-container">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <LanguageProvider>
            <PersonaProvider>
              <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
                <TooltipProvider>
                  <Toaster />
                  <Suspense fallback={<Loading />}>
                    <Switch>
                      <Route path="/login" component={Login} />
                      <Route path="/" component={isLoggedIn ? HomePage : Login} />
                      <Route path="/dashboard" component={isLoggedIn ? Dashboard : Login} />
                      <Route path="/supply-chain" component={isLoggedIn ? SupplyChain : Login} />
                      <Route path="/sourcing-entities" component={isLoggedIn ? SourcingEntities : Login} />
                      <Route path="/import-sources" component={isLoggedIn ? ImportSources : Login} />
                      <Route path="/supplier" component={isLoggedIn ? () => <Layout title="Suppliers">Suppliers List</Layout> : Login} />
                      {/* Redirect SAQ Management to Supply Chain page */}
                      <Route path="/saq-management" component={() => {
                        window.location.href = '/supply-chain';
                        return <div>Redirecting to Supply Chain...</div>;
                      }} />
                      <Route path="/add-supplier" component={isLoggedIn ? AddSupplier : Login} />
                      <Route path="/supplier/:id" component={isLoggedIn ? SupplierDetail : Login} />
                      <Route path="/compliance" component={isLoggedIn ? Compliance : Login} />
                      <Route path="/declarations" component={isLoggedIn ? Declarations : Login} />
                      <Route path="/add-declaration" component={isLoggedIn ? AddDeclaration : Login} />
                      <Route path="/customers" component={isLoggedIn ? Customers : Login} />
                      <Route path="/customer" component={isLoggedIn ? Customers : Login} />
                      <Route path="/add-customer" component={isLoggedIn ? AddCustomer : Login} />
                      <Route path="/settings" component={isLoggedIn ? Settings : Login} />
                      <Route path="/test-language" component={isLoggedIn ? TestLanguage : Login} />
                      <Route path="/test-persona" component={isLoggedIn ? TestPersona : Login} />
                      <Route path="/debug" component={() => <div className="p-10">Debug Page Working</div>} />
                      <Route component={NotFound} />
                    </Switch>
                    <DebugInfo />
                  </Suspense>
                </TooltipProvider>
              </AuthContext.Provider>
            </PersonaProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;