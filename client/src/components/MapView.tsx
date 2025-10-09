import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

const customIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapListing {
  id: string;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  businessName: string;
  distance?: number;
}

interface MapViewProps {
  listings: MapListing[];
  center?: [number, number];
  zoom?: number;
  onListingClick?: (id: string) => void;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export default function MapView({
  listings,
  center = [15.4909, 73.8278],
  zoom = 12,
  onListingClick,
}: MapViewProps) {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden border" data-testid="map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <MapController center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm mb-1">{listing.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{listing.category}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3" />
                  <span>{listing.businessName}</span>
                  {listing.distance && <span>• {listing.distance}km</span>}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => onListingClick?.(listing.id)}
                  data-testid={`button-map-view-${listing.id}`}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
