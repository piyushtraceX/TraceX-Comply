import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
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
import AuthPage from "@/pages/AuthPage";
import TestLanguage from "@/pages/TestLanguage";
import TestPersona from "@/pages/TestPersona";
import DebugPage from "@/pages/DebugPage";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PersonaProvider } from "./contexts/PersonaContext";
import { AuthProvider, ProtectedRoute } from "./contexts/AuthContextV2";
import { Layout } from "@/components/layout/Layout";
import React, { Suspense } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Simple loading component 
const Loading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-700">Loading application...</p>
    </div>
  </div>
);

// Custom wrapper component to handle layout for protected routes
const ProtectedRouteWithLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};

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
                      <Route path="/auth">
                        <AuthPage />
                      </Route>
                      <Route path="/">
                        <ProtectedRouteWithLayout>
                          <Dashboard />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/dashboard">
                        <ProtectedRouteWithLayout>
                          <Dashboard />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/supply-chain">
                        <ProtectedRouteWithLayout>
                          <SupplyChain />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/sourcing-entities">
                        <ProtectedRouteWithLayout>
                          <SourcingEntities />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/import-sources">
                        <ProtectedRouteWithLayout>
                          <ImportSources />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/add-supplier">
                        <ProtectedRouteWithLayout>
                          <AddSupplier />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/supplier/:id">
                        {(params: { id: string }) => (
                          <ProtectedRouteWithLayout>
                            <SupplierDetail id={params.id} />
                          </ProtectedRouteWithLayout>
                        )}
                      </Route>
                      <Route path="/compliance">
                        <ProtectedRouteWithLayout>
                          <Compliance />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/declarations">
                        <ProtectedRouteWithLayout>
                          <Declarations />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/add-declaration">
                        <ProtectedRouteWithLayout>
                          <AddDeclaration />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/customers">
                        <ProtectedRouteWithLayout>
                          <Customers />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/customer">
                        <ProtectedRouteWithLayout>
                          <Customers />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/add-customer">
                        <ProtectedRouteWithLayout>
                          <AddCustomer />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/settings">
                        <ProtectedRouteWithLayout>
                          <Settings />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/test-language">
                        <ProtectedRouteWithLayout>
                          <TestLanguage />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/test-persona">
                        <ProtectedRouteWithLayout>
                          <TestPersona />
                        </ProtectedRouteWithLayout>
                      </Route>
                      <Route path="/debug">
                        <DebugPage />
                      </Route>
                      <Route>
                        <NotFound />
                      </Route>
                    </Switch>
                  </Suspense>
                </TooltipProvider>
                {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
              </AuthProvider>
            </PersonaProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;