import { MapPin, Calendar, Package } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface Listing {
  id: string;
  title: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  distance?: number;
  businessName: string;
  businessType: string;
  status: "available" | "reserved" | "completed";
  createdAt: string;
  imageUrl?: string;
  user_id?: string; // seller's user ID
}

interface ListingCardProps {
  listing: Listing;
  onViewDetails?: (id: string) => void;
  onContact?: (id: string) => void;
}

const statusConfig = {
  available: { label: "Available", className: "bg-primary/10 text-primary border-primary/20" },
  reserved: { label: "Reserved", className: "bg-chart-4/10 text-chart-4 border-chart-4/20" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground border-muted" },
};

const categoryColors: Record<string, string> = {
  organic: "bg-primary/10 text-primary",
  plastic: "bg-accent/10 text-accent",
  glass: "bg-chart-3/10 text-chart-3",
  paper: "bg-chart-4/10 text-chart-4",
  electronics: "bg-chart-2/10 text-chart-2",
};

export default function ListingCard({ listing, onViewDetails, onContact }: ListingCardProps) {
  const statusInfo = statusConfig[listing.status];
  const categoryColor = categoryColors[listing.category.toLowerCase()] || "bg-muted text-muted-foreground";

  return (
    <Card className="overflow-hidden rounded-2xl border bg-card/80 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/20" data-testid={`card-listing-${listing.id}`}>
      <div className="relative">
        {listing.imageUrl ? (
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
          </div>
        ) : (
          <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 via-accent/5 to-chart-3/5 flex items-center justify-center relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-16 h-16 bg-primary/20 rounded-full"></div>
              <div className="absolute top-8 right-8 w-12 h-12 bg-accent/20 rounded-full"></div>
              <div className="absolute bottom-6 left-8 w-8 h-8 bg-chart-3/20 rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-20 h-20 bg-primary/10 rounded-full"></div>
            </div>
            
            {/* Category icon */}
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
                {listing.category.toLowerCase() === 'organic' && (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
                {listing.category.toLowerCase() === 'plastic' && (
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )}
                {listing.category.toLowerCase() === 'paper' && (
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {listing.category.toLowerCase() === 'glass' && (
                  <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                {listing.category.toLowerCase() === 'electronics' && (
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                )}
                {!['organic', 'plastic', 'paper', 'glass', 'electronics'].includes(listing.category.toLowerCase()) && (
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
              </div>
              <p className="text-sm font-medium text-gray-600 capitalize">{listing.category}</p>
            </div>
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className={`${categoryColor} border`}>{listing.category}</Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={`${statusInfo.className} border`}>{statusInfo.label}</Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg leading-tight" data-testid={`text-title-${listing.id}`}>
          {listing.title}
        </h3>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3" data-testid={`text-description-${listing.id}`}>
          {listing.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium" data-testid={`text-quantity-${listing.id}`}>
            {listing.quantity} {listing.unit}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs bg-accent text-accent-foreground">
              {listing.businessName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span data-testid={`text-business-${listing.id}`}>{listing.businessName}</span>
          <span className="text-muted-foreground/60">•</span>
          <span className="text-xs">{listing.businessType}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex items-center justify-between gap-2 border-t bg-muted/30">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {listing.distance !== undefined ? (
            <>
              <MapPin className="w-4 h-4" />
              <span data-testid={`text-distance-${listing.id}`}>{listing.distance}km away</span>
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(listing.id)}
            className="rounded-full hover:shadow"
            data-testid={`button-view-${listing.id}`}
          >
            View
          </Button>
          {listing.status === "available" && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => onContact?.(listing.id)}
              className="rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              data-testid={`button-contact-${listing.id}`}
            >
              Contact
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
