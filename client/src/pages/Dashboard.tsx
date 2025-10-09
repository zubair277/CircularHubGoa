import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import DashboardStats from "@/components/DashboardStats";
import ListingCard from "@/components/ListingCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Bell, Trash2, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
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

  const monthlyData = [
    { month: "Jan", waste: 180 },
    { month: "Feb", waste: 220 },
    { month: "Mar", waste: 310 },
    { month: "Apr", waste: 280 },
    { month: "May", waste: 420 },
    { month: "Jun", waste: 380 },
  ];

  const categoryData = [
    { name: "Organic", value: 400, color: "hsl(var(--primary))" },
    { name: "Plastic", value: 300, color: "hsl(var(--accent))" },
    { name: "Glass", value: 200, color: "hsl(var(--chart-3))" },
    { name: "Paper", value: 100, color: "hsl(var(--chart-4))" },
  ];

  const recentListings = [
    {
      id: "1",
      title: "Fresh Organic Kitchen Waste",
      category: "Organic",
      description: "Daily kitchen waste from our beachside restaurant",
      quantity: 25,
      unit: "kg",
      businessName: "Sunset Shack",
      businessType: "Restaurant",
      status: "available" as const,
      createdAt: new Date().toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
    },
    {
      id: "2",
      title: "Clean Glass Bottles",
      category: "Glass",
      description: "Assorted glass bottles from hotel bar",
      quantity: 50,
      unit: "units",
      businessName: "Beach Paradise Resort",
      businessType: "Hotel",
      status: "available" as const,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1594498257673-9f36b767286c?w=400&h=300&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Track your sustainability impact</p>
          </div>
          <Link href="/add-listing">
            <Button className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" data-testid="button-add-listing">
              <Plus className="w-4 h-4" />
              Add Listing
            </Button>
          </Link>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Monthly Waste Diverted</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="waste" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Materials by Category</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={(entry) => entry.name}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* My Alerts Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">My Alerts</h2>
            <Link href="/marketplace">
              <Button variant="outline" className="rounded-full" data-testid="button-create-alert">
                <Bell className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </Link>
          </div>
          
          {isLoadingAlerts ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <Card className="rounded-2xl shadow-lg">
              <CardContent className="text-center py-12">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No alerts yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create alerts to get notified when items you're looking for become available.
                </p>
                <Link href="/marketplace">
                  <Button className="rounded-full">
                    <Bell className="w-4 h-4 mr-2" />
                    Create Your First Alert
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert: any) => (
                <Card key={alert.id} className="rounded-2xl shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{alert.keywords}</CardTitle>
                        {alert.categoryId && (
                          <Badge variant="secondary" className="text-xs">
                            {alert.categoryId}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlertMutation.mutate(alert.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>Within {alert.radiusKm} km</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Your Recent Listings</h2>
            <Link href="/my-listings">
              <Button variant="outline" className="rounded-full" data-testid="button-view-all">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onViewDetails={(id) => console.log('View:', id)}
                onContact={(id) => console.log('Contact:', id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
