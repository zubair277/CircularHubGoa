import ListingCard from '../ListingCard';

export default function ListingCardExample() {
  const mockListing = {
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
  };

  return (
    <div className="p-8 bg-background">
      <div className="max-w-sm">
        <ListingCard
          listing={mockListing}
          onViewDetails={(id) => console.log('View details:', id)}
          onContact={(id) => console.log('Contact:', id)}
        />
      </div>
    </div>
  );
}
