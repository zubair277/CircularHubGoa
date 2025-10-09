import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Package,
  MapPin,
  Users
} from "lucide-react";

// Simple interface for now - we'll add proper types later
interface Listing {
  id: number;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  location: string;
  status: string;
  created_at: string;
  progressPercentage: number;
  statusLabel: string;
  statusColor: string;
  claims?: any[];
}

export default function MyListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Mock user ID - replace with actual user authentication
  const userId = 1;

  useEffect(() => {
    fetchUserListings();
  }, []);

  const fetchUserListings = async () => {
    try {
      setLoading(true);
      
      // For now, let's create some mock data to test the UI
      const mockListings: Listing[] = [
        {
          id: 1,
          title: "Fresh Organic Kitchen Waste",
          description: "Daily kitchen waste from restaurant operations, includes vegetable peels, fruit scraps, and coffee grounds.",
          quantity: 25,
          unit: "kg",
          location: "North Goa",
          status: "available",
          created_at: new Date().toISOString(),
          progressPercentage: 25,
          statusLabel: "Available",
          statusColor: "bg-green-100 text-green-800",
          claims: []
        },
        {
          id: 2,
          title: "Glass Bottles Collection",
          description: "Clean glass bottles from bar operations, ready for recycling or reuse.",
          quantity: 50,
          unit: "units",
          location: "South Goa",
          status: "claimed",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          progressPercentage: 75,
          statusLabel: "Claimed",
          statusColor: "bg-yellow-100 text-yellow-800",
          claims: [
            { id: 1, message: "Interested in picking up for our recycling project", status: "accepted" }
          ]
        }
      ];
      
      setListings(mockListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    if (activeTab === "all") return true;
    if (activeTab === "available") return listing.status === "available";
    if (activeTab === "claimed") return listing.status === "claimed";
    if (activeTab === "completed") return listing.status === "completed";
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return <Package className="w-4 h-4" />;
      case "claimed": return <Users className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Listings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track the progress of your listed materials and manage your exchanges
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
          <TabsTrigger value="available">
            Available ({listings.filter(l => l.status === "available").length})
          </TabsTrigger>
          <TabsTrigger value="claimed">
            Claimed ({listings.filter(l => l.status === "claimed").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({listings.filter(l => l.status === "completed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredListings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No listings found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  {activeTab === "all" 
                    ? "You haven't created any listings yet. Start by adding your first listing!"
                    : `No ${activeTab} listings at the moment.`
                  }
                </p>
                <Button asChild>
                  <a href="/add-listing">Create Your First Listing</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{listing.title}</CardTitle>
                        <CardDescription className="text-base mb-3">
                          {listing.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {listing.quantity} {listing.unit}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {listing.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(listing.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={listing.statusColor}>
                          {getStatusIcon(listing.status)}
                          <span className="ml-1">{listing.statusLabel}</span>
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {listing.progressPercentage}%
                          </span>
                        </div>
                        <Progress value={listing.progressPercentage} className="h-2" />
                      </div>

                      {/* Progress Steps */}
                      <div className="flex items-center justify-between text-xs">
                        <div className={`flex items-center gap-1 ${listing.progressPercentage >= 25 ? 'text-green-600' : 'text-gray-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${listing.progressPercentage >= 25 ? 'bg-green-600' : 'bg-gray-300'}`} />
                          Listed
                        </div>
                        <div className={`flex items-center gap-1 ${listing.progressPercentage >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${listing.progressPercentage >= 50 ? 'bg-green-600' : 'bg-gray-300'}`} />
                          Claims
                        </div>
                        <div className={`flex items-center gap-1 ${listing.progressPercentage >= 75 ? 'text-green-600' : 'text-gray-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${listing.progressPercentage >= 75 ? 'bg-green-600' : 'bg-gray-300'}`} />
                          Accepted
                        </div>
                        <div className={`flex items-center gap-1 ${listing.progressPercentage >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${listing.progressPercentage >= 100 ? 'bg-green-600' : 'bg-gray-300'}`} />
                          Completed
                        </div>
                      </div>

                      {/* Claims Information */}
                      {listing.claims && listing.claims.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {listing.claims.length} Claim{listing.claims.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {listing.claims.slice(0, 2).map((claim: any) => (
                              <div key={claim.id} className="text-xs text-gray-600 dark:text-gray-400">
                                • {claim.message || 'No message provided'} 
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {claim.status}
                                </Badge>
                              </div>
                            ))}
                            {listing.claims.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{listing.claims.length - 2} more claims
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
