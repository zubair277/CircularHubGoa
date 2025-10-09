import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users as usersTable, listings as listingsTable, insertUserSchema } from "@shared/schema";
import { and, eq } from "drizzle-orm";
import { findMatchingAlerts } from "./utils";
import { 
  insertListingSchema,
  insertClaimSchema,
  insertAlertSchema,
  updateAlertSchema,
  insertMessageSchema,
  insertRatingSchema,
  insertPickupSchema,
  insertEventSchema,
  insertForumPostSchema,
  insertForumReplySchema,
  insertNotificationSchema,
  insertUserBadgeSchema,
  insertDeliveryRequestSchema,
  // community
  insertCommunitySchema,
  insertCommunityMembershipSchema,
  insertCommunityPostSchema,
  insertCommunityCommentSchema,
  communities as communitiesTable,
  communityMemberships as communityMembershipsTable,
  communityPosts as communityPostsTable,
  communityComments as communityCommentsTable,
  postTypeEnum,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Local alias enables TypeScript narrowing of possibly-undefined imported `db`
  const database = db;
  // ========== Auth Routes ==========
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);

      // If DATABASE_URL is configured, persist to Supabase via Drizzle
      if (database) {
        // Ensure email uniqueness at DB level; check first to give friendly error
        const existing = await database
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, data.email));
        if (existing.length > 0) {
          return res.status(409).json({ error: "Email already registered" });
        }

        const [created] = await database
          .insert(usersTable)
          .values(data)
          .returning();

        // Never return password
        const { password: _omit, ...safe } = created as any;
        return res.json(safe);
      }

      // Fallback to in-memory storage when DB not configured
      const created = await storage.createUser(data);
      const { password: _omit, ...safe } = created as any;
      res.json(safe);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // ========== Listings Routes ==========
  
  // Create a new listing (writes to Supabase when DATABASE_URL is set)
  app.post("/api/listings", async (req, res) => {
    try {
      const validatedData = insertListingSchema.parse(req.body);

      if (database) {
        const [created] = await database
          .insert(listingsTable)
          .values({ ...validatedData, status: "available" })
          .returning();
        return res.json(created);
      }

      const listing = await storage.createListing(validatedData);
      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all listings
  app.get("/api/listings", async (req, res) => {
    try {
      const { type } = req.query;
      if (database) {
        if (type === "offer" || type === "request") {
          const rows = await database
            .select()
            .from(listingsTable)
            .where(eq(listingsTable.listingType, String(type)));
          return res.json(rows);
        }
        const rows = await database.select().from(listingsTable);
        return res.json(rows);
      }

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

  // Get listings by user
  app.get("/api/listings/user/:userId", async (req, res) => {
    try {
      if (database) {
        const rows = await database
          .select()
          .from(listingsTable)
          .where(eq(listingsTable.userId, req.params.userId));
        return res.json(rows);
      }
      const listings = await storage.getListingsByUser(req.params.userId);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single listing
  app.get("/api/listings/:id", async (req, res) => {
    try {
      if (database) {
        const rows = await database
          .select()
          .from(listingsTable)
          .where(eq(listingsTable.id, req.params.id));
        if (rows.length === 0) return res.status(404).json({ error: "Listing not found" });
        return res.json(rows[0]);
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
      if (database) {
        const [updated] = await database
          .update(listingsTable)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(listingsTable.id, req.params.id))
          .returning();
        if (!updated) return res.status(404).json({ error: "Listing not found" });
        return res.json(updated);
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
      if (database) {
        const result = await database
          .delete(listingsTable)
          .where(eq(listingsTable.id, req.params.id))
          .returning();
        if (result.length === 0) return res.status(404).json({ error: "Listing not found" });
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
      await storage.createNotification({
        userId: validatedData.receiverId,
        type: "new_message",
        title: "New Message",
        message: "You have a new message",
        relatedId: message.id,
      });
      
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
  
  // Create pickup
  app.post("/api/pickups", async (req, res) => {
    try {
      const validatedData = insertPickupSchema.parse(req.body);
      const pickup = await storage.createPickup(validatedData);
      
      // Get claim info
      const claim = await storage.getClaim(validatedData.claimId);
      if (claim) {
        // Create reminder notification
        await storage.createNotification({
          userId: claim.claimerId,
          type: "pickup_reminder",
          title: "Pickup Scheduled",
          message: `Your pickup is scheduled for ${new Date(validatedData.scheduledDate).toLocaleString()}`,
          relatedId: pickup.id,
        });
      }
      
      res.json(pickup);
    } catch (error: any) {
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
        return res.json(type ? rows.filter(r => (r as any).type === type) : rows);
      }
      const rows = await storage.getCommunityPosts(req.params.id);
      res.json(type ? rows.filter(r => (r as any).type === type) : rows);
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

  const httpServer = createServer(app);

  return httpServer;
}
