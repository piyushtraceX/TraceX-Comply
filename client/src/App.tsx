import { Switch, Route } from "wouter";
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
import TestLanguage from "@/pages/TestLanguage";
import TestPersona from "@/pages/TestPersona";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PersonaProvider } from "./contexts/PersonaContext";
import { AuthProvider, ProtectedRoute } from "./lib/auth/auth-context";
import { Layout } from "@/components/layout/Layout";
import React, { Suspense } from "react";

// Simple loading component 
const Loading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-700">Loading application...</p>
    </div>
  </div>
);

// No need to pre-wrap components when using ProtectedRoute

function App() {
  console.log("App component rendering");
  
  return (
    <div className="app-container">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <LanguageProvider>
            <PersonaProvider>
              <AuthProvider>
                <TooltipProvider>
                  <Toaster />
                  <Suspense fallback={<Loading />}>
                    <Switch>
                      <Route path="/login">
                        <Login />
                      </Route>
                      <ProtectedRoute path="/" component={HomePage} />
                      <ProtectedRoute path="/dashboard" component={Dashboard} />
                      <ProtectedRoute path="/supply-chain" component={SupplyChain} />
                      <ProtectedRoute path="/sourcing-entities" component={SourcingEntities} />
                      <ProtectedRoute path="/import-sources" component={ImportSources} />
                      <ProtectedRoute path="/add-supplier" component={AddSupplier} />
                      <ProtectedRoute path="/supplier/:id" component={SupplierDetail} />
                      <ProtectedRoute path="/compliance" component={Compliance} />
                      <ProtectedRoute path="/declarations" component={Declarations} />
                      <ProtectedRoute path="/add-declaration" component={AddDeclaration} />
                      <ProtectedRoute path="/customers" component={Customers} />
                      <ProtectedRoute path="/customer" component={Customers} />
                      <ProtectedRoute path="/add-customer" component={AddCustomer} />
                      <ProtectedRoute path="/settings" component={Settings} />
                      <ProtectedRoute path="/test-language" component={TestLanguage} />
                      <ProtectedRoute path="/test-persona" component={TestPersona} />
                      <Route path="/debug">
                        <div className="p-10">Debug Page Working</div>
                      </Route>
                      <Route>
                        <NotFound />
                      </Route>
                    </Switch>
                  </Suspense>
                </TooltipProvider>
              </AuthProvider>
            </PersonaProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;