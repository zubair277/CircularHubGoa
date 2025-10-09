# CircularGoa - Circular Economy Platform

## Project Overview
CircularGoa is a B2B circular economy marketplace platform designed for small tourism businesses in Goa to exchange waste and surplus materials. The platform promotes sustainability by enabling businesses to turn waste into resources.

## Tech Stack
- **Frontend**: React + TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Express.js, TypeScript
- **Storage**: In-memory storage (MemStorage) - can be replaced with PostgreSQL
- **Maps**: React-Leaflet for geolocation features
- **Charts**: Recharts for analytics
- **Animations**: Framer Motion

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities
│   │   └── hooks/          # Custom hooks
├── server/
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage interface
│   └── utils.ts            # Helper functions
├── shared/
│   └── schema.ts           # Shared TypeScript types
```

## Completed Features ✅

### 1. Data Schema & Backend
- ✅ Comprehensive database schema for all features
  - Users, Listings, Claims, Alerts, Messages, Ratings
  - Pickups, Events, Forum Posts/Replies, Notifications, Badges
- ✅ Complete storage interface with CRUD operations
- ✅ RESTful API routes for all features
- ✅ Smart alert matching system
- ✅ Notification system with real-time triggers

### 2. Resource Listing System
- ✅ Full CRUD API for listings
- ✅ Support for "offer" and "request" types
- ✅ Category-based filtering (Organic, Glass, Plastic, Metal, Textile)
- ✅ Quantity tracking with units (kg, liters, units)
- ✅ Geolocation support (latitude/longitude)
- ✅ Status management (available, claimed, completed)

### 3. Claims System
- ✅ API for creating and managing claims
- ✅ Claim status workflow (pending, accepted, rejected, completed)
- ✅ Automatic notifications to listing owners
- ✅ Message support for claims

### 4. Smart Alerts
- ✅ Category-based alert preferences
- ✅ Distance radius filtering
- ✅ Notification types (email, in-app)
- ✅ Alert matching algorithm
- ✅ Active/inactive toggle support

### 5. Messaging System
- ✅ One-to-one messaging between businesses
- ✅ Unread message tracking
- ✅ Message history between users
- ✅ Claim-related messaging

### 6. Ratings & Feedback
- ✅ Star rating system (1-5)
- ✅ Written reviews
- ✅ Per-claim rating support

### 7. Pickup Scheduling
- ✅ Schedule pickup with date/time
- ✅ Status tracking (scheduled, completed, cancelled)
- ✅ Waste weight and value tracking
- ✅ Pickup reminders via notifications

### 8. Events & Workshops
- ✅ Event creation and management
- ✅ Upcoming events filtering
- ✅ Organizer tracking
- ✅ Participant limits

### 9. Community Forum
- ✅ Forum posts by category
- ✅ Reply system
- ✅ Categories: composting, upcycling, success stories

### 10. Notifications System
- ✅ Multiple notification types
- ✅ Unread tracking
- ✅ Related resource linking
- ✅ User-specific notifications

### 11. Badges System
- ✅ Badge awarding system
- ✅ Badge types: green_champion, top_recycler
- ✅ Achievement tracking

### 12. Dashboard Analytics
- ✅ User stats API
- ✅ Community stats API  
- ✅ CO₂ savings calculation
- ✅ Waste diversion metrics
- ✅ Value saved tracking

## UI/Design Features ✅
- ✅ Tropical Goa color palette (Coral Pink, Eco Green, Aqua Blue)
- ✅ Glass-morphism navbar with backdrop blur
- ✅ Pill-shaped buttons with smooth animations
- ✅ Rounded cards with hover effects
- ✅ Gradient backgrounds
- ✅ Responsive mobile-first design
- ✅ Dark mode support

## Existing Pages
- ✅ Home - Landing page with hero section
- ✅ Dashboard - User metrics and charts
- ✅ Marketplace - Listings grid/map view
- ✅ Add Listing - Create new listings
- ✅ Profile - User/business profile

## API Endpoints

### Listings
- `POST /api/listings` - Create listing (with alert matching)
- `GET /api/listings` - Get all listings (with type filter)
- `GET /api/listings/user/:userId` - Get user's listings
- `GET /api/listings/:id` - Get single listing
- `PATCH /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Claims
- `POST /api/claims` - Create claim
- `GET /api/claims/listing/:listingId` - Get claims for listing
- `GET /api/claims/user/:userId` - Get user's claims
- `PATCH /api/claims/:id/status` - Update claim status

### Alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts/user/:userId` - Get user alerts
- `PATCH /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:user1Id/:user2Id` - Get conversation
- `GET /api/messages/user/:userId` - Get all user messages
- `PATCH /api/messages/:id/read` - Mark as read
- `GET /api/messages/unread/count/:userId` - Get unread count

### Ratings
- `POST /api/ratings` - Create rating
- `GET /api/ratings/user/:userId` - Get user ratings
- `GET /api/ratings/claim/:claimId` - Get claim rating

### Pickups
- `POST /api/pickups` - Schedule pickup
- `GET /api/pickups/claim/:claimId` - Get pickup by claim
- `GET /api/pickups/user/:userId` - Get user pickups
- `PATCH /api/pickups/:id/status` - Update pickup status

### Events
- `POST /api/events` - Create event
- `GET /api/events` - Get all events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/:id` - Get single event

### Forum
- `POST /api/forum/posts` - Create post
- `GET /api/forum/posts` - Get all posts (with category filter)
- `GET /api/forum/posts/:id` - Get single post
- `POST /api/forum/replies` - Create reply
- `GET /api/forum/posts/:postId/replies` - Get post replies

### Notifications
- `POST /api/notifications` - Create notification
- `GET /api/notifications/user/:userId` - Get user notifications
- `GET /api/notifications/unread/:userId` - Get unread notifications
- `GET /api/notifications/unread/count/:userId` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read

### Badges
- `POST /api/badges` - Award badge
- `GET /api/badges/user/:userId` - Get user badges

### Stats
- `GET /api/stats/user/:userId` - Get user stats
- `GET /api/stats/community` - Get community stats

## Remaining Frontend Tasks 🚧

### High Priority
1. **Enhance Marketplace Page**
   - Connect to backend API
   - Add claim modal
   - Implement offer/request toggle
   - Add distance calculation display

2. **Build My Alerts Page**
   - Category selection checkboxes
   - Distance radius slider
   - Notification type selection
   - Active alerts management

3. **Build Chat System**
   - Real-time messaging UI
   - Chat list with unread indicators
   - Message bubbles with timestamps
   - User avatars

4. **Add Notifications Center**
   - Bell icon in navbar
   - Unread count badge
   - Notification dropdown
   - Toast notifications

5. **Enhance Dashboard**
   - Community stats section
   - Badge display
   - Animated counters
   - Top contributors leaderboard

### Medium Priority
6. **Knowledge Hub Page (/hub)**
   - Best practices articles
   - Workshop calendar
   - Community forum UI
   - Resource library

7. **Pickup Scheduling UI**
   - Calendar modal
   - Time picker
   - Pickup status tracking
   - Completion tracking

8. **Rating System UI**
   - Star rating component
   - Review form
   - Rating display on profiles

### Authentication Note ⚠️
Current implementation uses basic storage without authentication middleware. For production:
- Add Supabase Auth integration
- Implement JWT tokens
- Add route protection
- Add user session management

## Environment Setup
```bash
npm install
npm run dev
```

## Key Files Modified
- `shared/schema.ts` - Complete data models
- `server/storage.ts` - Storage implementation
- `server/routes.ts` - API endpoints
- `server/utils.ts` - Helper utilities
- `client/src/index.css` - Design system colors
- `design_guidelines.md` - UI/UX guidelines

## Color Palette
- **Primary (Eco Green)**: `145 35% 56%`
- **Secondary (Coral Pink)**: `351 73% 95%`
- **Accent (Aqua Blue)**: `183 38% 76%`
- **Background (Sand Beige)**: `45 100% 97%`
- **Foreground (Charcoal)**: `233 21% 21%`

## Next Steps for Development
1. Connect frontend marketplace to backend API
2. Implement claim modal and workflow
3. Build alerts management page
4. Create chat interface
5. Add notifications bell with real-time updates
6. Build knowledge hub page
7. Add authentication with Supabase
8. Implement pickup scheduling UI
9. Add rating/review components
10. Create community dashboard

## Notes
- Using in-memory storage for development
- Can switch to PostgreSQL by updating storage implementation
- All API routes are RESTful and follow consistent patterns
- Alert matching runs automatically on new listings
- CO₂ calculations use simple multiplier (1kg waste = 2.5kg CO₂ saved)
