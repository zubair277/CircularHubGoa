import { useState } from "react";
import { Link } from "wouter";
import HeroSection from "@/components/HeroSection";
import ListingCard from "@/components/ListingCard";
import AuthModal from "@/components/AuthModal";
import DetailsModal from "@/components/DetailsModal";
import ChatModal from "@/components/ChatModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Users, TrendingDown, ArrowRight } from "lucide-react";

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [showChatFor, setShowChatFor] = useState<string | null>(null);

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
      quantity: 100,
      unit: "units",
      distance: 1.8,
      businessName: "Goa Art Studio",
      businessType: "Retail",
      status: "available" as const,
      createdAt: new Date().toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=300&fit=crop",
      latitude: 15.5000,
      longitude: 73.8300,
    },
  ];

  return (
    <div className="min-h-screen">
      <HeroSection 
        onGetStarted={() => setAuthModalOpen(true)}
        onLearnMore={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
      />
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Listings
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover materials from local businesses ready for exchange
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {featuredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onViewDetails={(id) => setSelectedListingId(id)}
                onContact={(id) => setShowChatFor(id)}
              />
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/marketplace">
                View All Listings
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join Goa's circular economy in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">List Your Materials</h3>
              <p className="text-gray-600">
                Post your surplus or waste materials with photos and details
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect & Exchange</h3>
              <p className="text-gray-600">
                Find businesses that need your materials and arrange pickup
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Circular Economy</h3>
              <p className="text-gray-600">
                Create sustainable business relationships and reduce waste
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose CircularGoa?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                    <Leaf className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Environmental Impact</h3>
                    <p className="text-gray-600">
                      Reduce landfill waste and promote sustainable practices in Goa
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                    <Users className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Local Community</h3>
                    <p className="text-gray-600">
                      Connect with local businesses and build stronger community ties
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                    <TrendingDown className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Cost Savings</h3>
                    <p className="text-gray-600">
                      Save on disposal costs and discover valuable materials for free
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 mb-6">
                Join hundreds of Goan businesses already participating in the circular economy
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/add-listing">Add Your First Listing</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/marketplace">Browse Marketplace</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onLogin={async (email, password) => {
          console.log('=== LOGIN STARTED ===');
          console.log('Login credentials:', { email, password: '***' });
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
            });

            console.log('Login response status:', response.status);
            const userData = await response.json();
            console.log('Login response data:', userData);

            if (response.ok) {
              console.log('Login successful, storing user data');
              localStorage.setItem('user', JSON.stringify(userData));
              window.dispatchEvent(new CustomEvent('userUpdated'));
              setAuthModalOpen(false);
              console.log('Redirecting to dashboard');
              window.location.href = '/dashboard';
            } else {
              console.error('Login failed:', userData);
              alert('Login failed: ' + (userData.error || 'Invalid credentials'));
            }
          } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
          }
        }}
        onRegister={async (data) => {
          console.log('=== REGISTRATION STARTED ===');
          console.log('Registration data:', data);
          try {
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: data.name,
                email: data.email,
                password: data.password,
                businessType: data.businessType,
                location: data.location,
                phone: data.phone
              }),
            });

            console.log('Registration response status:', response.status);
            const responseData = await response.json();
            console.log('Registration response data:', responseData);

            if (response.ok) {
              console.log('Registration successful, storing user data');
              localStorage.setItem('user', JSON.stringify(responseData));
              window.dispatchEvent(new CustomEvent('userUpdated'));
              setAuthModalOpen(false);
              console.log('Redirecting to dashboard');
              window.location.href = '/dashboard';
            } else {
              console.error('Registration failed:', responseData);
              alert('Registration failed: ' + (responseData.error || 'Unknown error'));
            }
          } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
          }
        }}
        onGoogleAuth={() => {
          console.log('Google auth');
          setAuthModalOpen(false);
        }}
      />

      {/* Details Modal */}
      {selectedListingId && (
        <DetailsModal
          listing={featuredListings.find(l => l.id === selectedListingId)!}
          onClose={() => setSelectedListingId(null)}
          onContact={() => setShowChatFor(selectedListingId)}
        />
      )}

      {/* Chat Modal */}
      {showChatFor && (
        <ChatModal
          listing={featuredListings.find(l => l.id === showChatFor)!}
          onClose={() => setShowChatFor(null)}
        />
      )}
    </div>
  );
}