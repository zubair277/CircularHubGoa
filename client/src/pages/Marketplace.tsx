import { useState } from "react";
import ListingCard from "@/components/ListingCard";
import MapView from "@/components/MapView";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, MapIcon, List } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Marketplace() {
  const [viewMode, setViewMode] = useState<"list" | "map" | "split">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const mockListings = [
    {
      id: "1",
      title: "Fresh Organic Kitchen Waste",
      category: "Organic",
      description: "Daily kitchen waste from our beachside restaurant. Perfect for composting.",
      quantity: 25,
      unit: "kg",
      distance: 2.3,
      businessName: "Sunset Shack",
      businessType: "Restaurant",
      status: "available" as const,
      createdAt: new Date().toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
      latitude: 15.4909,
      longitude: 73.8278,
    },
    {
      id: "2",
      title: "Clean Glass Bottles",
      category: "Glass",
      description: "Assorted glass bottles from hotel bar, cleaned and ready for reuse",
      quantity: 50,
      unit: "units",
      distance: 4.1,
      businessName: "Beach Paradise Resort",
      businessType: "Hotel",
      status: "available" as const,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1594498257673-9f36b767286c?w=400&h=300&fit=crop",
      latitude: 15.5100,
      longitude: 73.8200,
    },
    {
      id: "3",
      title: "Cardboard Packaging Boxes",
      category: "Paper",
      description: "Sturdy cardboard boxes from art supplies, various sizes",
      quantity: 30,
      unit: "pieces",
      distance: 1.5,
      businessName: "Goa Art Gallery",
      businessType: "Artist",
      status: "available" as const,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1553620591-d0e8ba5d3f5a?w=400&h=300&fit=crop",
      latitude: 15.4800,
      longitude: 73.8400,
    },
    {
      id: "4",
      title: "Plastic Containers",
      category: "Plastic",
      description: "Clean plastic containers from bulk food storage",
      quantity: 20,
      unit: "units",
      distance: 3.2,
      businessName: "Green Grocers",
      businessType: "Restaurant",
      status: "reserved" as const,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&h=300&fit=crop",
      latitude: 15.4950,
      longitude: 73.8150,
    },
  ];

  const mapListings = mockListings.map(listing => ({
    id: listing.id,
    title: listing.title,
    category: listing.category,
    latitude: listing.latitude,
    longitude: listing.longitude,
    businessName: listing.businessName,
    distance: listing.distance,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48" data-testid="select-category">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="organic">Organic</SelectItem>
              <SelectItem value="plastic">Plastic</SelectItem>
              <SelectItem value="glass">Glass</SelectItem>
              <SelectItem value="paper">Paper</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("map")}
              data-testid="button-view-map"
            >
              <MapIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {viewMode === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onViewDetails={(id) => console.log('View:', id)}
                onContact={(id) => console.log('Contact:', id)}
              />
            ))}
          </div>
        )}

        {viewMode === "map" && (
          <div className="h-[600px]">
            <MapView
              listings={mapListings}
              center={[15.4909, 73.8278]}
              onListingClick={(id) => console.log('Map click:', id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
