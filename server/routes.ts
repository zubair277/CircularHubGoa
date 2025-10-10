import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users as usersTable, listings as listingsTable, claims, insertUserSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import { driver, db as globalDb } from "./db";
import { sql } from "drizzle-orm";
import { and, eq, desc } from "drizzle-orm";
import { findMatchingAlerts } from "./utils";
import { 
  insertListingSchema,
  insertClaimSchema,
  insertAlertSchema,
  updateAlertSchema,
  insertRatingSchema,
  insertPickupSchema,
  insertEventSchema,
  insertForumPostSchema,
  insertForumReplySchema,
  insertNotificationSchema,
  insertUserBadgeSchema,
  insertDeliveryRequestSchema,
  insertMessageSchema,
  // community
  insertCommunitySchema,
  insertCommunityMembershipSchema,
  insertCommunityPostSchema,
  insertCommunityCommentSchema,
  communities as communitiesTable,
  communityMemberships as communityMembershipsTable,
  communityPosts as communityPostsTable,
  communityComments as communityCommentsTable,
  conversations as conversationsTable,
  messages as messagesTable,
  postTypeEnum,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Local alias enables TypeScript narrowing of possibly-undefined imported `db`
  const database = db;
  // ========== Auth Routes ==========
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, businessType, location, phone } = req.body;
      
      if (!name || !email || !password || !businessType || !location) {
        return res.status(400).json({ error: "Missing required fields: name, email, password, businessType, location" });
      }

      const database = globalDb;

      // Hash password
      const hashed = await bcrypt.hash(password, 10);

      // Geocode location using Google Maps API
      let latitude = null;
      let longitude = null;
      
      try {
        const googleMapsApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
        if (googleMapsApiKey) {
          const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleMapsApiKey}`
          );
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
            const coords = geocodeData.results[0].geometry.location;
            latitude = coords.lat;
            longitude = coords.lng;
          }
        }
      } catch (geocodeError) {
        console.warn('Geocoding failed:', geocodeError);
        // Continue without coordinates
      }

      const userData = {
        email,
        password: hashed,
        businessName: name,
        businessType,
        location,
        latitude,
        longitude,
        phone: phone || null,
        avatar: null,
        verified: false
      };

      // If DB configured (MySQL or Neon), persist via Drizzle
      if (database && driver === "mysql") {
        const [exists] = await database.execute(sql`SELECT id, email FROM users WHERE email = ${email} LIMIT 1;`);
        if (Array.isArray(exists) && exists.length > 0) {
          return res.status(409).json({ error: "Email already registered" });
        }
        
        await database.execute(sql`
          INSERT INTO users (email, password, business_name, business_type, location, latitude, longitude, phone, avatar, verified) 
          VALUES (${userData.email}, ${userData.password}, ${userData.businessName}, ${userData.businessType}, ${userData.location}, ${userData.latitude}, ${userData.longitude}, ${userData.phone}, ${userData.avatar}, ${userData.verified})
        `);
        
        const [rows] = await database.execute(sql`
          SELECT id, email, business_name AS businessName, business_type AS businessType, location, latitude, longitude, phone, verified, created_at AS createdAt 
          FROM users WHERE email = ${userData.email} LIMIT 1
        `);
        const first = Array.isArray(rows) ? rows[0] : rows;
        return res.json(first);
      }

      if (database && driver !== "mysql") {
        // Ensure email uniqueness at DB level; check first to give friendly error
        const existing = await database
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, userData.email));
        if (existing.length > 0) {
          return res.status(409).json({ error: "Email already registered" });
        }

        const [created] = await database
          .insert(usersTable)
          .values(userData)
          .returning();

        // Never return password
        const { password: _omit, ...safe } = created as any;
        return res.json(safe);
      }

      // Fallback to in-memory storage when DB not configured
      const created = await storage.createUser(userData);
      const { password: _omit, ...safe } = created as any;
      res.json(safe);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const database = globalDb;
      if (database && driver !== "mysql") {
        const rows = await database.select().from(usersTable).where(eq(usersTable.email, email));
        if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });
        const user = rows[0] as any;
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ error: "Invalid credentials" });
        const { password: _omit, ...safe } = user;
        return res.json(safe);
      }

      if (database && driver === "mysql") {
        const [rows] = await database.execute(sql`SELECT id, email, password, business_name AS businessName, business_type AS businessType, location, latitude, longitude, phone, verified, created_at AS createdAt FROM users WHERE email = ${email} LIMIT 1;`);
        const user = Array.isArray(rows) ? (rows[0] as any) : undefined;
        if (!user) return res.status(401).json({ error: "Invalid credentials" });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ error: "Invalid credentials" });
        delete user.password;
        return res.json(user);
      }
      // storage fallback
      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
      const ok = await bcrypt.compare(password, (user as any).password);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });
      const { password: _omit, ...safe } = user as any;
      return res.json(safe);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });
  
  // ========== Image Upload Routes ==========
  
  // Upload image
  app.post("/api/upload", async (req, res) => {
    try {
      // For now, we'll use a simple base64 approach since we don't have a file storage service
      // In production, you'd want to use AWS S3, Cloudinary, or similar
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }
      
      // Generate a unique filename
      const filename = `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      
      // For demo purposes, we'll return a placeholder URL
      // In production, you'd save the image and return the actual URL
      const imageUrl = `https://via.placeholder.com/400x300/4ade80/ffffff?text=${encodeURIComponent('Listing Image')}`;
      
      res.json({ url: imageUrl, filename });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== Listings Routes ==========
  
  // Create a new listing
  app.post("/api/listings", async (req, res) => {
    try {
      console.log('=== LISTING CREATION REQUEST ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      const validatedData = insertListingSchema.parse(req.body);
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));
      
      // Use only in-memory storage (localStorage) - skip database operations
      console.log('Using in-memory storage for listing creation');
      const listing = await storage.createListing(validatedData);
      res.json(listing);
    } catch (error: any) {
      console.error('=== LISTING CREATION ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error details:', error);
      
      if (error.name === 'ZodError') {
        console.error('Validation errors:', error.errors);
        res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors,
          message: error.message 
        });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  });

  // Get listings by user
  app.get("/api/listings/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Use only in-memory storage (localStorage) - skip database operations
      console.log('Fetching user listings from in-memory storage for user:', userId);
      const userListings = await storage.getListingsByUser(userId);
      res.json(userListings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a listing
  app.delete("/api/listings/:listingId", async (req, res) => {
    try {
      const { listingId } = req.params;
      
      // Use only in-memory storage (localStorage) - skip database operations
      console.log('Deleting listing from in-memory storage:', listingId);
      const success = await storage.deleteListing(listingId);
      
      if (success) {
        res.json({ message: 'Listing deleted successfully' });
      } else {
        res.status(404).json({ error: 'Listing not found' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all listings
  app.get("/api/listings", async (req, res) => {
    try {
      const { type } = req.query;
      
      // Use only in-memory storage (localStorage) - skip database operations
      console.log('Fetching listings from in-memory storage');
      let listings;
      if (type === "offer" || type === "request") {
        listings = await storage.getListingsByType(type);
      } else {
        listings = await storage.getAllListings();
      }
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get listings by user with progress tracking
  app.get("/api/listings/user/:userId", async (req, res) => {
    try {
      if (database && driver !== "mysql") {
        const rows = await database
          .select()
          .from(listingsTable)
          .where(eq(listingsTable.userId, req.params.userId));
        return res.json(rows);
      }
      if (database && driver === "mysql") {
        const [rows]: any = await database.execute(sql`SELECT * FROM listings WHERE user_id = ${req.params.userId};`);
        return res.json(rows);
      }
      const listings = await storage.getListingsByUser(req.params.userId);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user listings with progress and claims data
  app.get("/api/listings/user/:userId/with-progress", async (req, res) => {
    try {
      if (database) {
        // Get user's listings
        const listings = await database
          .select()
          .from(listingsTable)
          .where(eq(listingsTable.userId, req.params.userId))
          .orderBy(listingsTable.createdAt);

        // Get claims for each listing
        const listingsWithProgress = await Promise.all(
          listings.map(async (listing: any) => {
            const claimsData = await database
              .select()
              .from(claims)
              .where(eq(claims.listingId, listing.id));

            // Calculate progress
            const hasClaims = claimsData.length > 0;
            const hasAcceptedClaim = claimsData.some((claim: any) => claim.status === 'accepted');
            const isCompleted = listing.status === 'completed';

            let progressPercentage = 0;
            let statusLabel = 'Available';
            let statusColor = 'bg-green-100 text-green-800';

            if (isCompleted) {
              progressPercentage = 100;
              statusLabel = 'Completed';
              statusColor = 'bg-blue-100 text-blue-800';
            } else if (hasAcceptedClaim) {
              progressPercentage = 75;
              statusLabel = 'Claimed';
              statusColor = 'bg-yellow-100 text-yellow-800';
            } else if (hasClaims) {
              progressPercentage = 50;
              statusLabel = 'Under Review';
              statusColor = 'bg-orange-100 text-orange-800';
            } else {
              progressPercentage = 25;
              statusLabel = 'Available';
              statusColor = 'bg-green-100 text-green-800';
            }

            return {
              ...listing,
              claims: claimsData,
              progressPercentage,
              statusLabel,
              statusColor,
            };
          })
        );

        return res.json(listingsWithProgress);
      }

      // Fallback to storage
      const listings = await storage.getListingsByUser(req.params.userId);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single listing
  app.get("/api/listings/:id", async (req, res) => {
    try {
      if (database && driver !== "mysql") {
        const rows = await database
          .select()
          .from(listingsTable)
          .where(eq(listingsTable.id, req.params.id));
        if (rows.length === 0) return res.status(404).json({ error: "Listing not found" });
        return res.json(rows[0]);
      }
      if (database && driver === "mysql") {
        const [rows]: any = await database.execute(sql`SELECT * FROM listings WHERE id = ${req.params.id} LIMIT 1;`);
        const first = Array.isArray(rows) ? (rows[0] as any) : undefined;
        if (!first) return res.status(404).json({ error: "Listing not found" });
        return res.json(first);
      }
      const listing = await storage.getListing(req.params.id);
      if (!listing) return res.status(404).json({ error: "Listing not found" });
      res.json(listing);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update listing
  app.patch("/api/listings/:id", async (req, res) => {
    try {
      if (database && driver !== "mysql") {
        const [updated] = await database
          .update(listingsTable)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(listingsTable.id, req.params.id))
          .returning();
        if (!updated) return res.status(404).json({ error: "Listing not found" });
        return res.json(updated);
      }
      if (database && driver === "mysql") {
        await database.execute(sql`UPDATE listings SET title = COALESCE(${(req.body as any).title}, title), description = COALESCE(${(req.body as any).description}, description), category = COALESCE(${(req.body as any).category}, category), quantity = COALESCE(${(req.body as any).quantity}, quantity), unit = COALESCE(${(req.body as any).unit}, unit), location = COALESCE(${(req.body as any).location}, location), latitude = COALESCE(${(req.body as any).latitude}, latitude), longitude = COALESCE(${(req.body as any).longitude}, longitude), availability = COALESCE(${(req.body as any).availability}, availability), listing_type = COALESCE(${(req.body as any).listingType}, listing_type), status = COALESCE(${(req.body as any).status}, status), image_url = COALESCE(${(req.body as any).imageUrl}, image_url), updated_at = CURRENT_TIMESTAMP WHERE id = ${req.params.id};`);
        const [rows]: any = await database.execute(sql`SELECT * FROM listings WHERE id = ${req.params.id} LIMIT 1;`);
        const first = Array.isArray(rows) ? (rows[0] as any) : undefined;
        if (!first) return res.status(404).json({ error: "Listing not found" });
        return res.json(first);
      }
      const listing = await storage.updateListing(req.params.id, req.body);
      if (!listing) return res.status(404).json({ error: "Listing not found" });
      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete listing
  app.delete("/api/listings/:id", async (req, res) => {
    try {
      if (database && driver !== "mysql") {
        const result = await database
          .delete(listingsTable)
          .where(eq(listingsTable.id, req.params.id))
          .returning();
        if (result.length === 0) return res.status(404).json({ error: "Listing not found" });
        return res.json({ success: true });
      }
      if (database && driver === "mysql") {
        await database.execute(sql`DELETE FROM listings WHERE id = ${req.params.id};`);
        return res.json({ success: true });
      }
      const deleted = await storage.deleteListing(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Listing not found" });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== Claims Routes ==========
  
  // Create a claim
  app.post("/api/claims", async (req, res) => {
    try {
      const validatedData = insertClaimSchema.parse(req.body);
      const claim = await storage.createClaim(validatedData);
      
      // Get listing to include details in notification
      const listing = await storage.getListing(validatedData.listingId);
      
      // Create notification for listing owner
      await storage.createNotification({
        userId: validatedData.ownerId,
        type: "new_claim",
        title: "New Claim on Your Listing",
        message: `Someone claimed your listing "${listing?.title}": ${validatedData.message || "No message provided"}`,
        relatedId: claim.id,
      });
      
      res.json(claim);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get claims for a listing
  app.get("/api/claims/listing/:listingId", async (req, res) => {
    try {
      const claims = await storage.getClaimsByListing(req.params.listingId);
      res.json(claims);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get claims for a user
  app.get("/api/claims/user/:userId", async (req, res) => {
    try {
      const claims = await storage.getClaimsByUser(req.params.userId);
      res.json(claims);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update claim status
  app.patch("/api/claims/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const claim = await storage.updateClaimStatus(req.params.id, status);
      
      if (!claim) {
        return res.status(404).json({ error: "Claim not found" });
      }
      
      // Synchronize listing status based on claim status
      const listing = await storage.getListing(claim.listingId);
      if (listing) {
        if (status === "completed") {
          // Mark listing as completed when claim is completed
          const updatedListing = { ...listing, status: "completed" };
        }
      }
      
      // Notify the claimer about status change
      await storage.createNotification({
        userId: claim.claimerId,
        type: "claim_update",
        title: "Claim Status Updated",
        message: `Your claim has been ${status}`,
        relatedId: claim.id,
      });
      
      res.json(claim);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== Alerts Routes ==========
  
  // Create alert
  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.json(alert);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user's alerts
  app.get("/api/alerts/user/:userId", async (req, res) => {
    try {
      const alerts = await storage.getAlertsByUser(req.params.userId);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update alert
  app.patch("/api/alerts/:id", async (req, res) => {
    try {
      const validatedData = updateAlertSchema.parse(req.body);
      const alert = await storage.updateAlert(req.params.id, validatedData);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete alert
  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAlert(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== Messages Routes ==========
  
  // Send message
  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      
      // Create notification for receiver
      if ((validatedData as any).receiverId) {
        await storage.createNotification({
          userId: (validatedData as any).receiverId,
          type: "new_message",
          title: "New Message",
          message: "You have a new message",
          relatedId: (message as any).id,
        });
      }
      
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get messages between two users
  app.get("/api/messages/:user1Id/:user2Id", async (req, res) => {
    try {
      const messages = await storage.getMessagesBetweenUsers(
        req.params.user1Id,
        req.params.user2Id
      );
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all messages for a user
  app.get("/api/messages/user/:userId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByUser(req.params.userId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mark message as read
  app.patch("/api/messages/:id/read", async (req, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get unread message count
  app.get("/api/messages/unread/count/:userId", async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.params.userId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== Ratings Routes ==========
  
  // Create rating
  app.post("/api/ratings", async (req, res) => {
    try {
      const validatedData = insertRatingSchema.parse(req.body);
      const rating = await storage.createRating(validatedData);
      res.json(rating);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get ratings for a user
  app.get("/api/ratings/user/:userId", async (req, res) => {
    try {
      const ratings = await storage.getRatingsByUser(req.params.userId);
      res.json(ratings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get rating for a claim
  app.get("/api/ratings/claim/:claimId", async (req, res) => {
    try {
      const rating = await storage.getRatingForClaim(req.params.claimId);
      if (!rating) {
        return res.status(404).json({ error: "Rating not found" });
      }
      res.json(rating);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== Pickups Routes ==========
  
  // Create pickup (Marketplace schedule form)
  app.post("/api/pickups", async (req, res) => {
    try {
      const { 
        listingId, 
        userId, 
        scheduledDate, 
        scheduledTime, 
        description, 
        amountRequested,
        notes,
        wasteWeight,
        valueSaved
      } = req.body as any;
      
      if (!listingId || !userId || !scheduledDate || !scheduledTime) {
        return res.status(400).json({ error: "Missing required fields: listingId, userId, scheduledDate, scheduledTime" });
      }

      // Persist into MySQL pickups table we created in auto-migration
      if (globalDb && driver === "mysql") {
        // Check if a claim exists for this listing and user, if not create one
        const [existingClaimRows] = await globalDb.execute(
          sql`SELECT id FROM claims WHERE listing_id = ${listingId} AND claimer_id = ${userId} LIMIT 1`
        );
        const existingClaim = Array.isArray(existingClaimRows) ? (existingClaimRows[0] as any) : undefined;
        
        let claimId = existingClaim?.id;
        
        // If no claim exists, create one
        if (!claimId) {
          // Get listing owner
          const [listingRows] = await globalDb.execute(
            sql`SELECT user_id FROM listings WHERE id = ${listingId} LIMIT 1`
          );
          const listing = Array.isArray(listingRows) ? (listingRows[0] as any) : undefined;
          
          if (listing) {
            const [claimResult] = await globalDb.execute(
              sql`INSERT INTO claims (listing_id, claimer_id, owner_id, status) VALUES (${listingId}, ${userId}, ${listing.user_id}, 'pending')`
            );
            // Get the created claim ID
            const [newClaimRows] = await globalDb.execute(
              sql`SELECT id FROM claims WHERE listing_id = ${listingId} AND claimer_id = ${userId} ORDER BY created_at DESC LIMIT 1`
            );
            const newClaim = Array.isArray(newClaimRows) ? (newClaimRows[0] as any) : undefined;
            claimId = newClaim?.id;
          }
        }

        // Insert pickup with all fields
        await globalDb.execute(sql`
          INSERT INTO pickups (
            listing_id, 
            user_id, 
            claim_id,
            scheduled_date, 
            scheduled_time, 
            description, 
            amount_requested,
            status,
            notes,
            waste_weight,
            value_saved
          ) VALUES (
            ${listingId}, 
            ${userId}, 
            ${claimId || null}, 
            ${scheduledDate}, 
            ${scheduledTime}, 
            ${description || null}, 
            ${amountRequested || null},
            'scheduled',
            ${notes || null},
            ${wasteWeight || null},
            ${valueSaved || null}
          )
        `);
        
        return res.json({ 
          success: true, 
          message: "Pickup scheduled successfully",
          claimId: claimId
        });
      }
      
      // Fallback storage
      const pickup = await storage.createPickup({ 
        claimId: listingId, 
        scheduledDate: new Date(scheduledDate),
        notes: notes || null,
        wasteWeight: wasteWeight || null,
        valueSaved: valueSaved || null
      } as any);
      res.json(pickup);
    } catch (error: any) {
      console.error("Error creating pickup:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get pickup by claim
  app.get("/api/pickups/claim/:claimId", async (req, res) => {
    try {
      const pickups = await storage.getPickupsByClaim(req.params.claimId);
      res.json(pickups);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get pickups by user
  app.get("/api/pickups/user/:userId", async (req, res) => {
    try {
      const pickups = await storage.getPickupsByUser(req.params.userId);
      res.json(pickups);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update pickup status
  app.patch("/api/pickups/:id/status", async (req, res) => {
    try {
      const { status, wasteWeight, valueSaved } = req.body;
      const pickup = await storage.updatePickupStatus(req.params.id, status, wasteWeight, valueSaved);
      
      if (!pickup) {
        return res.status(404).json({ error: "Pickup not found" });
      }
      
      res.json(pickup);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== Events Routes ==========
  
  // Create event
  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get upcoming events
  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const events = await storage.getUpcomingEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single event
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== Forum Routes ==========
  
  // Create forum post
  app.post("/api/forum/posts", async (req, res) => {
    try {
      const validatedData = insertForumPostSchema.parse(req.body);
      const post = await storage.createForumPost(validatedData);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all forum posts
  app.get("/api/forum/posts", async (req, res) => {
    try {
      const { category } = req.query;
      let posts;
      
      if (category && typeof category === "string") {
        posts = await storage.getForumPostsByCategory(category);
      } else {
        posts = await storage.getAllForumPosts();
      }
      
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single forum post
  app.get("/api/forum/posts/:id", async (req, res) => {
    try {
      const post = await storage.getForumPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create forum reply
  app.post("/api/forum/replies", async (req, res) => {
    try {
      const validatedData = insertForumReplySchema.parse(req.body);
      const reply = await storage.createForumReply(validatedData);
      res.json(reply);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get replies for a post
  app.get("/api/forum/posts/:postId/replies", async (req, res) => {
    try {
      const replies = await storage.getRepliesByPost(req.params.postId);
      res.json(replies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== Notifications Routes ==========
  
  // Create notification
  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user notifications
  app.get("/api/notifications/user/:userId", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.params.userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get unread notifications
  app.get("/api/notifications/unread/:userId", async (req, res) => {
    try {
      const notifications = await storage.getUnreadNotifications(req.params.userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get unread count
  app.get("/api/notifications/unread/count/:userId", async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.params.userId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== Badges Routes ==========
  
  // Award badge
  app.post("/api/badges", async (req, res) => {
    try {
      const validatedData = insertUserBadgeSchema.parse(req.body);
      const badge = await storage.createUserBadge(validatedData);
      res.json(badge);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user badges
  app.get("/api/badges/user/:userId", async (req, res) => {
    try {
      const badges = await storage.getBadgesByUser(req.params.userId);
      res.json(badges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== Delivery Requests ==========
  app.post("/api/delivery-requests", async (req, res) => {
    try {
      const data = insertDeliveryRequestSchema.parse(req.body);
      const row = await storage.createDeliveryRequest(data as any);
      res.json(row);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/delivery-requests/listing/:listingId", async (req, res) => {
    try {
      const rows = await storage.getDeliveryRequestsByListing(req.params.listingId);
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ========== Alerts ==========
  app.post("/api/alerts", async (req, res) => {
    try {
      const data = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(data as any);
      res.json(alert);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/alerts", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const alerts = await storage.getAlertsByUser(userId as string);
      res.json(alerts);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAlert(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ========== Conversations & Messages ==========
  app.get("/api/conversations", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const conversations = await storage.getConversationsByUser(userId as string);
      res.json(conversations);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  app.get("/api/messages/:conversationId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.conversationId);
      res.json(messages);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(data as any);
      res.json(message);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/offers", async (req, res) => {
    try {
      const { conversationId, senderId, offerAmount, content } = req.body;
      const data = insertMessageSchema.parse({
        conversationId,
        senderId,
        content,
        type: "offer",
        offerAmount: offerAmount?.toString(),
      });
      const message = await storage.createMessage(data as any);
      res.json(message);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ========== Community Routes ==========

  // Create community
  app.post("/api/communities", async (req, res) => {
    try {
      const data = insertCommunitySchema.parse(req.body);
      if (database) {
        const [row] = await database.insert(communitiesTable).values(data).returning();
        return res.json(row);
      }
      const created = await storage.createCommunity(data as any);
      res.json(created);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // List communities
  app.get("/api/communities", async (_req, res) => {
    try {
      if (database) {
        const rows = await database.select().from(communitiesTable);
        return res.json(rows);
      }
      const rows = await storage.getCommunities();
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Join community
  app.post("/api/communities/:id/join", async (req, res) => {
    try {
      const data = insertCommunityMembershipSchema.parse({ communityId: req.params.id, userId: req.body.userId });
      if (database) {
        const [row] = await database.insert(communityMembershipsTable).values(data).returning();
        return res.json(row);
      }
      const row = await storage.joinCommunity(data as any);
      res.json(row);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Create post
  app.post("/api/communities/:id/posts", async (req, res) => {
    try {
      const data = insertCommunityPostSchema.parse({ ...req.body, communityId: req.params.id });
      if (database) {
        const [row] = await database.insert(communityPostsTable).values(data).returning();
        return res.json(row);
      }
      const row = await storage.createCommunityPost(data as any);
      res.json(row);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // List posts in a community (optional type filter)
  app.get("/api/communities/:id/posts", async (req, res) => {
    try {
      const type = typeof req.query.type === 'string' ? req.query.type : undefined;
      if (database) {
        const rows = await database.select().from(communityPostsTable).where(eq(communityPostsTable.communityId, req.params.id));
        return res.json(type ? rows.filter((r: any) => r.type === type) : rows);
      }
      const rows = await storage.getCommunityPosts(req.params.id);
      res.json(type ? rows.filter((r: any) => r.type === type) : rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Comment on post
  app.post("/api/community/posts/:postId/comments", async (req, res) => {
    try {
      const data = insertCommunityCommentSchema.parse({ ...req.body, postId: req.params.postId });
      if (database) {
        const [row] = await database.insert(communityCommentsTable).values(data).returning();
        return res.json(row);
      }
      const row = await storage.createCommunityComment(data as any);
      res.json(row);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Community messages
  app.get("/api/communities/:id/messages", async (req, res) => {
    try {
      const rows = await storage.getCommunityMessages(req.params.id);
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/communities/:id/messages", async (req, res) => {
    try {
      const row = await storage.createCommunityMessage({ communityId: req.params.id, authorId: req.body.authorId, content: req.body.content });
      res.json(row);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ========== Dashboard/Stats Routes ==========
  
  // Get user stats
  app.get("/api/stats/user/:userId", async (req, res) => {
    try {
      const listings = await storage.getListingsByUser(req.params.userId);
      const claims = await storage.getClaimsByUser(req.params.userId);
      const pickups = await storage.getPickupsByUser(req.params.userId);
      
      // Calculate totals
      const completedPickups = pickups.filter(p => p.status === "completed");
      const totalWasteDiverted = completedPickups.reduce((sum, p) => 
        sum + (parseFloat(p.wasteWeight || "0")), 0
      );
      const totalValueSaved = completedPickups.reduce((sum, p) => 
        sum + (parseFloat(p.valueSaved || "0")), 0
      );
      
      // Simple CO2 calculation (1kg waste = ~2.5kg CO2 saved)
      const co2Saved = totalWasteDiverted * 2.5;
      
      res.json({
        totalListings: listings.length,
        totalClaims: claims.length,
        wasteDiverted: totalWasteDiverted,
        valueSaved: totalValueSaved,
        co2Saved,
        activeListings: listings.filter(l => l.status === "available").length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get community stats
  app.get("/api/stats/community", async (req, res) => {
    try {
      const allListings = await storage.getAllListings();
      const allPickups = await storage.getPickupsByUser(""); // Get all pickups
      
      const completedPickups = allPickups.filter(p => p.status === "completed");
      const totalWasteDiverted = completedPickups.reduce((sum, p) => 
        sum + (parseFloat(p.wasteWeight || "0")), 0
      );
      const totalCO2Saved = totalWasteDiverted * 2.5;
      
      res.json({
        totalListings: allListings.length,
        totalWasteDiverted,
        totalCO2Saved,
        totalUsers: 0, // TODO: Implement user count
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== Messaging Routes ==========

  // Get or create conversation for a listing
  app.post("/api/conversations", async (req, res) => {
    try {
      const { listingId, buyerId } = req.body;
      
      if (!listingId || !buyerId) {
        return res.status(400).json({ error: "listingId and buyerId are required" });
      }

      const database = globalDb;
      if (!database || driver !== "mysql") {
        return res.status(500).json({ error: "Database not available" });
      }

      // Get listing to find seller
      console.log('Looking for listing with ID:', listingId);
      const [listingRows] = await database.execute(
        sql`SELECT user_id FROM listings WHERE id = ${listingId} LIMIT 1`
      );
      console.log('Listing query result:', listingRows);
      const listing = Array.isArray(listingRows) ? (listingRows[0] as any) : undefined;
      
      if (!listing) {
        console.log('Listing not found in database');
        return res.status(404).json({ error: "Listing not found" });
      }

      const sellerId = listing.user_id;

      // Check if conversation already exists
      const [existingRows] = await database.execute(
        sql`SELECT id FROM conversations WHERE listing_id = ${listingId} AND buyer_id = ${buyerId} LIMIT 1`
      );
      const existing = Array.isArray(existingRows) ? (existingRows[0] as any) : undefined;

      if (existing) {
        // Return existing conversation
        const [conversationRows] = await database.execute(
          sql`SELECT * FROM conversations WHERE id = ${existing.id} LIMIT 1`
        );
        const conversation = Array.isArray(conversationRows) ? (conversationRows[0] as any) : undefined;
        
        return res.json(conversation);
      }

      // Create new conversation
      const [newConversationRows] = await database.execute(
        sql`INSERT INTO conversations (listing_id, buyer_id, seller_id) VALUES (${listingId}, ${buyerId}, ${sellerId})`
      );

      // Get the created conversation
      const [conversationRows] = await database.execute(
        sql`SELECT * FROM conversations WHERE listing_id = ${listingId} AND buyer_id = ${buyerId} LIMIT 1`
      );
      const conversation = Array.isArray(conversationRows) ? (conversationRows[0] as any) : undefined;

      // Create default message
      await database.execute(
        sql`INSERT INTO messages (conversation_id, sender_id, receiver_id, content) VALUES (${conversation.id}, ${buyerId}, ${sellerId}, 'Hello! I'm interested in your listing. Is it still available?')`
      );

      res.json(conversation);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const database = globalDb;
      
      if (!database || driver !== "mysql") {
        return res.status(500).json({ error: "Database not available" });
      }

      const [rows] = await database.execute(
        sql`SELECT * FROM messages WHERE conversation_id = ${conversationId} ORDER BY created_at ASC`
      );
      
      const messages = Array.isArray(rows) ? rows : [];
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Send a message
  app.post("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { senderId, receiverId, content } = req.body;
      
      if (!senderId || !receiverId || !content) {
        return res.status(400).json({ error: "senderId, receiverId, and content are required" });
      }

      const database = globalDb;
      if (!database || driver !== "mysql") {
        return res.status(500).json({ error: "Database not available" });
      }

      const [result] = await database.execute(
        sql`INSERT INTO messages (conversation_id, sender_id, receiver_id, content) VALUES (${conversationId}, ${senderId}, ${receiverId}, ${content})`
      );

      // Get the created message
      const [messageRows] = await database.execute(
        sql`SELECT * FROM messages WHERE conversation_id = ${conversationId} ORDER BY created_at DESC LIMIT 1`
      );
      const message = Array.isArray(messageRows) ? (messageRows[0] as any) : undefined;

      res.json(message);
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Mark messages as read
  app.put("/api/conversations/:conversationId/messages/read", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { userId } = req.body;
      
      const database = globalDb;
      if (!database || driver !== "mysql") {
        return res.status(500).json({ error: "Database not available" });
      }

      await database.execute(
        sql`UPDATE messages SET is_read = 1 WHERE conversation_id = ${conversationId} AND receiver_id = ${userId} AND is_read = 0`
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's conversations
  app.get("/api/users/:userId/conversations", async (req, res) => {
    try {
      const { userId } = req.params;
      const database = globalDb;
      
      if (!database || driver !== "mysql") {
        return res.status(500).json({ error: "Database not available" });
      }

      const [rows] = await database.execute(
        sql`SELECT c.*, l.title as listing_title, l.image_url as listing_image,
                   CASE WHEN c.buyer_id = ${userId} THEN 
                     (SELECT business_name FROM users WHERE id = c.seller_id)
                   ELSE 
                     (SELECT business_name FROM users WHERE id = c.buyer_id)
                   END as other_user_name
            FROM conversations c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.buyer_id = ${userId} OR c.seller_id = ${userId}
            ORDER BY c.updated_at DESC`
      );
      
      const conversations = Array.isArray(rows) ? rows : [];
      res.json(conversations);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  // ========== Review Routes (LocalStorage Only) ==========
  
  // Reviews are now handled entirely in localStorage via useReviews hook
  // No API routes needed for the review system

  return httpServer;
}
