import { useMemo, useState, useRef } from "react";
import { GoogleMap, MarkerF, InfoWindowF, useLoadScript, StandaloneSearchBox } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { MapPin, Search, X } from "lucide-react";
import React from "react";

// Keep libraries array stable to avoid reloading LoadScript.
const GOOGLE_LIBRARIES = ["places"] as const;
// Styling for the Google Map container
const mapContainerStyle: google.maps.MapOptions["styles"] = undefined;

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
  selectable?: boolean;
  onSelect?: (coords: { lat: number; lng: number }) => void;
}

// No-op placeholder: GoogleMap handles center updates via props

export default function MapView({
  listings,
  center = [15.4909, 73.8278],
  zoom = 12,
  onListingClick,
  selectable = false,
  onSelect,
}: MapViewProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  // Temporary one-time log to verify key is loaded from Vite envs
  if (typeof window !== "undefined" && !(window as any).__gmKeyLogged) {
    const masked = apiKey ? `${apiKey.slice(0, 6)}...(${apiKey.length})` : "<undefined>";
    console.log("[Maps] VITE_GOOGLE_MAPS_API_KEY:", masked);
    (window as any).__gmKeyLogged = true;
  }
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? "",
    libraries: GOOGLE_LIBRARIES as unknown as any,
  });

  const mapCenter = useMemo(() => ({ lat: center[0], lng: center[1] }), [center]);
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<{ title: string; address?: string } | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: false,
    clickableIcons: true,
    streetViewControl: false,
    mapTypeControl: false,
  }), []);

  const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
  };

  const onPlacesChanged = () => {
    const box = searchBoxRef.current;
    if (!box) return;
    const places = box.getPlaces();
    if (!places || places.length === 0) return;
    const place = places[0];
    const location = place.geometry?.location;
    if (!location) return;
    const latLng = { lat: location.lat(), lng: location.lng() };
    setSelectedPosition(latLng);
    setSelectedInfo({ title: place.name || "Selected place", address: place.formatted_address });
  };

  if (!apiKey) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden border flex items-center justify-center text-sm text-muted-foreground">
        Missing VITE_GOOGLE_MAPS_API_KEY
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden border flex items-center justify-center text-sm text-destructive">
        Failed to load Google Maps
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden border flex items-center justify-center text-sm text-muted-foreground">
        Loading map…
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border" data-testid="map-container">
      <div className="absolute inset-x-3 top-3 z-10 flex justify-center pointer-events-none">
        <div className="w-full max-w-xl sm:max-w-2xl pointer-events-auto">
          <StandaloneSearchBox onLoad={onSearchBoxLoad} onPlacesChanged={onPlacesChanged}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search places, addresses, or businesses"
                className="w-full rounded-full border bg-background/90 backdrop-blur px-10 pr-12 py-2.5 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {(
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    if (inputRef.current) inputRef.current.value = "";
                    setSelectedPosition(null);
                    setSelectedInfo(null);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-7 w-7 rounded-full text-muted-foreground hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </StandaloneSearchBox>
        </div>
      </div>
      <GoogleMap
        center={mapCenter}
        zoom={zoom}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        options={mapOptions}
        onClick={(e) => {
          if (!selectable) return;
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          if (lat == null || lng == null) return;
          const coords = { lat, lng };
          setSelectedPosition(coords);
          setSelectedInfo({ title: "Selected location" });
          onSelect?.(coords);
        }}
      >
        {selectedPosition && (
          <MarkerF position={selectedPosition}>
            <InfoWindowF position={selectedPosition}>
              <div className="p-2 min-w-[220px]">
                <h3 className="font-semibold text-sm mb-1">{selectedInfo?.title}</h3>
                {selectedInfo?.address && (
                  <p className="text-xs text-muted-foreground mb-2">{selectedInfo.address}</p>
                )}
              </div>
            </InfoWindowF>
          </MarkerF>
        )}
        {listings.map((listing) => (
          <MarkerF
            key={listing.id}
            position={{ lat: listing.latitude, lng: listing.longitude }}
            title={listing.title}
          >
            <InfoWindowF position={{ lat: listing.latitude, lng: listing.longitude }}>
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
            </InfoWindowF>
          </MarkerF>
        ))}
      </GoogleMap>
    </div>
  );
}
