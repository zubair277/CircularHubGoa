# 🚀 CircularHub API Documentation

## Base URL
```
http://localhost:5000/api
```

## 📋 Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Fresh Bites Restaurant",
  "email": "maria@freshbites.goa",
  "password": "password123",
  "businessType": "Restaurant",
  "location": "Panaji, Goa",
  "phone": "+91 9876543210",
  "latitude": 15.4909,
  "longitude": 73.8278
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "maria@freshbites.goa",
  "password": "password123"
}
```

### Logout
```http
POST /api/auth/logout
```

## 👥 Users

### Get All Users
```http
GET /api/users
```

### Get User by ID
```http
GET /api/users/{userId}
```

## 📝 Listings

### Get All Listings
```http
GET /api/listings?category=Organic&listingType=offer&location=Goa&limit=20&offset=0
```

### Create Listing
```http
POST /api/listings
Content-Type: application/json

{
  "userId": "user-id",
  "title": "Fresh Vegetable Scraps",
  "description": "Daily fresh vegetable scraps from our kitchen",
  "category": "Organic",
  "quantity": 5.5,
  "unit": "kg",
  "location": "Panaji, Goa",
  "latitude": 15.4909,
  "longitude": 73.8278,
  "availability": "recurring",
  "listingType": "offer",
  "imageUrl": "https://example.com/image.jpg"
}
```

### Get Listing by ID
```http
GET /api/listings/{listingId}
```

### Update Listing
```http
PUT /api/listings/{listingId}
Content-Type: application/json

{
  "userId": "user-id",
  "title": "Updated Title",
  "description": "Updated description"
}
```

### Delete Listing
```http
DELETE /api/listings/{listingId}
Content-Type: application/json

{
  "userId": "user-id"
}
```

## 📋 Claims

### Create Claim
```http
POST /api/claims
Content-Type: application/json

{
  "listingId": "listing-id",
  "buyerId": "buyer-user-id",
  "sellerId": "seller-user-id",
  "message": "I'm interested in this item"
}
```

### Get User Claims
```http
GET /api/claims?userId={userId}&status=pending
```

### Update Claim Status
```http
PUT /api/claims/{claimId}/status
Content-Type: application/json

{
  "status": "accepted",
  "userId": "seller-user-id"
}
```

## 👥 Communities

### Get All Communities
```http
GET /api/communities
```

### Create Community
```http
POST /api/communities
Content-Type: application/json

{
  "name": "Goa Composting Community",
  "description": "A community for composting enthusiasts",
  "category": "Environment",
  "creatorId": "user-id",
  "imageUrl": "https://example.com/image.jpg"
}
```

### Get Community by ID
```http
GET /api/communities/{communityId}
```

### Join Community
```http
POST /api/communities/{communityId}/join
Content-Type: application/json

{
  "userId": "user-id"
}
```

### Get Community Messages
```http
GET /api/communities/{communityId}/messages
```

### Send Community Message
```http
POST /api/communities/{communityId}/messages
Content-Type: application/json

{
  "authorId": "user-id",
  "content": "Hello everyone!"
}
```

## 🚨 Alerts

### Get User Alerts
```http
GET /api/alerts?userId={userId}
```

### Create Alert
```http
POST /api/alerts
Content-Type: application/json

{
  "userId": "user-id",
  "keywords": "glass bottles wine jars",
  "categoryId": "Glass",
  "radiusKm": 25,
  "userLatitude": 15.5909,
  "userLongitude": 73.8158
}
```

### Delete Alert
```http
DELETE /api/alerts/{alertId}
Content-Type: application/json

{
  "userId": "user-id"
}
```

## 🔔 Notifications

### Get User Notifications
```http
GET /api/notifications?userId={userId}
```

### Mark Notification as Read
```http
PUT /api/notifications/{notificationId}/read
```

## 📊 Response Format

### Success Response
```json
{
  "id": "unique-id",
  "data": { /* requested data */ },
  "message": "Success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## 🏷️ Data Models

### User
```typescript
{
  id: string
  email: string
  businessName: string
  businessType: string
  location: string
  latitude?: number
  longitude?: number
  phone?: string
  avatar?: string
  verified: boolean
  createdAt: Date
}
```

### Listing
```typescript
{
  id: string
  userId: string
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  location: string
  latitude: number
  longitude: number
  availability: "one-time" | "recurring"
  listingType: "offer" | "request"
  status: "available" | "claimed" | "completed"
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}
```

### Community
```typescript
{
  id: string
  name: string
  description: string
  imageUrl?: string
  category?: string
  creatorId: string
  createdAt: Date
}
```

### Claim
```typescript
{
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  message?: string
  status: "pending" | "accepted" | "rejected" | "completed"
  createdAt: Date
  updatedAt: Date
}
```

## 🔍 Query Parameters

### Listings
- `category`: Filter by category (Organic, Glass, Plastic, etc.)
- `listingType`: Filter by type (offer, request)
- `location`: Search in location text
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

### Claims
- `userId`: Required - user's claims
- `status`: Filter by status (pending, accepted, etc.)

## 🚀 Getting Started

1. **Start the server**: `npm run dev`
2. **Open Prisma Studio**: `npm run db:studio`
3. **Seed sample data**: `npm run db:seed`
4. **Test the API**: Use the sample requests above

## 🌐 Frontend Integration

```javascript
// Example: Fetch listings
const response = await fetch('/api/listings?category=Organic')
const listings = await response.json()

// Example: Create listing
const newListing = await fetch('/api/listings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    title: 'My Listing',
    // ... other fields
  })
})
```

Your CircularHub API is now fully functional! 🎉