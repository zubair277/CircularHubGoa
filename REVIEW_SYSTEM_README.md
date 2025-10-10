# 🔄 Mutual Business Rating & Review System

A comprehensive review system for CircularGoa that enables mutual business ratings when transactions are completed. Both parties can rate each other, with reviews becoming visible only when both have submitted theirs or after 14 days.

## 🎯 Features

### ✅ Core Functionality
- **Mutual Reviews**: Both parties rate each other after transaction completion
- **Privacy Protection**: Reviews only published when both submitted OR after 14 days
- **Star Rating System**: 1-5 star ratings with visual feedback
- **Public & Private Comments**: Public comments for community, private feedback for admins
- **Automatic Publishing**: Reviews auto-publish when both submitted or expired
- **Dashboard Integration**: Pending reviews widget and completion banners

### 🎨 UI Components
- **LeaveReviewModal**: Beautiful star rating interface with animations
- **ReviewsTab**: Business profile reviews with average ratings
- **PendingReviewsWidget**: Dashboard widget for review reminders
- **ReviewBanner**: Transaction completion notification banner

## 🗄️ Database Schema

### Reviews Table
```sql
CREATE TABLE reviews (
    id VARCHAR(255) PRIMARY KEY,
    transaction_id VARCHAR(255) NOT NULL,
    reviewer_id VARCHAR(255) NOT NULL,
    reviewee_id VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    public_comment TEXT,
    private_feedback TEXT,
    submitted BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT FALSE,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewee_id) REFERENCES users(id),
    UNIQUE KEY unique_transaction_reviewer (transaction_id, reviewer_id)
);
```

## 🚀 API Endpoints

### POST /api/reviews
Create or update a review for a transaction
```json
{
  "transactionId": "transaction-123",
  "reviewerId": "user-456",
  "revieweeId": "user-789",
  "rating": 5,
  "publicComment": "Great experience!",
  "privateFeedback": "Could improve communication"
}
```

### GET /api/reviews/:userId
Fetch all published reviews for a user (for profile display)
```json
[
  {
    "id": "review-123",
    "rating": 5,
    "public_comment": "Excellent service!",
    "created_at": "2024-01-15T10:30:00Z",
    "reviewer_business_name": "Eco Solutions",
    "reviewer_business_type": "Restaurant"
  }
]
```

### GET /api/reviews/pending?userId=:userId
Fetch reviews awaiting submission for the logged-in user
```json
[
  {
    "id": "review-456",
    "transaction_id": "transaction-789",
    "reviewee_business_name": "Green Tech",
    "expiry_date": "2024-01-29T10:30:00Z"
  }
]
```

### PATCH /api/reviews/publish
Cron/automated route to mark expired reviews as "published"

## 🎨 Frontend Components

### 1. LeaveReviewModal
```tsx
<LeaveReviewModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  transactionId="transaction-123"
  reviewerId="user-456"
  revieweeId="user-789"
  revieweeBusinessName="Green Tech Solutions"
  onReviewSubmitted={() => console.log('Review submitted!')}
/>
```

### 2. ReviewsTab
```tsx
<ReviewsTab 
  userId="user-123" 
  businessName="Eco Solutions" 
/>
```

### 3. PendingReviewsWidget
```tsx
<PendingReviewsWidget userId="user-123" />
```

### 4. ReviewBanner
```tsx
<ReviewBanner
  transactionId="transaction-456"
  reviewerId="user-123"
  revieweeId="user-789"
  revieweeBusinessName="Green Tech Solutions"
  onDismiss={() => setShowBanner(false)}
/>
```

## 🔧 Integration Guide

### 1. Dashboard Integration
```tsx
// Add to your dashboard
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Main dashboard content */}
  </div>
  <div className="space-y-6">
    <PendingReviewsWidget userId={currentUser.id} />
  </div>
</div>
```

### 2. Profile Page Integration
```tsx
// Add to your profile tabs
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="reviews">Reviews</TabsTrigger>
  </TabsList>
  
  <TabsContent value="reviews">
    <ReviewsTab userId={user.id} businessName={user.businessName} />
  </TabsContent>
</Tabs>
```

### 3. Transaction Completion Flow
```tsx
// When marking transaction as complete
const handleMarkComplete = async (transactionId: string) => {
  // 1. Update transaction status
  await updateTransactionStatus(transactionId, 'completed');
  
  // 2. Create review records for both parties
  await createReviewRecords(transactionId, buyerId, sellerId);
  
  // 3. Show review banner
  setShowReviewBanner(true);
};
```

## 🎯 Business Logic

### Review Creation Flow
1. **Transaction Completed**: User marks transaction as "Complete"
2. **Create Review Records**: Two review records created (one for each party)
3. **Show Banner**: ReviewBanner appears prompting for review
4. **User Submits Review**: Rating and comments saved
5. **Check Publishing**: If both reviews submitted → publish immediately
6. **Auto-Publish**: After 14 days, publish regardless of submission status

### Privacy Rules
- **Mutual Privacy**: Reviews only visible when both submitted OR 14 days passed
- **Public Comments**: Visible to community on business profiles
- **Private Feedback**: Only visible to platform moderators
- **Admin Access**: Full review access for dispute resolution

## 🎨 Styling & UX

### Design Principles
- **Consistent Spacing**: Tailwind spacing and typography
- **Smooth Animations**: Framer Motion for modal entry/exit
- **Visual Feedback**: Star ratings with hover states
- **Accessibility**: Proper labels and keyboard navigation
- **Responsive**: Mobile-first design approach

### Color Scheme
- **Primary**: Brand colors for buttons and highlights
- **Success**: Green for positive ratings
- **Warning**: Orange for expiring reviews
- **Error**: Red for validation errors
- **Muted**: Gray for secondary information

## 🔧 Setup Instructions

### 1. Database Migration
```bash
# Run the migration
mysql -u username -p database_name < server/migrations/001_create_reviews_table.sql
```

### 2. Install Dependencies
```bash
# Frontend dependencies (already included)
npm install framer-motion @tanstack/react-query

# Backend dependencies (already included)
npm install drizzle-orm mysql2
```

### 3. Environment Variables
```env
# Add to your .env file
DATABASE_URL=mysql://username:password@localhost:3306/circulargoa
```

### 4. Component Integration
```tsx
// Import components
import LeaveReviewModal from '@/components/LeaveReviewModal';
import ReviewsTab from '@/components/ReviewsTab';
import PendingReviewsWidget from '@/components/PendingReviewsWidget';
import ReviewBanner from '@/components/ReviewBanner';
```

## 🚀 Advanced Features

### 1. Email Notifications
```tsx
// Add email notification when transaction completed
const sendReviewReminder = async (userId: string, businessName: string) => {
  await fetch('/api/notifications/email', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      type: 'review_reminder',
      subject: 'Rate your exchange',
      message: `How was your exchange with ${businessName}?`
    })
  });
};
```

### 2. Admin Dashboard
```tsx
// Create admin route for review management
app.get('/admin/reviews', async (req, res) => {
  // Return all reviews with admin access
  const reviews = await db.select().from(reviews);
  res.json(reviews);
});
```

### 3. Weighted Ratings
```tsx
// Verified businesses get weighted ratings
const calculateWeightedRating = (reviews: Review[]) => {
  return reviews.reduce((sum, review) => {
    const weight = review.reviewer_verified ? 1.5 : 1.0;
    return sum + (review.rating * weight);
  }, 0) / reviews.reduce((sum, review) => {
    return sum + (review.reviewer_verified ? 1.5 : 1.0);
  }, 0);
};
```

## 🧪 Testing

### Component Testing
```tsx
// Test review modal
import { render, screen, fireEvent } from '@testing-library/react';
import LeaveReviewModal from '@/components/LeaveReviewModal';

test('submits review with rating', async () => {
  render(<LeaveReviewModal isOpen={true} />);
  
  // Click 5th star
  fireEvent.click(screen.getByRole('button', { name: /star 5/i }));
  
  // Submit review
  fireEvent.click(screen.getByRole('button', { name: /submit review/i }));
  
  // Verify API call
  expect(mockFetch).toHaveBeenCalledWith('/api/reviews', {
    method: 'POST',
    body: expect.stringContaining('"rating":5')
  });
});
```

### API Testing
```tsx
// Test review creation
test('creates review successfully', async () => {
  const response = await request(app)
    .post('/api/reviews')
    .send({
      transactionId: 'test-123',
      reviewerId: 'user-1',
      revieweeId: 'user-2',
      rating: 5
    });
    
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
});
```

## 📊 Analytics & Monitoring

### Review Metrics
- **Average Rating**: Calculate weighted average per business
- **Review Count**: Total published reviews per user
- **Response Rate**: Percentage of completed transactions with reviews
- **Time to Review**: Average time from completion to review submission

### Performance Monitoring
- **API Response Times**: Monitor review creation/retrieval performance
- **Database Queries**: Optimize review queries for large datasets
- **User Engagement**: Track review submission rates and patterns

## 🔒 Security Considerations

### Data Protection
- **Input Validation**: Sanitize all review text inputs
- **Rate Limiting**: Prevent spam review submissions
- **Authentication**: Verify user identity for review creation
- **Authorization**: Ensure users can only review their own transactions

### Privacy Compliance
- **GDPR Compliance**: Allow users to delete their reviews
- **Data Retention**: Automatic cleanup of old review data
- **Audit Trail**: Log all review modifications for admin review

## 🎉 Success Metrics

### Key Performance Indicators
- **Review Submission Rate**: Target 80%+ of completed transactions
- **Average Rating**: Maintain 4.0+ platform average
- **User Satisfaction**: High ratings correlate with user retention
- **Community Trust**: Reviews build credibility and repeat usage

---

**Built with ❤️ for CircularGoa - Building a sustainable circular economy in Goa!**
