import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, StarIcon, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";
import { useReviews } from "@/hooks/useReviews";

interface ReviewsTabProps {
  userId: string;
  businessName: string;
}

export default function ReviewsTab({ userId, businessName }: ReviewsTabProps) {
  const { getPublishedReviews, getAverageRating } = useReviews();
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Load reviews from localStorage
  useEffect(() => {
    const publishedReviews = getPublishedReviews(userId);
    setReviews(publishedReviews);
    
    const avgRating = getAverageRating(userId);
    setAverageRating(avgRating);
    setTotalReviews(publishedReviews.length);
  }, [userId, getPublishedReviews, getAverageRating]);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    if (rating >= 2.5) return "text-orange-600";
    return "text-red-600";
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 3.5) return "Good";
    if (rating >= 2.5) return "Fair";
    return "Poor";
  };

  // No loading state needed for localStorage

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Customer Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalReviews > 0 ? (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getRatingColor(averageRating)}`}>
                    {averageRating}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(averageRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getRatingText(averageRating)}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium">
                    {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Based on verified transactions
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No Reviews Yet</p>
                <p className="text-sm text-muted-foreground">
                  Reviews will appear here after completed transactions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Individual Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Reviews</h3>
          {reviews.map((review: any, index: number) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{review.reviewerBusinessName || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground">
                          {review.reviewerBusinessType || 'Business'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {review.publicComment && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      "{review.publicComment}"
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
