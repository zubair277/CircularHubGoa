import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Star, X } from "lucide-react";
import { motion } from "framer-motion";
import { useReviews } from "@/hooks/useReviews";
import LeaveReviewModal from "./LeaveReviewModal";

interface ReviewBannerProps {
  transactionId: string;
  reviewerId: string;
  revieweeId: string;
  revieweeBusinessName: string;
  onDismiss?: () => void;
}

export default function ReviewBanner({
  transactionId,
  reviewerId,
  revieweeId,
  revieweeBusinessName,
  onDismiss,
}: ReviewBannerProps) {
  const { createTransactionReviews } = useReviews();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Create pending reviews when banner is shown
  React.useEffect(() => {
    if (!isDismissed) {
      createTransactionReviews(transactionId, reviewerId, revieweeId);
    }
  }, [transactionId, reviewerId, revieweeId, createTransactionReviews, isDismissed]);

  const handleReviewClick = () => {
    setIsModalOpen(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleReviewSubmitted = () => {
    setIsModalOpen(false);
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="mb-6"
      >
        <Alert className="border-primary/20 bg-primary/5">
          <Star className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-primary">
                How was your exchange with {revieweeBusinessName}?
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Leave a review to help build trust in the community
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                size="sm"
                onClick={handleReviewClick}
                className="bg-primary hover:bg-primary/90"
              >
                <Star className="w-4 h-4 mr-1" />
                Leave Review
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Review Modal */}
      <LeaveReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionId={transactionId}
        reviewerId={reviewerId}
        revieweeId={revieweeId}
        revieweeBusinessName={revieweeBusinessName}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </>
  );
}
