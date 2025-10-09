import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import Navbar from "@/components/Navbar";
import Community from "@/pages/Community";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Marketplace from "@/pages/Marketplace";
import AddListing from "@/pages/AddListing";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";
import Logistics from "@/pages/Logistics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/community" component={Community} />
      <Route path="/logistics" component={Logistics} />
      <Route path="/add-listing" component={AddListing} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleLogout = () => {
    // Clear any stored session if added later
    setIsAuthenticated(false);
    setUserName(undefined);
  };

  const handleLogin = (email: string, _password: string) => {
    setIsAuthenticated(true);
    setUserName(email);
    setAuthModalOpen(false);
  };

  const handleRegister = (data: { name: string; email: string }) => {
    setIsAuthenticated(true);
    setUserName(data.name || data.email);
    setAuthModalOpen(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <div className="flex items-center justify-end px-4 py-2 border-b absolute top-0 right-0 z-50">
              <ThemeToggle />
            </div>
            <Navbar
              isAuthenticated={isAuthenticated}
              userName={userName || "Business User"}
              onAuthClick={() => setAuthModalOpen(true)}
              onLogout={handleLogout}
            />
            <main className="flex-1">
              <Router />
            </main>
          </div>
          <AuthModal
            open={authModalOpen}
            onOpenChange={setAuthModalOpen}
            onLogin={handleLogin}
            onRegister={(d) => handleRegister({ name: d.name, email: d.email })}
            onGoogleAuth={() => setIsAuthenticated(true)}
          />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
