import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  location: text("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  phone: text("phone"),
  avatar: text("avatar"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Resource Listings
export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Organic, Glass, Plastic, Metal, Textile, etc.
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(), // kg, liters, units
  location: text("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  availability: text("availability").notNull(), // one-time, recurring
  listingType: text("listing_type").notNull(), // offer, request
  status: text("status").notNull().default("available"), // available, claimed, completed
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Claims
export const claims = pgTable("claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id),
  claimerId: varchar("claimer_id").notNull().references(() => users.id),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  message: text("message"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Alerts/Preferences
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  categories: jsonb("categories").notNull(), // array of category strings
  distanceRadius: integer("distance_radius").notNull(), // in km
  notificationType: text("notification_type").notNull(), // email, in-app, both
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages/Chat
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  relatedClaimId: varchar("related_claim_id").references(() => claims.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ratings & Reviews
export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimId: varchar("claim_id").notNull().references(() => claims.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pickup Schedules
export const pickups = pgTable("pickups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimId: varchar("claim_id").notNull().references(() => claims.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  wasteWeight: decimal("waste_weight", { precision: 10, scale: 2 }), // kg
  valueSaved: decimal("value_saved", { precision: 10, scale: 2 }), // ₹
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Events & Workshops
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("event_date").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  organizerId: varchar("organizer_id").references(() => users.id),
  maxParticipants: integer("max_participants"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum Posts
export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // composting, upcycling, success-stories
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum Replies
export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => forumPosts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // listing_match, new_message, pickup_reminder
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  relatedId: varchar("related_id"), // ID of related listing, message, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// User Badges
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeType: text("badge_type").notNull(), // green_champion, top_recycler, etc.
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Delivery Requests
export const deliveryRequests = pgTable("delivery_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id),
  partnerId: varchar("partner_id").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  itemDetails: text("item_details"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Communities
export const communities = pgTable("communities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
});

export const communityMemberships = pgTable(
  "community_memberships",
  {
    userId: varchar("user_id").notNull().references(() => users.id),
    communityId: varchar("community_id").notNull().references(() => communities.id),
    role: text("role").default("member"),
    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.communityId] }) }),
);

export const postTypeEnum = pgEnum("post_type", ["discussion", "offer", "request", "project"]);

export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: postTypeEnum("type").default("discussion"),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  communityId: varchar("community_id").notNull().references(() => communities.id),
});

export const communityComments = pgTable("community_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  postId: varchar("post_id").notNull().references(() => communityPosts.id),
});

export const communityMessages = pgTable("community_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").notNull().references(() => communities.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============== Zod Schemas ==============

// Users
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Listings
export const insertListingSchema = createInsertSchema(listings).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true 
});
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;

// Claims
export const insertClaimSchema = createInsertSchema(claims).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true 
});
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;

// Alerts
export const insertAlertSchema = createInsertSchema(alerts).omit({ 
  id: true, 
  createdAt: true,
});
export const updateAlertSchema = insertAlertSchema.partial();
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type UpdateAlert = z.infer<typeof updateAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// Messages
export const insertMessageSchema = createInsertSchema(messages).omit({ 
  id: true, 
  createdAt: true,
  isRead: true 
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Ratings
export const insertRatingSchema = createInsertSchema(ratings).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;

// Pickups
export const insertPickupSchema = createInsertSchema(pickups).omit({ 
  id: true, 
  createdAt: true,
  completedAt: true,
  status: true 
});
export type InsertPickup = z.infer<typeof insertPickupSchema>;
export type Pickup = typeof pickups.$inferSelect;

// Events
export const insertEventSchema = createInsertSchema(events).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Forum Posts
export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;

// Forum Replies
export const insertForumReplySchema = createInsertSchema(forumReplies).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = typeof forumReplies.$inferSelect;

// Notifications
export const insertNotificationSchema = createInsertSchema(notifications).omit({ 
  id: true, 
  createdAt: true,
  isRead: true 
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// User Badges
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ 
  id: true, 
  earnedAt: true 
});
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

// Delivery Requests
export const insertDeliveryRequestSchema = createInsertSchema(deliveryRequests).omit({ id: true, createdAt: true, status: true });
export type InsertDeliveryRequest = z.infer<typeof insertDeliveryRequestSchema>;
export type DeliveryRequest = typeof deliveryRequests.$inferSelect;

// Communities
export const insertCommunitySchema = createInsertSchema(communities).omit({ id: true });
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Community = typeof communities.$inferSelect;

export const insertCommunityMembershipSchema = createInsertSchema(communityMemberships);
export type InsertCommunityMembership = z.infer<typeof insertCommunityMembershipSchema>;
export type CommunityMembership = typeof communityMemberships.$inferSelect;

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, createdAt: true });
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

export const insertCommunityCommentSchema = createInsertSchema(communityComments).omit({ id: true, createdAt: true });
export type InsertCommunityComment = z.infer<typeof insertCommunityCommentSchema>;
export type CommunityComment = typeof communityComments.$inferSelect;

export const insertCommunityMessageSchema = createInsertSchema(communityMessages).omit({ id: true, createdAt: true });
export type InsertCommunityMessage = z.infer<typeof insertCommunityMessageSchema>;
export type CommunityMessage = typeof communityMessages.$inferSelect;
