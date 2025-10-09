import { Link, useLocation } from "wouter";
import { Leaf, MapPin, Plus, LayoutDashboard, User, LogOut, Users, Truck, List, Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  isAuthenticated?: boolean;
  userName?: string;
  userAvatar?: string;
  onAuthClick?: () => void;
  onLogout?: () => void;
}

export default function Navbar({
  isAuthenticated = false,
  userName = "Business User",
  userAvatar,
  onAuthClick,
  onLogout,
}: NavbarProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user alerts
  const { data: alerts = [], isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await fetch("/api/alerts?userId=demo-user-1");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Delete alert mutation
  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await fetch(`/api/alerts/${alertId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete alert");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({ title: "Alert deleted", description: "Your alert has been removed." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete alert", variant: "destructive" });
    },
  });

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/marketplace", label: "Marketplace", icon: MapPin },
    { path: "/my-listings", label: "My Listings", icon: List },
    { path: "/community", label: "Community", icon: Users },
    { path: "/logistics", label: "Logistics", icon: Truck },
    { path: "/add-listing", label: "Add Listing", icon: Plus },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-background/70 border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-full px-3 py-2 -ml-3 transition-all duration-300" data-testid="link-home">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              CircularGoa
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path} data-testid={`link-${item.label.toLowerCase().replace(' ', '-')}`}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="gap-2 rounded-full transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full relative" data-testid="button-alerts">
                    <Bell className="w-5 h-5" />
                    {alerts.length > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                      >
                        {alerts.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-lg">Alerts</h3>
                    <p className="text-sm text-muted-foreground">Your active alerts</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {isLoadingAlerts ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Loading alerts...
                      </div>
                    ) : alerts.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No active alerts</p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {alerts.map((alert: any) => (
                          <div key={alert.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{alert.keywords}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                {alert.categoryId && (
                                  <Badge variant="secondary" className="text-xs">
                                    {alert.categoryId}
                                  </Badge>
                                )}
                                <span>{alert.radiusKm} km</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAlertMutation.mutate(alert.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {alerts.length > 0 && (
                    <div className="p-3 border-t">
                      <Link href="/dashboard">
                        <Button variant="outline" size="sm" className="w-full">
                          View all alerts
                        </Button>
                      </Link>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={userAvatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium" data-testid="text-username">{userName}</p>
                    <p className="text-xs text-muted-foreground">View profile</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer" data-testid="link-profile">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-destructive" data-testid="button-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={onAuthClick} variant="default" className="rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-login">
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
