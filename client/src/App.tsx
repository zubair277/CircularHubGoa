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
import MyListings from "@/pages/MyListings";
import Messages from "@/pages/Messages";
import AddListing from "@/pages/AddListing";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import AuthModal from "@/components/AuthModal";
import Logistics from "@/pages/Logistics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/my-listings" component={MyListings} />
      <Route path="/messages" component={Messages} />
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
  const [user, setUser] = useState<{
    id: string;
    businessName?: string;
    email?: string;
    avatar?: string;
  } | undefined>(undefined);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Check for existing user in localStorage on app load and listen for changes
  useEffect(() => {
    const checkUser = () => {
      const existingUser = localStorage.getItem('user');
      if (existingUser) {
        try {
          const userData = JSON.parse(existingUser);
          setIsAuthenticated(true);
          setUser({
            id: userData.id || 'unknown',
            businessName: userData.businessName || userData.name,
            email: userData.email,
            avatar: userData.avatar
          });
          console.log('Found existing user:', userData);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(undefined);
        }
      } else {
        setIsAuthenticated(false);
        setUser(undefined);
      }
    };

    // Check on mount
    checkUser();

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        checkUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events (from same tab)
    const handleUserUpdate = () => {
      checkUser();
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const handleLogout = () => {
    // Clear stored session
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(undefined);
  };

  const handleLogin = (email: string, _password: string) => {
    // This will be handled by the actual login API call in Home.tsx
    // The user data will be stored in localStorage and the effect will update the state
  };

  const handleRegister = (data: { name: string; email: string }) => {
    // This will be handled by the actual registration API call in Home.tsx
    // The user data will be stored in localStorage and the effect will update the state
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
              user={user}
              onAuthClick={() => setAuthModalOpen(true)}
              onLogout={handleLogout}
              onViewProfile={() => window.location.href = '/profile'}
              onEditProfile={() => {
                // TODO: Implement profile picture editing
                console.log('Edit profile picture');
              }}
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
