import {
  type User,
  type InsertUser,
  type Listing,
  type InsertListing,
  type Claim,
  type InsertClaim,
  type Alert,
  type InsertAlert,
  type UpdateAlert,
  type Message,
  type InsertMessage,
  type Rating,
  type InsertRating,
  type Pickup,
  type InsertPickup,
  type Event,
  type InsertEvent,
  type ForumPost,
  type InsertForumPost,
  type ForumReply,
  type InsertForumReply,
  type Notification,
  type InsertNotification,
  type UserBadge,
  type InsertUserBadge,
  // community
  type Community,
  type InsertCommunity,
  type CommunityMembership,
  type InsertCommunityMembership,
  type CommunityPost,
  type InsertCommunityPost,
  type CommunityComment,
  type InsertCommunityComment,
  type CommunityMessage,
  type InsertCommunityMessage,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import {
  users as usersTable,
  listings as listingsTable,
  claims as claimsTable,
  alerts as alertsTable,
  messages as messagesTable,
  ratings as ratingsTable,
  pickups as pickupsTable,
  events as eventsTable,
  forumPosts as forumPostsTable,
  forumReplies as forumRepliesTable,
  notifications as notificationsTable,
  userBadges as userBadgesTable,
  communities as communitiesTable,
  communityMemberships as communityMembershipsTable,
  communityPosts as communityPostsTable,
  communityComments as communityCommentsTable,
  communityMessages as communityMessagesTable,
} from "@shared/schema";
import { and, eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Listings
  createListing(listing: InsertListing): Promise<Listing>;
  getListing(id: string): Promise<Listing | undefined>;
  getAllListings(): Promise<Listing[]>;
  getListingsByUser(userId: string): Promise<Listing[]>;
  getListingsByType(type: "offer" | "request"): Promise<Listing[]>;
  updateListing(id: string, updates: Partial<InsertListing>): Promise<Listing | undefined>;
  deleteListing(id: string): Promise<boolean>;

  // Claims
  createClaim(claim: InsertClaim): Promise<Claim>;
  getClaim(id: string): Promise<Claim | undefined>;
  getClaimsByListing(listingId: string): Promise<Claim[]>;
  getClaimsByUser(userId: string): Promise<Claim[]>;
  updateClaimStatus(id: string, status: string): Promise<Claim | undefined>;

  // Alerts
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAlertsByUser(userId: string): Promise<Alert[]>;
  getAllActiveAlerts(): Promise<Alert[]>;
  updateAlert(id: string, updates: UpdateAlert): Promise<Alert | undefined>;
  deleteAlert(id: string): Promise<boolean>;

  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]>;
  getMessagesByUser(userId: string): Promise<Message[]>;
  markMessageAsRead(id: string): Promise<Message | undefined>;
  getUnreadMessageCount(userId: string): Promise<number>;

  // Ratings
  createRating(rating: InsertRating): Promise<Rating>;
  getRatingsByUser(userId: string): Promise<Rating[]>;
  getRatingForClaim(claimId: string): Promise<Rating | undefined>;

  // Pickups
  createPickup(pickup: InsertPickup): Promise<Pickup>;
  getPickup(id: string): Promise<Pickup | undefined>;
  getPickupsByClaim(claimId: string): Promise<Pickup[]>;
  getPickupsByUser(userId: string): Promise<Pickup[]>;
  updatePickupStatus(id: string, status: string, wasteWeight?: number, valueSaved?: number): Promise<Pickup | undefined>;

  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  getAllEvents(): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;

  // Forum
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  getAllForumPosts(): Promise<ForumPost[]>;
  getForumPostsByCategory(category: string): Promise<ForumPost[]>;
  getForumPost(id: string): Promise<ForumPost | undefined>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  getRepliesByPost(postId: string): Promise<ForumReply[]>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // Badges
  createUserBadge(badge: InsertUserBadge): Promise<UserBadge>;
  getBadgesByUser(userId: string): Promise<UserBadge[]>;

  // Community
  createCommunity(c: InsertCommunity): Promise<Community>;
  getCommunities(): Promise<Community[]>;
  joinCommunity(m: InsertCommunityMembership): Promise<CommunityMembership>;
  getCommunityMembers(communityId: string): Promise<CommunityMembership[]>;
  createCommunityPost(p: InsertCommunityPost): Promise<CommunityPost>;
  getCommunityPosts(communityId: string): Promise<CommunityPost[]>;
  createCommunityComment(c: InsertCommunityComment): Promise<CommunityComment>;
  getCommentsByPost(postId: string): Promise<CommunityComment[]>;

  // Community messages
  createCommunityMessage(m: InsertCommunityMessage): Promise<CommunityMessage>;
  getCommunityMessages(communityId: string): Promise<CommunityMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private listings: Map<string, Listing>;
  private claims: Map<string, Claim>;
  private alerts: Map<string, Alert>;
  private messages: Map<string, Message>;
  private ratings: Map<string, Rating>;
  private pickups: Map<string, Pickup>;
  private events: Map<string, Event>;
  private forumPosts: Map<string, ForumPost>;
  private forumReplies: Map<string, ForumReply>;
  private notifications: Map<string, Notification>;
  private userBadges: Map<string, UserBadge>;
  private communities: Map<string, Community>;
  private communityMemberships: Map<string, CommunityMembership>;
  private communityPosts: Map<string, CommunityPost>;
  private communityComments: Map<string, CommunityComment>;
  private communityMessages: Map<string, CommunityMessage>;

  constructor() {
    this.users = new Map();
    this.listings = new Map();
    this.claims = new Map();
    this.alerts = new Map();
    this.messages = new Map();
    this.ratings = new Map();
    this.pickups = new Map();
    this.events = new Map();
    this.forumPosts = new Map();
    this.forumReplies = new Map();
    this.notifications = new Map();
    this.userBadges = new Map();
    this.communities = new Map();
    this.communityMemberships = new Map();
    this.communityPosts = new Map();
    this.communityComments = new Map();
    this.communityMessages = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      latitude: insertUser.latitude ?? null,
      longitude: insertUser.longitude ?? null,
      phone: insertUser.phone ?? null,
      avatar: insertUser.avatar ?? null,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // Listings
  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = randomUUID();
    const listing: Listing = {
      ...insertListing,
      imageUrl: insertListing.imageUrl ?? null,
      id,
      status: "available",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.listings.set(id, listing);
    return listing;
  }

  async getListing(id: string): Promise<Listing | undefined> {
    return this.listings.get(id);
  }

  async getAllListings(): Promise<Listing[]> {
    return Array.from(this.listings.values());
  }

  async getListingsByUser(userId: string): Promise<Listing[]> {
    return Array.from(this.listings.values()).filter(
      (listing) => listing.userId === userId,
    );
  }

  async getListingsByType(type: "offer" | "request"): Promise<Listing[]> {
    return Array.from(this.listings.values()).filter(
      (listing) => listing.listingType === type,
    );
  }

  async updateListing(id: string, updates: Partial<InsertListing>): Promise<Listing | undefined> {
    const listing = this.listings.get(id);
    if (!listing) return undefined;
    const updated = { ...listing, ...updates, updatedAt: new Date() };
    this.listings.set(id, updated);
    return updated;
  }

  async deleteListing(id: string): Promise<boolean> {
    return this.listings.delete(id);
  }

  // Claims
  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const id = randomUUID();
    const claim: Claim = {
      ...insertClaim,
      message: insertClaim.message ?? null,
      id,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.claims.set(id, claim);
    return claim;
  }

  async getClaim(id: string): Promise<Claim | undefined> {
    return this.claims.get(id);
  }

  async getClaimsByListing(listingId: string): Promise<Claim[]> {
    return Array.from(this.claims.values()).filter(
      (claim) => claim.listingId === listingId,
    );
  }

  async getClaimsByUser(userId: string): Promise<Claim[]> {
    return Array.from(this.claims.values()).filter(
      (claim) => claim.claimerId === userId || claim.ownerId === userId,
    );
  }

  async updateClaimStatus(id: string, status: string): Promise<Claim | undefined> {
    const claim = this.claims.get(id);
    if (!claim) return undefined;
    const updated = { ...claim, status, updatedAt: new Date() };
    this.claims.set(id, updated);
    return updated;
  }

  // Alerts
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      ...insertAlert,
      id,
      isActive: true,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async getAlertsByUser(userId: string): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.userId === userId,
    );
  }

  async getAllActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.isActive,
    );
  }

  async updateAlert(id: string, updates: UpdateAlert): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    const updated = { ...alert, ...updates };
    this.alerts.set(id, updated);
    return updated;
  }

  async deleteAlert(id: string): Promise<boolean> {
    return this.alerts.delete(id);
  }

  // Messages
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      relatedClaimId: insertMessage.relatedClaimId ?? null,
      id,
      isRead: false,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (msg) =>
          (msg.senderId === user1Id && msg.receiverId === user2Id) ||
          (msg.senderId === user2Id && msg.receiverId === user1Id),
      )
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async getMessagesByUser(userId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (msg) => msg.senderId === userId || msg.receiverId === userId,
    );
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    const updated = { ...message, isRead: true };
    this.messages.set(id, updated);
    return updated;
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    return Array.from(this.messages.values()).filter(
      (msg) => msg.receiverId === userId && !msg.isRead,
    ).length;
  }

  // Ratings
  async createRating(insertRating: InsertRating): Promise<Rating> {
    const id = randomUUID();
    const rating: Rating = {
      ...insertRating,
      review: insertRating.review ?? null,
      id,
      createdAt: new Date(),
    };
    this.ratings.set(id, rating);
    return rating;
  }

  async getRatingsByUser(userId: string): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(
      (rating) => rating.revieweeId === userId,
    );
  }

  async getRatingForClaim(claimId: string): Promise<Rating | undefined> {
    return Array.from(this.ratings.values()).find(
      (rating) => rating.claimId === claimId,
    );
  }

  // Pickups
  async createPickup(insertPickup: InsertPickup): Promise<Pickup> {
    const id = randomUUID();
    const pickup: Pickup = {
      ...insertPickup,
      wasteWeight: insertPickup.wasteWeight ?? null,
      valueSaved: insertPickup.valueSaved ?? null,
      notes: insertPickup.notes ?? null,
      id,
      status: "scheduled",
      completedAt: null,
      createdAt: new Date(),
    };
    this.pickups.set(id, pickup);
    return pickup;
  }

  async getPickup(id: string): Promise<Pickup | undefined> {
    return this.pickups.get(id);
  }

  async getPickupsByClaim(claimId: string): Promise<Pickup[]> {
    return Array.from(this.pickups.values()).filter(
      (pickup) => pickup.claimId === claimId,
    );
  }

  async getPickupsByUser(userId: string): Promise<Pickup[]> {
    const userClaims = await this.getClaimsByUser(userId);
    const claimIds = new Set(userClaims.map((c) => c.id));
    return Array.from(this.pickups.values()).filter((pickup) =>
      claimIds.has(pickup.claimId),
    );
  }

  async updatePickupStatus(
    id: string,
    status: string,
    wasteWeight?: number,
    valueSaved?: number,
  ): Promise<Pickup | undefined> {
    const pickup = this.pickups.get(id);
    if (!pickup) return undefined;
    const updated = {
      ...pickup,
      status,
      wasteWeight: wasteWeight !== undefined ? String(wasteWeight) : pickup.wasteWeight,
      valueSaved: valueSaved !== undefined ? String(valueSaved) : pickup.valueSaved,
      completedAt: status === "completed" ? new Date() : pickup.completedAt,
    };
    this.pickups.set(id, updated);
    return updated;
  }

  // Events
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = {
      ...insertEvent,
      imageUrl: insertEvent.imageUrl ?? null,
      organizerId: insertEvent.organizerId ?? null,
      maxParticipants: insertEvent.maxParticipants ?? null,
      id,
      createdAt: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values())
      .filter((event) => event.eventDate && new Date(event.eventDate) > now)
      .sort((a, b) => {
        const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
        const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
        return dateA - dateB;
      });
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  // Forum
  async createForumPost(insertPost: InsertForumPost): Promise<ForumPost> {
    const id = randomUUID();
    const post: ForumPost = {
      ...insertPost,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.forumPosts.set(id, post);
    return post;
  }

  async getAllForumPosts(): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values());
  }

  async getForumPostsByCategory(category: string): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values()).filter(
      (post) => post.category === category,
    );
  }

  async getForumPost(id: string): Promise<ForumPost | undefined> {
    return this.forumPosts.get(id);
  }

  async createForumReply(insertReply: InsertForumReply): Promise<ForumReply> {
    const id = randomUUID();
    const reply: ForumReply = {
      ...insertReply,
      id,
      createdAt: new Date(),
    };
    this.forumReplies.set(id, reply);
    return reply;
  }

  async getRepliesByPost(postId: string): Promise<ForumReply[]> {
    return Array.from(this.forumReplies.values()).filter(
      (reply) => reply.postId === postId,
    );
  }

  // Notifications
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      relatedId: insertNotification.relatedId ?? null,
      id,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notif) => notif.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notif) => notif.userId === userId && !notif.isRead,
    );
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    const updated = { ...notification, isRead: true };
    this.notifications.set(id, updated);
    return updated;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values()).filter(
      (notif) => notif.userId === userId && !notif.isRead,
    ).length;
  }

  // Badges
  async createUserBadge(insertBadge: InsertUserBadge): Promise<UserBadge> {
    const id = randomUUID();
    const badge: UserBadge = {
      ...insertBadge,
      id,
      earnedAt: new Date(),
    };
    this.userBadges.set(id, badge);
    return badge;
  }

  async getBadgesByUser(userId: string): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values()).filter(
      (badge) => badge.userId === userId,
    );
  }

  // Community
  async createCommunity(insert: InsertCommunity): Promise<Community> {
    const id = randomUUID();
    const c: Community = { ...insert, imageUrl: insert.imageUrl ?? null, id } as any;
    this.communities.set(id, c);
    return c;
  }

  async getCommunities(): Promise<Community[]> {
    return Array.from(this.communities.values());
  }

  async joinCommunity(m: InsertCommunityMembership): Promise<CommunityMembership> {
    const key = `${m.userId}:${m.communityId}`;
    const row: CommunityMembership = { ...m, joinedAt: new Date() } as any;
    this.communityMemberships.set(key, row);
    return row;
  }

  async getCommunityMembers(communityId: string): Promise<CommunityMembership[]> {
    return Array.from(this.communityMemberships.values()).filter(m => m.communityId === communityId);
  }

  async createCommunityPost(p: InsertCommunityPost): Promise<CommunityPost> {
    const id = randomUUID();
    const row: CommunityPost = { ...p, id, createdAt: new Date() } as any;
    this.communityPosts.set(id, row);
    return row;
  }

  async getCommunityPosts(communityId: string): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values()).filter(p => p.communityId === communityId);
  }

  async createCommunityComment(c: InsertCommunityComment): Promise<CommunityComment> {
    const id = randomUUID();
    const row: CommunityComment = { ...c, id, createdAt: new Date() } as any;
    this.communityComments.set(id, row);
    return row;
  }

  async getCommentsByPost(postId: string): Promise<CommunityComment[]> {
    return Array.from(this.communityComments.values()).filter(c => c.postId === postId);
  }

  // Community messages
  async createCommunityMessage(m: InsertCommunityMessage): Promise<CommunityMessage> {
    const id = randomUUID();
    const row: CommunityMessage = { ...m, id, createdAt: new Date() } as any;
    this.communityMessages.set(id, row);
    return row;
  }

  async getCommunityMessages(communityId: string): Promise<CommunityMessage[]> {
    return Array.from(this.communityMessages.values())
      .filter(msg => msg.communityId === communityId)
      .sort((a, b) => (new Date(a.createdAt as any).getTime()) - (new Date(b.createdAt as any).getTime()));
  }
}

export const storage = new MemStorage();
