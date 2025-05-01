import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import SupplyChain from "@/pages/SupplyChain";
import SupplierDetail from "@/pages/SupplierDetail";
import Compliance from "@/pages/Compliance";
import Declarations from "@/pages/Declarations";
import AddDeclaration from "@/pages/AddDeclaration";
import Customers from "@/pages/Customers";
import Settings from "@/pages/Settings";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/supply-chain" component={SupplyChain} />
      <Route path="/supplier/:id" component={SupplierDetail} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/declarations" component={Declarations} />
      <Route path="/add-declaration" component={AddDeclaration} />
      <Route path="/customers" component={Customers} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
