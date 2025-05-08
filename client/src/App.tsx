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

// Simplified protected route component - no layout here since pages include their own layout
const SimpleProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute>
      {children}
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
                        <SimpleProtectedRoute>
                          <Dashboard />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/dashboard">
                        <SimpleProtectedRoute>
                          <Dashboard />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/supply-chain">
                        <SimpleProtectedRoute>
                          <SupplyChain />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/sourcing-entities">
                        <SimpleProtectedRoute>
                          <SourcingEntities />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/import-sources">
                        <SimpleProtectedRoute>
                          <ImportSources />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/add-supplier">
                        <SimpleProtectedRoute>
                          <AddSupplier />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/supplier/:id">
                        {(params: { id: string }) => (
                          <SimpleProtectedRoute>
                            <SupplierDetail id={params.id} />
                          </SimpleProtectedRoute>
                        )}
                      </Route>
                      <Route path="/compliance">
                        <SimpleProtectedRoute>
                          <Compliance />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/declarations">
                        <SimpleProtectedRoute>
                          <Declarations />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/add-declaration">
                        <SimpleProtectedRoute>
                          <AddDeclaration />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/customers">
                        <SimpleProtectedRoute>
                          <Customers />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/customer">
                        <SimpleProtectedRoute>
                          <Customers />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/add-customer">
                        <SimpleProtectedRoute>
                          <AddCustomer />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/settings">
                        <SimpleProtectedRoute>
                          <Settings />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/test-language">
                        <SimpleProtectedRoute>
                          <TestLanguage />
                        </SimpleProtectedRoute>
                      </Route>
                      <Route path="/test-persona">
                        <SimpleProtectedRoute>
                          <TestPersona />
                        </SimpleProtectedRoute>
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