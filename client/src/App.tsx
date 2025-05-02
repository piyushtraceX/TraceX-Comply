import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import SupplyChain from "@/pages/SupplyChain";
import AddSupplier from "@/pages/AddSupplier";
import SupplierDetail from "@/pages/SupplierDetail";
import Compliance from "@/pages/Compliance";
import Declarations from "@/pages/Declarations";
import AddDeclaration from "@/pages/AddDeclaration";
import Customers from "@/pages/Customers";
import AddCustomer from "@/pages/AddCustomer";
import Settings from "@/pages/Settings";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PersonaProvider } from "./contexts/PersonaContext";
import { Layout } from "@/components/layout/Layout";
import React, { Suspense } from "react";

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

function Router() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/supply-chain" component={SupplyChain} />
        <Route path="/saq-management" component={() => <Layout title="SAQ Management">SAQ Management Content</Layout>} />
        <Route path="/add-supplier" component={AddSupplier} />
        <Route path="/supplier/:id" component={SupplierDetail} />
        <Route path="/compliance" component={Compliance} />
        <Route path="/declarations" component={Declarations} />
        <Route path="/add-declaration" component={AddDeclaration} />
        <Route path="/customers" component={Customers} />
        <Route path="/add-customer" component={AddCustomer} />
        <Route path="/settings" component={Settings} />
        <Route path="/debug" component={() => <div className="p-10">Debug Page Working</div>} />
        <Route component={NotFound} />
      </Switch>
      <DebugInfo />
    </Suspense>
  );
}

function App() {
  console.log("App component rendering");
  
  return (
    <div className="app-container">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <LanguageProvider>
            <PersonaProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </PersonaProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
