import { useState, useEffect, useCallback } from 'react';

export interface Review {
  id: string;
  transactionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  publicComment?: string;
  privateFeedback?: string;
  submitted: boolean;
  published: boolean;
  expiryDate: string;
  createdAt: string;
  updatedAt?: string;
  // Additional fields for display
  reviewerBusinessName?: string;
  reviewerBusinessType?: string;
  revieweeBusinessName?: string;
  revieweeBusinessType?: string;
}

const REVIEWS_STORAGE_KEY = 'circulargoa_reviews';

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  // Load reviews from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setReviews(parsed);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  }, []);

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch (error) {
      console.error('Failed to save reviews:', error);
    }
  }, [reviews]);

  // Create a new review
  const createReview = useCallback((reviewData: Omit<Review, 'id' | 'createdAt' | 'submitted' | 'published'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      submitted: false,
      published: false,
    };

    setReviews(prev => [newReview, ...prev]);
    return newReview.id;
  }, []);

  // Submit a review (update existing or create new)
  const submitReview = useCallback((reviewData: {
    transactionId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    publicComment?: string;
    privateFeedback?: string;
  }) => {
    const existingReview = reviews.find(r => 
      r.transactionId === reviewData.transactionId && 
      r.reviewerId === reviewData.reviewerId
    );

    if (existingReview) {
      // Update existing review
      setReviews(prev => prev.map(review => 
        review.id === existingReview.id
          ? {
              ...review,
              rating: reviewData.rating,
              publicComment: reviewData.publicComment,
              privateFeedback: reviewData.privateFeedback,
              submitted: true,
              updatedAt: new Date().toISOString(),
            }
          : review
      ));
    } else {
      // Create new review
      const newReview: Review = {
        id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        transactionId: reviewData.transactionId,
        reviewerId: reviewData.reviewerId,
        revieweeId: reviewData.revieweeId,
        rating: reviewData.rating,
        publicComment: reviewData.publicComment,
        privateFeedback: reviewData.privateFeedback,
        submitted: true,
        published: false,
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        createdAt: new Date().toISOString(),
      };

      setReviews(prev => [newReview, ...prev]);
    }

    // Check if both reviews are now submitted and publish them
    checkAndPublishReviews(reviewData.transactionId);
  }, [reviews]);

  // Check if both reviews are submitted and publish them
  const checkAndPublishReviews = useCallback((transactionId: string) => {
    const transactionReviews = reviews.filter(r => r.transactionId === transactionId);
    const submittedReviews = transactionReviews.filter(r => r.submitted);
    
    if (submittedReviews.length >= 2) {
      // Both reviews submitted, publish them
      setReviews(prev => prev.map(review => 
        review.transactionId === transactionId
          ? { ...review, published: true }
          : review
      ));
    }
  }, [reviews]);

  // Get published reviews for a user
  const getPublishedReviews = useCallback((userId: string) => {
    return reviews.filter(r => r.revieweeId === userId && r.published);
  }, [reviews]);

  // Get pending reviews for a user
  const getPendingReviews = useCallback((userId: string) => {
    const now = new Date();
    return reviews.filter(r => 
      r.reviewerId === userId && 
      !r.submitted && 
      new Date(r.expiryDate) > now
    );
  }, [reviews]);

  // Get average rating for a user
  const getAverageRating = useCallback((userId: string) => {
    const publishedReviews = getPublishedReviews(userId);
    if (publishedReviews.length === 0) return 0;
    
    const totalRating = publishedReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / publishedReviews.length) * 10) / 10; // Round to 1 decimal
  }, [getPublishedReviews]);

  // Create reviews for a completed transaction
  const createTransactionReviews = useCallback((transactionId: string, buyerId: string, sellerId: string) => {
    const expiryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    
    // Create review for buyer to rate seller
    const buyerReview: Review = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transactionId,
      reviewerId: buyerId,
      revieweeId: sellerId,
      rating: 0, // Will be set when user submits
      submitted: false,
      published: false,
      expiryDate,
      createdAt: new Date().toISOString(),
    };

    // Create review for seller to rate buyer
    const sellerReview: Review = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transactionId,
      reviewerId: sellerId,
      revieweeId: buyerId,
      rating: 0, // Will be set when user submits
      submitted: false,
      published: false,
      expiryDate,
      createdAt: new Date().toISOString(),
    };

    setReviews(prev => [...prev, buyerReview, sellerReview]);
  }, []);

  // Auto-publish expired reviews
  const publishExpiredReviews = useCallback(() => {
    const now = new Date();
    setReviews(prev => prev.map(review => {
      if (!review.published && new Date(review.expiryDate) <= now) {
        return { ...review, published: true };
      }
      return review;
    }));
  }, []);

  // Delete a review
  const deleteReview = useCallback((reviewId: string) => {
    setReviews(prev => prev.filter(review => review.id !== reviewId));
  }, []);

  return {
    reviews,
    createReview,
    submitReview,
    getPublishedReviews,
    getPendingReviews,
    getAverageRating,
    createTransactionReviews,
    publishExpiredReviews,
    deleteReview,
  };
}
