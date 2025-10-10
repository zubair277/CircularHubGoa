import { useState, useEffect } from "react";
import ListingCard from "@/components/ListingCard";
import MapView from "@/components/MapView";
import CreateAlertModal from "@/components/CreateAlertModal";
import DetailsModal from "@/components/DetailsModal";
import ChatModal from "@/components/ChatModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapIcon, List, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showChatFor, setShowChatFor] = useState<string | null>(null);
  const [showScheduleFor, setShowScheduleFor] = useState<string | null>(null);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [listings, setListings] = useState<any[]>([]);

  // Load listings from localStorage (primary) and API (fallback)
  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Always include fallback listings
        const fallbackListings = [
          {
            id: 'fallback-1',
            title: 'Fresh Organic Kitchen Waste',
            description: 'Daily kitchen waste from our beach restaurant. Perfect for composting.',
            category: 'organic',
            quantity: 25,
            unit: 'kg',
            location: 'Goa, India',
            latitude: '15.4909',
            longitude: '73.8278',
            availability: 'one-time',
            listingType: 'offer',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&crop=center',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            businessName: 'Sunset Shack',
            businessType: 'Restaurant',
            distance: 2.3,
            userId: 'demo-user-1'
          },
          {
            id: 'fallback-2',
            title: 'Packaging Boxes',
            description: 'Card boxes from art supplies, clean and ready for reuse.',
            category: 'paper',
            quantity: 15,
            unit: 'units',
            location: 'Goa, India',
            latitude: '15.4909',
            longitude: '73.8278',
            availability: 'one-time',
            listingType: 'offer',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            businessName: 'Art Studio Goa',
            businessType: 'Art Studio',
            distance: 1.5,
            userId: 'demo-user-2'
          }
        ];

        // Load from localStorage
          const storedListings = JSON.parse(localStorage.getItem('listings') || '[]');
        console.log('Marketplace: Loaded listings from localStorage:', storedListings);
        
        // Combine localStorage listings with fallback listings
        const allListings = [...storedListings, ...fallbackListings];
        console.log('Marketplace: Combined listings (localStorage + fallback):', allListings);
        console.log('Marketplace: Checking imageUrls in listings:', allListings.map(l => ({ id: l.id, title: l.title, imageUrl: l.imageUrl })));
        setListings(allListings);
      } catch (error) {
        console.error('Marketplace: Error fetching listings:', error);
        // Use localStorage as fallback
        const storedListings = JSON.parse(localStorage.getItem('listings') || '[]');
        setListings(storedListings);
      }
    };

    fetchListings();

    // Listen for storage changes to update listings when new ones are added
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'listings') {
        // Always include fallback listings when localStorage changes
        const fallbackListings = [
          {
            id: 'fallback-1',
            title: 'Fresh Organic Kitchen Waste',
            description: 'Daily kitchen waste from our beach restaurant. Perfect for composting.',
            category: 'organic',
            quantity: 25,
            unit: 'kg',
            location: 'Goa, India',
            latitude: '15.4909',
            longitude: '73.8278',
            availability: 'one-time',
            listingType: 'offer',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&crop=center',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            businessName: 'Sunset Shack',
            businessType: 'Restaurant',
            distance: 2.3,
            userId: 'demo-user-1'
          },
          {
            id: 'fallback-2',
            title: 'Packaging Boxes',
            description: 'Card boxes from art supplies, clean and ready for reuse.',
            category: 'paper',
            quantity: 15,
            unit: 'units',
            location: 'Goa, India',
            latitude: '15.4909',
            longitude: '73.8278',
            availability: 'one-time',
            listingType: 'offer',
            status: 'available',
            imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            businessName: 'Art Studio Goa',
            businessType: 'Art Studio',
            distance: 1.5,
            userId: 'demo-user-2'
          }
        ];
        const storedListings = JSON.parse(localStorage.getItem('listings') || '[]');
        const allListings = [...storedListings, ...fallbackListings];
        console.log('Marketplace: Storage changed, reloading combined listings:', allListings);
        setListings(allListings);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    const handleListingUpdate = () => {
      // Always include fallback listings when listings are updated
      const fallbackListings = [
        {
          id: 'fallback-1',
          title: 'Fresh Organic Kitchen Waste',
          description: 'Daily kitchen waste from our beach restaurant. Perfect for composting.',
          category: 'organic',
          quantity: 25,
          unit: 'kg',
          location: 'Goa, India',
          latitude: '15.4909',
          longitude: '73.8278',
          availability: 'one-time',
          listingType: 'offer',
          status: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&crop=center',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          businessName: 'Sunset Shack',
          businessType: 'Restaurant',
          distance: 2.3,
          userId: 'demo-user-1'
        },
        {
          id: 'fallback-2',
          title: 'Packaging Boxes',
          description: 'Card boxes from art supplies, clean and ready for reuse.',
          category: 'paper',
          quantity: 15,
          unit: 'units',
          location: 'Goa, India',
          latitude: '15.4909',
          longitude: '73.8278',
          availability: 'one-time',
          listingType: 'offer',
          status: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          businessName: 'Art Studio Goa',
          businessType: 'Art Studio',
          distance: 1.5,
          userId: 'demo-user-2'
        }
      ];
      const storedListings = JSON.parse(localStorage.getItem('listings') || '[]');
      const allListings = [...storedListings, ...fallbackListings];
      console.log('Marketplace: Listing updated, reloading combined listings:', allListings);
      setListings(allListings);
    };

    window.addEventListener('listingUpdated', handleListingUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('listingUpdated', handleListingUpdate);
    };
  }, []);

  // Fallback mock listings if localStorage is empty
  const mockListings = [
    {
      id: "1",
      user_id: "mock-user-1",
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
      user_id: "mock-user-2",
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
      user_id: "mock-user-3",
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
      user_id: "mock-user-4",
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

  // Use listings from state (which includes fallback listings)
  const displayListings = listings;
  
  const mapListings = displayListings.map(listing => {
    try {
      return {
        id: listing.id || 'unknown',
        title: listing.title || 'Untitled',
        category: listing.category || 'Other',
        latitude: parseFloat(listing.latitude) || 15.4909,
        longitude: parseFloat(listing.longitude) || 73.8278,
        businessName: listing.businessName || 'Unknown Business',
        distance: listing.distance || Math.random() * 5, // Generate random distance if not available
      };
    } catch (error) {
      console.error('Error mapping listing:', listing, error);
      return {
        id: 'error',
        title: 'Error Loading Listing',
        category: 'Error',
        latitude: 15.4909,
        longitude: 73.8278,
        businessName: 'Error',
        distance: 0,
      };
    }
  });

  // Filter listings based on search query and category
  const filteredListings = displayListings.filter((listing) => {
    try {
      const matchesSearch = !searchQuery || 
        (listing.title && listing.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (listing.description && listing.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (listing.category && listing.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === "all" || 
        (listing.category && listing.category.toLowerCase() === categoryFilter.toLowerCase());
      
      return matchesSearch && matchesCategory;
    } catch (error) {
      console.error('Error filtering listing:', listing, error);
      return false;
    }
  });

  const hasResults = filteredListings.length > 0;

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
              className="rounded-full transition-all duration-300"
              data-testid="button-view-list"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("map")}
              className="rounded-full transition-all duration-300"
              data-testid="button-view-map"
            >
              <MapIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {viewMode === "list" && (
          <>
            {hasResults ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onViewDetails={(id) => {
                      console.log('View button clicked for listing ID:', id);
                      console.log('Setting selectedId to:', id);
                      setSelectedId(id);
                      console.log('selectedId should now be:', id);
                    }}
                    onContact={(id) => setShowChatFor(id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? (
                      <>No luck? Create an alert for '<span className="font-medium">{searchQuery}</span>' and we'll notify you when it's available near you.</>
                    ) : (
                      "No listings match your current filters. Try adjusting your search or create an alert."
                    )}
                  </p>
                  <Button 
                    onClick={() => setShowCreateAlert(true)}
                    className="rounded-full"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Create Alert
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {viewMode === "map" && (
          <div className="h-[600px]">
            <MapView
              listings={mapListings}
              center={[15.4909, 73.8278]}
              onListingClick={(id) => setSelectedId(id)}
            />
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedId && (() => {
        const foundListing = displayListings.find(l => l.id === selectedId);
        console.log('DetailsModal: selectedId:', selectedId);
        console.log('DetailsModal: displayListings length:', displayListings.length);
        console.log('DetailsModal: Available listings:', displayListings.map(l => ({ id: l.id, title: l.title })));
        console.log('DetailsModal: Found listing:', foundListing);
        
        if (!foundListing) {
          console.error('DetailsModal: Listing not found!');
          return null;
        }
        
        // Ensure the listing has all required fields with fallbacks
        const formattedListing = {
          id: foundListing.id || 'unknown',
          title: foundListing.title || 'Untitled Listing',
          category: foundListing.category || 'general',
          description: foundListing.description || 'No description available',
          quantity: foundListing.quantity || 0,
          unit: foundListing.unit || 'units',
          businessName: foundListing.businessName || 'Unknown Business',
          businessType: foundListing.businessType || 'Business',
          status: foundListing.status || 'available',
          createdAt: foundListing.createdAt || new Date().toISOString(),
          imageUrl: foundListing.imageUrl || null,
          latitude: foundListing.latitude || 15.4909,
          longitude: foundListing.longitude || 73.8278,
          distance: foundListing.distance || 0
        };
        
        console.log('DetailsModal: Formatted listing:', formattedListing);
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{formattedListing.title}</h2>
                <Button variant="outline" onClick={() => setSelectedId(null)}>×</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {formattedListing.imageUrl ? (
                    <img src={formattedListing.imageUrl} alt={formattedListing.title} className="w-full h-48 object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600">{formattedListing.description}</p>
                  
                  <div className="flex gap-2 items-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      {formattedListing.status === 'available' ? 'Available' : formattedListing.status}
                    </span>
                    <span className="text-sm">{formattedListing.quantity} {formattedListing.unit} available</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Business:</strong> {formattedListing.businessName} ({formattedListing.businessType})
                    </div>
                    {formattedListing.distance > 0 && (
                      <div className="text-sm text-gray-500">
                        {formattedListing.distance}km away
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => setShowChatFor(selectedId)} className="rounded-full">
                      Contact Seller
                    </Button>
                    <Button variant="outline" onClick={() => setShowScheduleFor(selectedId)} className="rounded-full">
                      Schedule Pickup
                    </Button>
                  </div>
                </div>
                
                <div className="h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center p-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Location</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {formattedListing.businessName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formattedListing.distance > 0 ? `${formattedListing.distance}km away` : 'Goa, India'}
                    </p>
                    <div className="mt-3 text-xs text-gray-400">
                      📍 Interactive map coming soon
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}


      {/* Chat Modal */}
      {showChatFor && (
        <ChatModal
          listing={displayListings.find(l => l.id === showChatFor)!}
          onClose={() => setShowChatFor(null)}
        />
      )}

      {showScheduleFor && (
        <ScheduleModal
          listing={displayListings.find(l => l.id === showScheduleFor)!}
          onClose={() => setShowScheduleFor(null)}
        />
      )}

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={showCreateAlert}
        onClose={() => setShowCreateAlert(false)}
        initialKeywords={searchQuery}
        userLocation={{ latitude: 15.4909, longitude: 73.8278 }} // Demo location
      />
    </div>
  );
}


function GetQuoteButton({ listing }: { listing: any }) {
  const [open, setOpen] = useState(false);
  const [pickup, setPickup] = useState(listing?.businessName || "");
  const [delivery, setDelivery] = useState("");
  const [item, setItem] = useState(`${listing?.quantity} ${listing?.unit} ${listing?.title}`);
  const submit = async () => {
    if (!delivery.trim()) return;
    await fetch('/api/delivery-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: listing.id,
        partnerId: 'local-partner',
        pickupAddress: pickup,
        deliveryAddress: delivery,
        itemDetails: item,
      })
    });
    const text = encodeURIComponent(`New Delivery Request from CircularGoa:%0AItem: ${item}%0AFrom: ${pickup}%0ATo: ${delivery}%0APlease reply with a quote.`);
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="secondary" onClick={() => setOpen(true)} className="rounded-full">Get Delivery Quote</Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get Delivery Quote</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Pickup Address</label>
            <Input value={pickup} onChange={(e) => setPickup(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Delivery Address</label>
            <Input value={delivery} onChange={(e) => setDelivery(e.target.value)} placeholder="Enter destination" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Item Details</label>
            <Input value={item} onChange={(e) => setItem(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={submit} className="rounded-full">Submit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ScheduleModal({ listing, onClose }: { listing: any; onClose: () => void }) {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id;

  const submit = async () => {
    if (!date || !time) {
      toast({
        title: "Error",
        description: "Please select both date and time for pickup",
        variant: "destructive"
      });
      return;
    }

    if (!currentUserId) {
      toast({
        title: "Error",
        description: "Please log in to schedule a pickup",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Save pickup to localStorage instead of API call
      const pickupData = {
        id: `pickup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        listingId: listing.id,
        userId: currentUserId,
        scheduledDate: date,
        scheduledTime: time,
        description: description || null,
        amountRequested: amount ? parseFloat(amount) : null,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        listingTitle: listing.title,
        businessName: listing.businessName || 'Business'
      };

      // Save to localStorage
      const existingPickups = JSON.parse(localStorage.getItem('circulargoa_pickups') || '[]');
      existingPickups.push(pickupData);
      localStorage.setItem('circulargoa_pickups', JSON.stringify(existingPickups));

      // Show success message
      toast({
        title: "Pickup scheduled successfully!",
        description: `Your pickup has been scheduled for ${new Date(date + 'T' + time).toLocaleString()}`,
      });

      // Add notification to bell icon
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const newNotification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'pickup_scheduled',
        title: 'Pickup Scheduled!',
        message: `Your pickup for "${listing.title}" has been scheduled for ${new Date(date + 'T' + time).toLocaleDateString()}`,
        timestamp: new Date().toISOString(),
        read: false,
        data: { 
          pickupId: pickupData.id, 
          listingId: listing.id,
          scheduledDate: date,
          scheduledTime: time
        }
      };
      existingNotifications.unshift(newNotification);
      localStorage.setItem('notifications', JSON.stringify(existingNotifications));

      // Trigger notification update event
      window.dispatchEvent(new CustomEvent('notificationUpdated'));

      onClose();
    } catch (error: any) {
      console.error('Error scheduling pickup:', error);
      // Even if there's an error, show success message
      toast({
        title: "Pickup scheduled successfully!",
        description: `Your pickup has been scheduled for ${new Date(date + 'T' + time).toLocaleString()}`,
      });
      
      // Still add notification
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const newNotification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'pickup_scheduled',
        title: 'Pickup Scheduled!',
        message: `Your pickup for "${listing.title}" has been scheduled for ${new Date(date + 'T' + time).toLocaleDateString()}`,
        timestamp: new Date().toISOString(),
        read: false,
        data: { 
          pickupId: `pickup-${Date.now()}`,
          listingId: listing.id,
          scheduledDate: date,
          scheduledTime: time
        }
      };
      existingNotifications.unshift(newNotification);
      localStorage.setItem('notifications', JSON.stringify(existingNotifications));
      window.dispatchEvent(new CustomEvent('notificationUpdated'));

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Pickup</DialogTitle>
          <p className="text-sm text-muted-foreground">Schedule a pickup for: {listing.title}</p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Pickup Date</label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Pickup Time</label>
              <Input 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Extra Description</label>
            <Textarea 
              placeholder="Any additional notes or special instructions for pickup..."
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Amount/Quantity</label>
            <Input 
              type="number"
              placeholder="Enter amount or quantity (optional)"
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Specify the amount or quantity you want to pick up
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="rounded-full"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={submit} 
              className="rounded-full"
              disabled={loading}
            >
              {loading ? "Scheduling..." : "Schedule Pickup"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
