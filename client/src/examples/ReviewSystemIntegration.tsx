import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle } from "lucide-react";
import ReviewsTab from "@/components/ReviewsTab";
import PendingReviewsWidget from "@/components/PendingReviewsWidget";
import ReviewBanner from "@/components/ReviewBanner";
import { useReviews } from "@/hooks/useReviews";

/**
 * Example integration of the Review System
 * 
 * This file shows how to integrate the review system components
 * into your existing pages like Dashboard, Profile, and My Listings.
 */

// Example Dashboard Integration
export function DashboardWithReviews() {
  const { createTransactionReviews } = useReviews();
  const [showReviewBanner, setShowReviewBanner] = useState(true);
  const currentUser = { id: "user-123", businessName: "Eco Solutions" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Review Banner - Show when transaction is completed */}
      {showReviewBanner && (
        <ReviewBanner
          transactionId="transaction-456"
          reviewerId={currentUser.id}
          revieweeId="user-789"
          revieweeBusinessName="Green Tech Solutions"
          onDismiss={() => setShowReviewBanner(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">Transaction Completed</p>
                    <p className="text-sm text-muted-foreground">
                      Exchange with Green Tech Solutions
                    </p>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
                {/* More activity items... */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Pending Reviews */}
        <div className="space-y-6">
          <PendingReviewsWidget userId={currentUser.id} />
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Exchanges</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">4.8</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Example Profile Page Integration
export function ProfileWithReviews() {
  const currentUser = { id: "user-123", businessName: "Eco Solutions" };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{currentUser.businessName}</h1>
        <p className="text-muted-foreground">Business Profile</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Business details and information...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsTab userId={currentUser.id} businessName={currentUser.businessName} />
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your current listings...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Example My Listings Integration
export function MyListingsWithReviewTrigger() {
  const { createTransactionReviews } = useReviews();
  const [completedTransactions, setCompletedTransactions] = useState([
    {
      id: "transaction-456",
      listingTitle: "Organic Waste Collection",
      partnerName: "Green Tech Solutions",
      partnerId: "user-789",
      completedAt: "2024-01-15",
      needsReview: true,
    },
    {
      id: "transaction-789",
      listingTitle: "Glass Bottles",
      partnerName: "Recycle Hub",
      partnerId: "user-456",
      completedAt: "2024-01-10",
      needsReview: false,
    },
  ]);

  const handleMarkComplete = (transactionId: string) => {
    // Create pending review records in localStorage
    const transaction = completedTransactions.find(t => t.id === transactionId);
    if (transaction) {
      createTransactionReviews(transactionId, "user-123", transaction.partnerId);
    }
    console.log(`Marking transaction ${transactionId} as complete`);
    
    // Show review banner for demonstration
    setCompletedTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, needsReview: true }
          : t
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">My Listings</h1>

      <div className="space-y-6">
        {completedTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{transaction.listingTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    Partner: {transaction.partnerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Completed: {transaction.completedAt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {transaction.needsReview ? (
                    <ReviewBanner
                      transactionId={transaction.id}
                      reviewerId="user-123"
                      revieweeId={transaction.partnerId}
                      revieweeBusinessName={transaction.partnerName}
                      onDismiss={() => setCompletedTransactions(prev => 
                        prev.map(t => 
                          t.id === transaction.id 
                            ? { ...t, needsReview: false }
                            : t
                        )
                      )}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Completed</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkComplete(transaction.id)}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Dashboard Integration:
 *    - Add PendingReviewsWidget to your dashboard sidebar
 *    - Show ReviewBanner when transactions are completed
 * 
 * 2. Profile Integration:
 *    - Add ReviewsTab to your profile page tabs
 *    - Display average rating and individual reviews
 * 
 * 3. Transaction Completion:
 *    - When marking a transaction as "Complete":
 *      a. Update transaction status in database
 *      b. Create two Review records (one for each participant)
 *      c. Show ReviewBanner to prompt for reviews
 * 
 * 4. API Integration:
 *    - Use the provided API routes:
 *      - POST /api/reviews (create/update review)
 *      - GET /api/reviews/:userId (get published reviews)
 *      - GET /api/reviews/pending (get pending reviews)
 *      - PATCH /api/reviews/publish (publish expired reviews)
 * 
 * 5. Database Setup:
 *    - Run migration to create the 'reviews' table
 *    - The table includes all necessary fields for the mutual review system
 */
