import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useReviews } from "@/hooks/useReviews";
import LeaveReviewModal from "./LeaveReviewModal";

interface PendingReviewsWidgetProps {
  userId: string;
}

export default function PendingReviewsWidget({ userId }: PendingReviewsWidgetProps) {
  const { getPendingReviews } = useReviews();
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);

  // Load pending reviews from localStorage
  React.useEffect(() => {
    const reviews = getPendingReviews(userId);
    setPendingReviews(reviews);
  }, [userId, getPendingReviews]);

  const handleReviewClick = (review: any) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    // Refresh the pending reviews list
    const reviews = getPendingReviews(userId);
    setPendingReviews(reviews);
    setSelectedReview(null);
    setIsModalOpen(false);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isExpiringSoon = (expiryDate: string) => {
    return getDaysUntilExpiry(expiryDate) <= 3;
  };

  // No loading state needed for localStorage

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Pending Reviews
            {pendingReviews.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingReviews.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReviews.length === 0 ? (
            <div className="text-center py-6">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No pending reviews</p>
              <p className="text-xs text-muted-foreground mt-1">
                Complete transactions to leave reviews
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviews.map((review: any, index: number) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">
                          {review.revieweeBusinessName || 'Business'}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {review.revieweeBusinessType || 'Business'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {getDaysUntilExpiry(review.expiryDate) === 0
                            ? "Expires today"
                            : `${getDaysUntilExpiry(review.expiryDate)} days left`}
                        </span>
                        {isExpiringSoon(review.expiryDate) && (
                          <AlertCircle className="w-3 h-3 text-orange-500" />
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleReviewClick(review)}
                      className="ml-3"
                    >
                      Review
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedReview && (
        <LeaveReviewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReview(null);
          }}
          transactionId={selectedReview.transactionId}
          reviewerId={userId}
          revieweeId={selectedReview.revieweeId}
          revieweeBusinessName={selectedReview.revieweeBusinessName || 'Business'}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  );
}
