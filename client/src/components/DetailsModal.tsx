import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MapView from "@/components/MapView";

interface Listing {
  id: string;
  title: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  businessName: string;
  businessType: string;
  status: string;
  createdAt: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface DetailsModalProps {
  listing: Listing;
  onClose: () => void;
  onContact: () => void;
  onSchedule?: () => void;
}

export default function DetailsModal({ listing, onClose, onContact, onSchedule }: DetailsModalProps) {
  console.log('DetailsModal: Rendering with listing:', listing);
  
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{listing.title || 'Listing Details'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {listing.imageUrl ? (
              <img src={listing.imageUrl} alt={listing.title || 'Listing image'} className="w-full h-64 object-cover rounded-lg" />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">{listing.description || 'No description available'}</p>
            <div className="flex gap-2 items-center">
              <Badge variant="outline">{listing.status === 'available' ? 'Available' : (listing.status || 'Available')}</Badge>
              <span className="text-sm">{listing.quantity || 0} {listing.unit || 'units'} available</span>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Business:</strong> {listing.businessName || 'Unknown Business'} ({listing.businessType || 'Business'})
              </div>
              {listing.distance && listing.distance > 0 && (
                <div className="text-sm text-muted-foreground">
                  {listing.distance}km away
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={onContact} className="rounded-full">Contact Seller</Button>
              {onSchedule && (
                <Button variant="outline" onClick={onSchedule} className="rounded-full">Schedule Pickup</Button>
              )}
            </div>
          </div>
          <div className="h-72">
            <MapView
              listings={[{
                id: listing.id || 'unknown',
                title: listing.title || 'Listing',
                category: listing.category || 'general',
                latitude: listing.latitude || 15.4909,
                longitude: listing.longitude || 73.8278,
                businessName: listing.businessName || 'Business',
                distance: listing.distance || 0,
              }]}
              center={[listing.latitude || 15.4909, listing.longitude || 73.8278]}
              zoom={14}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
