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
import { AuthProvider, withAuth } from "./lib/auth/auth-context";
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

// Wrap components that need auth protection
const ProtectedHomePage = withAuth(HomePage);
const ProtectedDashboard = withAuth(Dashboard);
const ProtectedSupplyChain = withAuth(SupplyChain);
const ProtectedSourcingEntities = withAuth(SourcingEntities);
const ProtectedImportSources = withAuth(ImportSources);
const ProtectedAddSupplier = withAuth(AddSupplier);
const ProtectedSupplierDetail = withAuth(SupplierDetail);
const ProtectedCompliance = withAuth(Compliance);
const ProtectedDeclarations = withAuth(Declarations);
const ProtectedAddDeclaration = withAuth(AddDeclaration);
const ProtectedCustomers = withAuth(Customers);
const ProtectedAddCustomer = withAuth(AddCustomer);
const ProtectedSettings = withAuth(Settings);
const ProtectedTestLanguage = withAuth(TestLanguage);
const ProtectedTestPersona = withAuth(TestPersona);

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
                      <Route path="/">
                        <ProtectedHomePage />
                      </Route>
                      <Route path="/dashboard">
                        <ProtectedDashboard />
                      </Route>
                      <Route path="/supply-chain">
                        <ProtectedSupplyChain />
                      </Route>
                      <Route path="/sourcing-entities">
                        <ProtectedSourcingEntities />
                      </Route>
                      <Route path="/import-sources">
                        <ProtectedImportSources />
                      </Route>
                      <Route path="/add-supplier">
                        <ProtectedAddSupplier />
                      </Route>
                      <Route path="/supplier/:id">
                        <ProtectedSupplierDetail />
                      </Route>
                      <Route path="/compliance">
                        <ProtectedCompliance />
                      </Route>
                      <Route path="/declarations">
                        <ProtectedDeclarations />
                      </Route>
                      <Route path="/add-declaration">
                        <ProtectedAddDeclaration />
                      </Route>
                      <Route path="/customers">
                        <ProtectedCustomers />
                      </Route>
                      <Route path="/customer">
                        <ProtectedCustomers />
                      </Route>
                      <Route path="/add-customer">
                        <ProtectedAddCustomer />
                      </Route>
                      <Route path="/settings">
                        <ProtectedSettings />
                      </Route>
                      <Route path="/test-language">
                        <ProtectedTestLanguage />
                      </Route>
                      <Route path="/test-persona">
                        <ProtectedTestPersona />
                      </Route>
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