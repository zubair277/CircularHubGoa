import { Link, useLocation } from "wouter";
import { Leaf, MapPin, Plus, LayoutDashboard, User, LogOut, Users, Truck, List, Bell, Trash2, MessageSquare, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import ProfileAvatar from "@/components/ProfileAvatar";
import { useNotifications } from "@/hooks/useNotifications";

interface NavbarProps {
  isAuthenticated?: boolean;
  user?: {
    id: string;
    businessName?: string;
    email?: string;
    avatar?: string;
  };
  onAuthClick?: () => void;
  onLogout?: () => void;
  onViewProfile?: () => void;
  onEditProfile?: () => void;
}

export default function Navbar({
  isAuthenticated = false,
  user,
  onAuthClick,
  onLogout,
  onViewProfile,
  onEditProfile,
}: NavbarProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // Debug logging
  console.log('Navbar: notifications count:', notifications.length);
  console.log('Navbar: unread count:', unreadCount);
  console.log('Navbar: notifications:', notifications);

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/marketplace", label: "Marketplace", icon: MapPin },
    { path: "/my-listings", label: "My Listings", icon: List },
    { path: "/messages", label: "Messages", icon: MessageSquare },
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
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">Notifications</h3>
                        <p className="text-sm text-muted-foreground">Your recent activity</p>
                      </div>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Mark all read
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications yet</p>
                        <p className="text-xs mt-1">Create a listing to get started!</p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {notifications.slice(0, 10).map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors ${
                              !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{notification.title}</p>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 border-t">
                      <Link href="/dashboard">
                        <Button variant="outline" size="sm" className="w-full">
                          View all notifications
                        </Button>
                      </Link>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}
            
            {isAuthenticated ? (
              <ProfileAvatar
                user={user}
                onViewProfile={onViewProfile || (() => window.location.href = '/profile')}
                onEditProfile={onEditProfile}
                onLogout={onLogout}
                size="md"
                className="data-testid=button-user-menu"
              />
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
