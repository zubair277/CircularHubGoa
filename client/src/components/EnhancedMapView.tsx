import { useMemo, useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  useLoadScript,
  MarkerClustererF,
  CircleF,
  PolylineF,
  HeatmapLayerF,
} from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Layers, Route as RouteIcon, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import React from "react";

const GOOGLE_LIBRARIES = ["places", "visualization", "geometry"] as const;

interface MapListing {
  id: string;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  businessName: string;
  distance?: number;
  quantity?: number;
}

interface EnhancedMapViewProps {
  listings: MapListing[];
  center?: [number, number];
  zoom?: number;
  onListingClick?: (id: string) => void;
  selectable?: boolean;
  onSelect?: (coords: { lat: number; lng: number }) => void;
  showControls?: boolean;
}

export default function EnhancedMapView({
  listings,
  center = [15.4909, 73.8278],
  zoom = 12,
  onListingClick,
  selectable = false,
  onSelect,
  showControls = true,
}: EnhancedMapViewProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? "",
    libraries: GOOGLE_LIBRARIES as unknown as any,
  });

  const mapCenter = useMemo(() => ({ lat: center[0], lng: center[1] }), [center]);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5000); // in meters
  const [showRadius, setShowRadius] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  const [selectedListingsForRoute, setSelectedListingsForRoute] = useState<string[]>([]);
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      streetViewControl: false,
      mapTypeControl: true,
    }),
    []
  );

  // Convert listings to markers
  const markers = useMemo(() => {
    return listings.map((listing) => ({
      position: { lat: listing.latitude, lng: listing.longitude },
      listing,
    }));
  }, [listings]);

  // Prepare heatmap data
  const heatmapData = useMemo(() => {
    if (!isLoaded) return [];
    return listings.map(
      (listing) =>
        new google.maps.LatLng(listing.latitude, listing.longitude)
    );
  }, [listings, isLoaded]);

  // Calculate route between selected listings
  useEffect(() => {
    if (selectedListingsForRoute.length < 2) {
      setRoutePath([]);
      return;
    }

    const selectedPoints = selectedListingsForRoute
      .map((id) => listings.find((l) => l.id === id))
      .filter(Boolean)
      .map((l) => ({ lat: l!.latitude, lng: l!.longitude }));

    setRoutePath(selectedPoints);
  }, [selectedListingsForRoute, listings]);

  const handleMarkerClick = (listing: MapListing) => {
    setSelectedListing(listing.id);
    if (onListingClick) {
      onListingClick(listing.id);
    }
  };

  const toggleListingForRoute = (listingId: string) => {
    setSelectedListingsForRoute((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  };

  const clearRoute = () => {
    setSelectedListingsForRoute([]);
    setRoutePath([]);
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!selectable) return;
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (lat == null || lng == null) return;
    const coords = { lat, lng };
    setSelectedPosition(coords);
    if (onSelect) {
      onSelect(coords);
    }
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
    <div className="relative w-full h-full rounded-lg overflow-hidden border">
      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur rounded-lg shadow-lg p-4 space-y-3 max-w-xs">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Map Controls</Label>
          </div>

          {/* Clustering Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="clustering" className="text-sm">
              Cluster Markers
            </Label>
            <Switch
              id="clustering"
              checked={showClusters}
              onCheckedChange={setShowClusters}
            />
          </div>

          {/* Heatmap Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="heatmap" className="text-sm">
              Show Heatmap
            </Label>
            <Switch
              id="heatmap"
              checked={showHeatmap}
              onCheckedChange={setShowHeatmap}
            />
          </div>

          {/* Search Radius Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="radius" className="text-sm">
              Search Radius
            </Label>
            <Switch
              id="radius"
              checked={showRadius}
              onCheckedChange={setShowRadius}
            />
          </div>

          {/* Radius Slider */}
          {showRadius && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Radius: {(searchRadius / 1000).toFixed(1)} km
              </Label>
              <Slider
                value={[searchRadius]}
                onValueChange={(value) => setSearchRadius(value[0])}
                min={1000}
                max={50000}
                step={1000}
                className="w-full"
              />
            </div>
          )}

          {/* Route Planning */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm flex items-center gap-2">
                <RouteIcon className="h-4 w-4" />
                Route Planning
              </Label>
              {selectedListingsForRoute.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearRoute}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {selectedListingsForRoute.length} stops selected
            </Badge>
            {selectedListingsForRoute.length >= 2 && (
              <p className="text-xs text-muted-foreground mt-1">
                Route displayed on map
              </p>
            )}
          </div>
        </div>
      )}

      {/* Route Info Panel */}
      {selectedListingsForRoute.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-background/95 backdrop-blur rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Route Stops</h4>
            <Button variant="ghost" size="sm" onClick={clearRoute}>
              Clear
            </Button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {selectedListingsForRoute.map((id, index) => {
              const listing = listings.find((l) => l.id === id);
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 text-xs p-1 bg-accent/50 rounded"
                >
                  <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="truncate">{listing?.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <GoogleMap
        center={mapCenter}
        zoom={zoom}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        options={mapOptions}
        onClick={handleMapClick}
        onLoad={(map) => (mapRef.current = map)}
      >
        {/* Search Radius Circle */}
        {showRadius && (
          <CircleF
            center={mapCenter}
            radius={searchRadius}
            options={{
              fillColor: "#4CAF50",
              fillOpacity: 0.1,
              strokeColor: "#4CAF50",
              strokeOpacity: 0.4,
              strokeWeight: 2,
            }}
          />
        )}

        {/* Heatmap Layer */}
        {showHeatmap && heatmapData.length > 0 && (
          <HeatmapLayerF
            data={heatmapData}
            options={{
              radius: 40,
              opacity: 0.6,
            }}
          />
        )}

        {/* Markers with Clustering */}
        {!showHeatmap && showClusters ? (
          <MarkerClustererF
            options={{
              imagePath:
                "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
              gridSize: 60,
              maxZoom: 15,
            }}
          >
            {(clusterer) => (
              <>
                {markers.map(({ position, listing }) => (
                  <MarkerF
                    key={listing.id}
                    position={position}
                    clusterer={clusterer}
                    onClick={() => handleMarkerClick(listing)}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: selectedListingsForRoute.includes(listing.id) ? 10 : 8,
                      fillColor: selectedListingsForRoute.includes(listing.id)
                        ? "#f59e0b"
                        : getCategoryColor(listing.category),
                      fillOpacity: 1,
                      strokeColor: "#fff",
                      strokeWeight: 2,
                    }}
                  />
                ))}
              </>
            )}
          </MarkerClustererF>
        ) : (
          !showHeatmap &&
          markers.map(({ position, listing }) => (
            <MarkerF
              key={listing.id}
              position={position}
              onClick={() => handleMarkerClick(listing)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: selectedListingsForRoute.includes(listing.id) ? 10 : 8,
                fillColor: selectedListingsForRoute.includes(listing.id)
                  ? "#f59e0b"
                  : getCategoryColor(listing.category),
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              }}
            />
          ))
        )}

        {/* Route Polyline */}
        {routePath.length >= 2 && (
          <PolylineF
            path={routePath}
            options={{
              strokeColor: "#f59e0b",
              strokeOpacity: 0.8,
              strokeWeight: 4,
              geodesic: true,
            }}
          />
        )}

        {/* Info Window */}
        {selectedListing && (
          <InfoWindowF
            position={
              markers.find((m) => m.listing.id === selectedListing)?.position ||
              mapCenter
            }
            onCloseClick={() => setSelectedListing(null)}
          >
            <div className="p-2 min-w-[200px]">
              {(() => {
                const listing = listings.find((l) => l.id === selectedListing);
                if (!listing) return null;
                return (
                  <>
                    <h3 className="font-semibold text-sm mb-1">{listing.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {listing.businessName}
                    </p>
                    <Badge variant="secondary" className="text-xs mb-2">
                      {listing.category}
                    </Badge>
                    {listing.quantity && (
                      <p className="text-xs mb-2">Quantity: {listing.quantity}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleListingForRoute(listing.id)}
                        className="text-xs"
                      >
                        {selectedListingsForRoute.includes(listing.id)
                          ? "Remove from Route"
                          : "Add to Route"}
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          </InfoWindowF>
        )}

        {/* Selected Position Marker */}
        {selectedPosition && (
          <MarkerF
            position={selectedPosition}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}

// Helper function to get color based on category
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    organic: "#22c55e",
    glass: "#06b6d4",
    plastic: "#f59e0b",
    metal: "#6b7280",
    paper: "#8b5cf6",
    textile: "#ec4899",
    electronics: "#3b82f6",
    wood: "#92400e",
    other: "#64748b",
  };
  return colors[category.toLowerCase()] || "#64748b";
}
