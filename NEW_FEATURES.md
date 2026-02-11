# 🎉 New Features Documentation

This document outlines the newly implemented features and how to use them.

## 📋 Table of Contents

1. [Dark Mode Improvements](#dark-mode-improvements)
2. [Advanced Search & Filters](#advanced-search--filters)
3. [Interactive Map Enhancements](#interactive-map-enhancements)
4. [Media Gallery with Lightbox](#media-gallery-with-lightbox)
5. [QR Code Generator](#qr-code-generator)
6. [Expiry Timer](#expiry-timer)
7. [API Routes](#api-routes)

---

## 🌓 Dark Mode Improvements

### Features
- ✨ Smooth transitions when switching themes
- 🖥️ System preference detection (auto theme)
- 💾 Theme persistence across sessions
- 🎨 Three theme options: Light, Dark, System

### Usage

```tsx
import { useTheme } from "@/components/ThemeProvider";

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // Set specific theme
  setTheme("dark");
  setTheme("light");
  setTheme("system"); // Follows system preference
  
  // Get current resolved theme (either "light" or "dark")
  console.log(resolvedTheme);
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
    </div>
  );
}
```

### Theme Toggle Component

The enhanced `ThemeToggle` component now shows a dropdown menu with all three options:

```tsx
import ThemeToggle from "@/components/ThemeToggle";

function Navbar() {
  return (
    <nav>
      <ThemeToggle />
    </nav>
  );
}
```

---

## 🔍 Advanced Search & Filters

### Features
- 🏷️ Multi-select category filters
- 📊 Quantity range slider
- 📅 Date range picker
- 💾 Search preferences persistence
- 🕒 Search history with autocomplete
- 🏷️ Active filters display with badges

### Usage

```tsx
import AdvancedSearch from "@/components/AdvancedSearch";

function Marketplace() {
  const handleFilterChange = (filters) => {
    console.log("Filters:", filters);
    // filters = {
    //   query: "string",
    //   categories: ["organic", "glass"],
    //   quantityRange: [0, 500],
    //   dateRange: { from: Date, to: Date },
    //   listingType: ["offer"],
    //   availability: ["one-time"]
    // }
  };

  return (
    <AdvancedSearch
      onFilterChange={handleFilterChange}
      initialFilters={{
        categories: ["organic"],
        quantityRange: [0, 100]
      }}
    />
  );
}
```

### API Endpoint

```typescript
POST /api/listings/search

Body:
{
  "query": "plastic",
  "categories": ["plastic", "glass"],
  "quantityRange": [0, 500],
  "dateRange": {
    "from": "2024-01-01",
    "to": "2024-12-31"
  },
  "listingType": ["offer"],
  "availability": ["one-time"],
  "userId": "user-id" // Optional, saves to search history
}
```

---

## 🗺️ Interactive Map Enhancements

### Features
- 📍 Cluster markers for dense areas
- 🔥 Heatmap overlay showing resource density
- 🛣️ Route planning between multiple pickups
- ⭕ Radius circles for search areas
- 🎨 Color-coded markers by category
- 🎛️ Toggle controls for all features

### Usage

```tsx
import EnhancedMapView from "@/components/EnhancedMapView";

function MapPage() {
  const listings = [
    {
      id: "1",
      title: "Organic Waste",
      category: "organic",
      latitude: 15.4909,
      longitude: 73.8278,
      businessName: "Green Restaurant",
      quantity: 25
    }
  ];

  return (
    <EnhancedMapView
      listings={listings}
      center={[15.4909, 73.8278]}
      zoom={12}
      onListingClick={(id) => console.log("Clicked:", id)}
      showControls={true}
    />
  );
}
```

### Map Controls

- **Cluster Markers**: Groups nearby markers into clusters
- **Heatmap**: Shows density of listings as a heat overlay
- **Search Radius**: Draw circles showing search area
- **Route Planning**: Click markers to add them to route, displays path between stops

---

## 🖼️ Media Gallery with Lightbox

### Features
- 📷 Multiple images per listing
- 🎥 Video support with thumbnails
- 🔍 Zoom functionality (images)
- 🎬 Lightbox modal with navigation
- 🎯 Thumbnail strip for quick navigation
- ⌨️ Keyboard shortcuts (arrows, ESC)

### Usage

```tsx
import MediaGallery from "@/components/MediaGallery";

function ListingDetails() {
  const media = [
    {
      type: "image",
      url: "https://example.com/image1.jpg",
      alt: "Product image 1"
    },
    {
      type: "video",
      url: "https://example.com/video.mp4",
      thumbnail: "https://example.com/thumb.jpg",
      alt: "Product video"
    }
  ];

  return (
    <MediaGallery media={media} />
  );
}
```

### Database Schema

```prisma
model ListingMedia {
  id        String   @id @default(cuid())
  listingId String
  type      String   // "image" | "video"
  url       String
  thumbnail String?
  alt       String?
  order     Int      @default(0)
  createdAt DateTime @default(now())
  
  listing Listing @relation(fields: [listingId], references: [id])
}
```

### API Endpoints

```typescript
// Add media to listing
POST /api/listings/:listingId/media
Body: {
  "type": "image",
  "url": "https://...",
  "thumbnail": "https://...",
  "alt": "Description",
  "order": 0
}

// Get all media for a listing
GET /api/listings/:listingId/media

// Delete media
DELETE /api/media/:id
```

---

## 📱 QR Code Generator

### Features
- 📲 Generate QR codes for any listing
- ⬇️ Download as PNG
- 📋 Copy link to clipboard
- 🔗 Share via native share API
- 🎨 High contrast for easy scanning

### Usage

```tsx
import QRCodeGenerator from "@/components/QRCodeGenerator";

function ListingCard({ listing }) {
  const listingUrl = `${window.location.origin}/listings/${listing.id}`;
  
  return (
    <div>
      <h3>{listing.title}</h3>
      <QRCodeGenerator
        data={listingUrl}
        title={`QR Code for ${listing.title}`}
        filename={`listing-${listing.id}.png`}
        size={256}
        showShareButton={true}
      />
    </div>
  );
}
```

---

## ⏱️ Expiry Timer

### Features
- ⏳ Real-time countdown
- 🎨 Color-coded urgency (green → yellow → red)
- 📊 Three display variants
- 🔔 Callback when expired
- 📱 Responsive formatting

### Usage

```tsx
import ExpiryTimer from "@/components/ExpiryTimer";

function ListingCard({ listing }) {
  const expiryDate = new Date(listing.expiryDate);
  
  return (
    <div>
      {/* Compact variant */}
      <ExpiryTimer
        expiryDate={expiryDate}
        variant="compact"
        onExpired={() => console.log("Listing expired!")}
      />
      
      {/* Default variant */}
      <ExpiryTimer
        expiryDate={expiryDate}
        variant="default"
      />
      
      {/* Detailed variant with countdown boxes */}
      <ExpiryTimer
        expiryDate={expiryDate}
        variant="detailed"
        showIcon={true}
      />
    </div>
  );
}
```

### Database Field

```prisma
model Listing {
  // ... other fields
  expiryDate DateTime? // Optional expiry date
}
```

---

## 🔌 API Routes

### User Preferences

```typescript
// Get user preferences
GET /api/users/:userId/preferences

// Save user preferences
POST /api/users/:userId/preferences
Body: {
  "theme": "dark",
  "savedFilters": { "categories": ["organic"] },
  "notifications": { "email": true },
  "defaultRadius": 10000
}
```

### Search History

```typescript
// Get search history
GET /api/users/:userId/search-history

// Save search query
POST /api/search-history
Body: {
  "userId": "user-id",
  "query": "organic waste"
}

// Delete search history item
DELETE /api/search-history/:id
```

### Listing Media

```typescript
// Upload media
POST /api/listings/:listingId/media
Body: {
  "type": "image",
  "url": "https://...",
  "thumbnail": "https://...",
  "alt": "Description",
  "order": 0
}

// Get listing media
GET /api/listings/:listingId/media

// Delete media
DELETE /api/media/:id
```

---

## 🚀 Quick Start Examples

### Complete Listing with All Features

```tsx
import { useState } from "react";
import MediaGallery from "@/components/MediaGallery";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import ExpiryTimer from "@/components/ExpiryTimer";

function CompleteListing({ listing }) {
  const listingUrl = `${window.location.origin}/listings/${listing.id}`;
  
  return (
    <div className="space-y-4">
      {/* Media Gallery */}
      <MediaGallery media={listing.media} />
      
      {/* Expiry Timer */}
      {listing.expiryDate && (
        <ExpiryTimer
          expiryDate={listing.expiryDate}
          variant="compact"
          onExpired={() => alert("This listing has expired!")}
        />
      )}
      
      {/* Listing Info */}
      <h2>{listing.title}</h2>
      <p>{listing.description}</p>
      
      {/* QR Code */}
      <QRCodeGenerator
        data={listingUrl}
        title={listing.title}
        filename={`${listing.id}.png`}
      />
    </div>
  );
}
```

### Enhanced Marketplace with All Features

```tsx
import { useState } from "react";
import AdvancedSearch from "@/components/AdvancedSearch";
import EnhancedMapView from "@/components/EnhancedMapView";
import ListingCard from "@/components/ListingCard";

function EnhancedMarketplace() {
  const [listings, setListings] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // "list" | "map" | "split"
  
  const handleFilterChange = async (filters) => {
    // Fetch listings with filters
    const response = await fetch("/api/listings/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
    const data = await response.json();
    setListings(data);
  };
  
  return (
    <div className="space-y-4">
      {/* Advanced Search */}
      <AdvancedSearch onFilterChange={handleFilterChange} />
      
      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setViewMode("list")}>List</button>
        <button onClick={() => setViewMode("map")}>Map</button>
        <button onClick={() => setViewMode("split")}>Split</button>
      </div>
      
      {/* Content */}
      {viewMode === "map" ? (
        <EnhancedMapView listings={listings} showControls={true} />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🛠️ Database Migration

After updating the schema, run:

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_new_features

# Or push directly (for development)
npx prisma db push
```

---

## 📦 Required Packages

All required packages have been installed:

- `qrcode` - QR code generation
- `@types/qrcode` - TypeScript types for QRcode
- `date-fns` - Date utility functions

---

## 🎨 Color Scheme for Map Categories

```typescript
const categoryColors = {
  organic: "#22c55e",    // Green
  glass: "#06b6d4",      // Cyan
  plastic: "#f59e0b",    // Amber
  metal: "#6b7280",      // Gray
  paper: "#8b5cf6",      // Purple
  textile: "#ec4899",    // Pink
  electronics: "#3b82f6", // Blue
  wood: "#92400e",       // Brown
  other: "#64748b"       // Slate
};
```

---

## 🐛 Troubleshooting

### Prisma Generation Issues

If you encounter permission errors:
1. Stop the dev server
2. Run `npx prisma generate`
3. Restart the dev server

### Map Not Loading

Ensure `VITE_GOOGLE_MAPS_API_KEY` is set in your `.env` file with the following APIs enabled:
- Maps JavaScript API
- Places API
- Visualization API
- Geometry API

### Theme Not Persisting

Check that localStorage is enabled in your browser and not in incognito mode.

---

## 📝 Notes

- All new features are fully responsive and mobile-friendly
- Theme transitions use CSS transitions for smooth visual effects
- Search history is automatically cleaned up (keeps last 20 searches)
- QR codes are generated on the client side for privacy
- Map clustering automatically adjusts based on zoom level

---

## 🔄 Future Enhancements

Potential improvements for these features:
- Export search results to CSV/Excel
- Schedule listing publication
- Bulk edit media
- Custom QR code styling
- Live location tracking for deliveries

---

For more information, refer to the component source code or contact the development team.
