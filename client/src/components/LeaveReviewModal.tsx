import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, StarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReviews } from "@/hooks/useReviews";
import { motion } from "framer-motion";

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  reviewerId: string;
  revieweeId: string;
  revieweeBusinessName: string;
  onReviewSubmitted?: () => void;
}

export default function LeaveReviewModal({
  isOpen,
  onClose,
  transactionId,
  reviewerId,
  revieweeId,
  revieweeBusinessName,
  onReviewSubmitted,
}: LeaveReviewModalProps) {
  const { toast } = useToast();
  const { submitReview } = useReviews();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [publicComment, setPublicComment] = useState("");
  const [privateFeedback, setPrivateFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit review to localStorage
      submitReview({
        transactionId,
        reviewerId,
        revieweeId,
        rating,
        publicComment: publicComment.trim() || undefined,
        privateFeedback: privateFeedback.trim() || undefined,
      });

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback. Your review has been saved.",
      });

      // Reset form
      setRating(0);
      setPublicComment("");
      setPrivateFeedback("");
      
      onReviewSubmitted?.();
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setPublicComment("");
      setPrivateFeedback("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Rate Your Experience
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            How was your exchange with <span className="font-medium">{revieweeBusinessName}</span>?
          </p>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Overall Rating *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-colors hover:scale-110"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground"
              >
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </motion.p>
            )}
          </div>

          {/* Public Comment */}
          <div className="space-y-2">
            <Label htmlFor="publicComment" className="text-base font-medium">
              Public Comment
            </Label>
            <Textarea
              id="publicComment"
              placeholder="Share your experience with the community (optional)"
              value={publicComment}
              onChange={(e) => setPublicComment(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {publicComment.length}/500 characters
            </p>
          </div>

          {/* Private Feedback */}
          <div className="space-y-2">
            <Label htmlFor="privateFeedback" className="text-base font-medium">
              Private Feedback
            </Label>
            <Textarea
              id="privateFeedback"
              placeholder="Share private feedback for platform improvement (optional)"
              value={privateFeedback}
              onChange={(e) => setPrivateFeedback(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              {privateFeedback.length}/300 characters • Only visible to platform moderators
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
