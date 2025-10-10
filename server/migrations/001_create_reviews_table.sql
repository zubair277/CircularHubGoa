-- Migration: Create reviews table for mutual business rating system
-- Run this migration to add the reviews table to your database

CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    transaction_id VARCHAR(255) NOT NULL,
    reviewer_id VARCHAR(255) NOT NULL,
    reviewee_id VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    public_comment TEXT,
    private_feedback TEXT,
    submitted BOOLEAN NOT NULL DEFAULT FALSE,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate reviews
    UNIQUE KEY unique_transaction_reviewer (transaction_id, reviewer_id),
    
    -- Indexes for performance
    INDEX idx_reviews_reviewee (reviewee_id),
    INDEX idx_reviews_published (published),
    INDEX idx_reviews_expiry (expiry_date),
    INDEX idx_reviews_transaction (transaction_id)
);

-- Add comments for documentation
ALTER TABLE reviews COMMENT = 'Mutual business rating and review system';
