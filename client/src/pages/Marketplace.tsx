import { useState } from "react";
import ListingCard from "@/components/ListingCard";
import MapView from "@/components/MapView";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showChatFor, setShowChatFor] = useState<string | null>(null);
  const [showScheduleFor, setShowScheduleFor] = useState<string | null>(null);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onViewDetails={(id) => setSelectedId(id)}
                onContact={(id) => setShowChatFor(id)}
              />
            ))}
          </div>
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
      {selectedId && (
        <DetailsModal
          listing={mockListings.find(l => l.id === selectedId)!}
          onClose={() => setSelectedId(null)}
          onContact={() => setShowChatFor(selectedId)}
          onSchedule={() => setShowScheduleFor(selectedId)}
        />
      )}

      {/* Chat Modal */}
      {showChatFor && (
        <ChatModal
          listing={mockListings.find(l => l.id === showChatFor)!}
          onClose={() => setShowChatFor(null)}
        />
      )}

      {showScheduleFor && (
        <ScheduleModal
          listing={mockListings.find(l => l.id === showScheduleFor)!}
          onClose={() => setShowScheduleFor(null)}
        />
      )}
    </div>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Input } from "@/components/ui/input";

function DetailsModal({ listing, onClose, onContact, onSchedule }: { listing: any; onClose: () => void; onContact: () => void; onSchedule: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{listing.title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {listing.imageUrl && (
              <img src={listing.imageUrl} alt={listing.title} className="w-full h-64 object-cover rounded-lg" />
            )}
            <p className="text-sm text-muted-foreground">{listing.description}</p>
            <div className="flex gap-2 items-center">
              <Badge variant="outline">{listing.status === 'available' ? 'Available' : listing.status}</Badge>
              <span className="text-sm">{listing.quantity} {listing.unit} available</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={onContact} className="rounded-full">Contact Seller</Button>
              <Button variant="outline" onClick={onSchedule} className="rounded-full">Schedule Pickup</Button>
              <GetQuoteButton listing={listing} />
            </div>
          </div>
          <div className="h-72">
            <MapView
              listings={[{
                id: listing.id,
                title: listing.title,
                category: listing.category,
                latitude: listing.latitude,
                longitude: listing.longitude,
                businessName: listing.businessName,
                distance: listing.distance,
              }]}
              center={[listing.latitude, listing.longitude]}
              zoom={14}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChatModal({ listing, onClose }: { listing: any; onClose: () => void }) {
  const [messages, setMessages] = useState<{ from: 'me' | 'seller'; text: string }[]>([
    { from: 'seller', text: `Hi! ${listing.title} is available.` }
  ]);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: 'me', text }]);
    setText("");
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Message {listing.businessName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-80 border rounded-lg">
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[80%] px-3 py-2 rounded-xl ${m.from === 'me' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex gap-2">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." className="h-10 resize-none" />
            <Button onClick={send} className="shrink-0 rounded-full">Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
  const [note, setNote] = useState<string>("");
  const { toast } = useToast();

  const submit = () => {
    if (!date || !time) return;
    console.log("Pickup scheduled:", { listingId: listing.id, date, time, note });
    toast({
      title: "Pickup scheduled",
      description: `We notified ${listing.businessName}. ${new Date(date + 'T' + time).toLocaleString()}`,
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Pickup</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-muted-foreground">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <Textarea placeholder="Pickup notes (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
            <Button onClick={submit} className="rounded-full">Confirm</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
