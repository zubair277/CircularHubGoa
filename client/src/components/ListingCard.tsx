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
        {listing.imageUrl && (
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
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
