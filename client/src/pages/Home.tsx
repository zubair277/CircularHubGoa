import { useState } from "react";
import { Link } from "wouter";
import HeroSection from "@/components/HeroSection";
import ListingCard from "@/components/ListingCard";
import AuthModal from "@/components/AuthModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Users, TrendingDown, ArrowRight } from "lucide-react";

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const featuredListings = [
    {
      id: "1",
      title: "Fresh Organic Kitchen Waste",
      category: "Organic",
      description: "Daily kitchen waste from our beachside restaurant",
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
      description: "Assorted glass bottles from hotel bar",
      quantity: 50,
      unit: "units",
      distance: 4.1,
      businessName: "Beach Paradise Resort",
      businessType: "Hotel",
      status: "available" as const,
      createdAt: new Date().toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1594498257673-9f36b767286c?w=400&h=300&fit=crop",
      latitude: 15.5100,
      longitude: 73.8200,
    },
    {
      id: "3",
      title: "Cardboard Boxes",
      category: "Paper",
      description: "Sturdy boxes from art supplies",
      quantity: 30,
      unit: "pieces",
      distance: 1.5,
      businessName: "Goa Art Gallery",
      businessType: "Artist",
      status: "available" as const,
      createdAt: new Date().toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1553620591-d0e8ba5d3f5a?w=400&h=300&fit=crop",
      latitude: 15.4800,
      longitude: 73.8400,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        onGetStarted={() => setAuthModalOpen(true)}
        onLearnMore={() => console.log('Learn more')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why CircularGoa?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join Goa's growing community of sustainable businesses working together to reduce waste and create value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reduce Costs</h3>
              <p className="text-muted-foreground">
                Save money by exchanging materials instead of disposing them
              </p>
            </CardContent>
          </Card>

          <Card className="text-center rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Network</h3>
              <p className="text-muted-foreground">
                Connect with nearby businesses and create partnerships
              </p>
            </CardContent>
          </Card>

          <Card className="text-center rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Go Green</h3>
              <p className="text-muted-foreground">
                Contribute to Goa's sustainability and reduce your carbon footprint
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Featured Listings</h2>
            <Link href="/marketplace">
              <Button variant="outline" className="gap-2 rounded-full">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onViewDetails={(id) => console.log('View:', id)}
                onContact={() => setAuthModalOpen(true)}
              />
            ))}
          </div>
        </div>
      </div>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onLogin={(email, password) => console.log('Login:', { email, password })}
        onRegister={(data) => console.log('Register:', data)}
        onGoogleAuth={() => console.log('Google auth')}
      />
    </div>
  );
}
