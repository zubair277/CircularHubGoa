import type { Express } from "express";
import { createServer, type Server } from "http";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // ========== Auth Routes ==========
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, businessType, location, phone, latitude, longitude } = req.body;
      
      if (!name || !email || !password || !businessType || !location) {
        return res.status(400).json({ error: "Missing required fields: name, email, password, businessType, location" });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          businessName: name,
          businessType,
          location,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          phone: phone || null,
        }
      });

      // Return user without password
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Return user without password
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ success: true });
  });

  // ========== User Routes ==========
  app.get("/api/users", async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          businessName: true,
          businessType: true,
          location: true,
          avatar: true,
          verified: true,
          createdAt: true
        }
      });
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          email: true,
          businessName: true,
          businessType: true,
          location: true,
          avatar: true,
          verified: true,
          createdAt: true,
          listings: true,
          _count: {
            select: {
              listings: true,
              receivedRatings: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // ========== Listing Routes ==========
  app.get("/api/listings", async (req, res) => {
    try {
      const { category, listingType, location, limit = 20, offset = 0 } = req.query;
      
      const whereClause: any = {};
      
      if (category) whereClause.category = category;
      if (listingType) whereClause.listingType = listingType;
      if (location) {
        whereClause.location = {
          contains: location as string,
          mode: 'insensitive'
        };
      }

      const listings = await prisma.listing.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              businessName: true,
              avatar: true,
              verified: true
            }
          },
          _count: {
            select: { claims: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      res.json(listings);
    } catch (error) {
      console.error("Get listings error:", error);
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  app.post("/api/listings", async (req, res) => {
    try {
      const {
        userId, title, description, category, quantity, unit,
        location, latitude, longitude, availability, listingType, imageUrl
      } = req.body;

      if (!userId || !title || !description || !category || !quantity || !location || !latitude || !longitude) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const listing = await prisma.listing.create({
        data: {
          userId,
          title,
          description,
          category,
          quantity: parseFloat(quantity),
          unit,
          location,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          availability,
          listingType,
          imageUrl: imageUrl || null
        },
        include: {
          user: {
            select: {
              businessName: true,
              avatar: true
            }
          }
        }
      });

      // Check for matching alerts and create notifications
      await checkAlertsForListing(listing);

      res.json(listing);
    } catch (error) {
      console.error("Create listing error:", error);
      res.status(500).json({ error: "Failed to create listing" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await prisma.listing.findUnique({
        where: { id: req.params.id },
        include: {
          user: {
            select: {
              id: true,
              businessName: true,
              avatar: true,
              verified: true,
              phone: true
            }
          },
          claims: {
            include: {
              buyer: {
                select: {
                  businessName: true,
                  avatar: true
                }
              }
            }
          }
        }
      });

      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      res.json(listing);
    } catch (error) {
      console.error("Get listing error:", error);
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });

  app.put("/api/listings/:id", async (req, res) => {
    try {
      const { userId, ...updateData } = req.body;

      // Verify ownership
      const listing = await prisma.listing.findUnique({
        where: { id: req.params.id }
      });

      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      if (listing.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to update this listing" });
      }

      const updatedListing = await prisma.listing.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          user: {
            select: {
              businessName: true,
              avatar: true
            }
          }
        }
      });

      res.json(updatedListing);
    } catch (error) {
      console.error("Update listing error:", error);
      res.status(500).json({ error: "Failed to update listing" });
    }
  });

  app.delete("/api/listings/:id", async (req, res) => {
    try {
      const { userId } = req.body;

      // Verify ownership
      const listing = await prisma.listing.findUnique({
        where: { id: req.params.id }
      });

      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      if (listing.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this listing" });
      }

      await prisma.listing.delete({
        where: { id: req.params.id }
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Delete listing error:", error);
      res.status(500).json({ error: "Failed to delete listing" });
    }
  });

  // ========== Claims Routes ==========
  app.post("/api/claims", async (req, res) => {
    try {
      const { listingId, buyerId, sellerId, message } = req.body;

      if (!listingId || !buyerId || !sellerId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if listing exists and is available
      const listing = await prisma.listing.findUnique({
        where: { id: listingId }
      });

      if (!listing || listing.status !== "available") {
        return res.status(400).json({ error: "Listing not available for claiming" });
      }

      const claim = await prisma.claim.create({
        data: {
          listingId,
          buyerId,
          sellerId,
          message: message || null
        },
        include: {
          listing: true,
          buyer: {
            select: {
              businessName: true,
              avatar: true
            }
          }
        }
      });

      // Create notification for seller
      await prisma.notification.create({
        data: {
          userId: sellerId,
          type: "new_claim",
          title: "New Claim on Your Listing",
          message: `${claim.buyer.businessName} is interested in "${listing.title}"`,
          relatedId: claim.id
        }
      });

      res.json(claim);
    } catch (error) {
      console.error("Create claim error:", error);
      res.status(500).json({ error: "Failed to create claim" });
    }
  });

  app.get("/api/claims", async (req, res) => {
    try {
      const { userId, status } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const whereClause: any = {
        OR: [
          { buyerId: userId as string },
          { sellerId: userId as string }
        ]
      };

      if (status) {
        whereClause.status = status;
      }

      const claims = await prisma.claim.findMany({
        where: whereClause,
        include: {
          listing: true,
          buyer: {
            select: {
              businessName: true,
              avatar: true
            }
          },
          seller: {
            select: {
              businessName: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(claims);
    } catch (error) {
      console.error("Get claims error:", error);
      res.status(500).json({ error: "Failed to fetch claims" });
    }
  });

  app.put("/api/claims/:id/status", async (req, res) => {
    try {
      const { status, userId } = req.body;

      // Verify ownership (only seller can update claim status)
      const claim = await prisma.claim.findUnique({
        where: { id: req.params.id },
        include: { listing: true }
      });

      if (!claim) {
        return res.status(404).json({ error: "Claim not found" });
      }

      if (claim.sellerId !== userId) {
        return res.status(403).json({ error: "Not authorized to update this claim" });
      }

      const updatedClaim = await prisma.claim.update({
        where: { id: req.params.id },
        data: { status }
      });

      // Update listing status if claim is accepted
      if (status === "accepted") {
        await prisma.listing.update({
          where: { id: claim.listingId },
          data: { status: "claimed" }
        });
      }

      res.json(updatedClaim);
    } catch (error) {
      console.error("Update claim status error:", error);
      res.status(500).json({ error: "Failed to update claim status" });
    }
  });

  // ========== Community Routes ==========
  app.get("/api/communities", async (req, res) => {
    try {
      const communities = await prisma.community.findMany({
        include: {
          creator: {
            select: {
              businessName: true,
              avatar: true
            }
          },
          _count: {
            select: {
              memberships: true,
              posts: true,
              messages: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(communities);
    } catch (error) {
      console.error("Get communities error:", error);
      res.status(500).json({ error: "Failed to fetch communities" });
    }
  });

  app.post("/api/communities", async (req, res) => {
    try {
      const { name, description, category, creatorId, imageUrl } = req.body;

      if (!name || !description || !creatorId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const community = await prisma.community.create({
        data: {
          name,
          description,
          category: category || null,
          creatorId,
          imageUrl: imageUrl || null
        },
        include: {
          creator: {
            select: {
              businessName: true,
              avatar: true
            }
          }
        }
      });

      // Auto-join creator as admin
      await prisma.communityMembership.create({
        data: {
          userId: creatorId,
          communityId: community.id,
          role: "admin"
        }
      });

      res.json(community);
    } catch (error) {
      console.error("Create community error:", error);
      res.status(500).json({ error: "Failed to create community" });
    }
  });

  app.get("/api/communities/:id", async (req, res) => {
    try {
      const community = await prisma.community.findUnique({
        where: { id: req.params.id },
        include: {
          creator: {
            select: {
              businessName: true,
              avatar: true
            }
          },
          memberships: {
            include: {
              user: {
                select: {
                  businessName: true,
                  avatar: true
                }
              }
            }
          },
          posts: {
            include: {
              author: {
                select: {
                  businessName: true,
                  avatar: true
                }
              },
              _count: {
                select: { comments: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      res.json(community);
    } catch (error) {
      console.error("Get community error:", error);
      res.status(500).json({ error: "Failed to fetch community" });
    }
  });

  app.post("/api/communities/:id/join", async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      // Check if already a member
      const existingMembership = await prisma.communityMembership.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId: req.params.id
          }
        }
      });

      if (existingMembership) {
        return res.status(400).json({ error: "Already a member of this community" });
      }

      const membership = await prisma.communityMembership.create({
        data: {
          userId,
          communityId: req.params.id
        }
      });

      res.json(membership);
    } catch (error) {
      console.error("Join community error:", error);
      res.status(500).json({ error: "Failed to join community" });
    }
  });

  app.get("/api/communities/:id/messages", async (req, res) => {
    try {
      const messages = await prisma.communityMessage.findMany({
        where: { communityId: req.params.id },
        include: {
          author: {
            select: {
              businessName: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      res.json(messages);
    } catch (error) {
      console.error("Get community messages error:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/communities/:id/messages", async (req, res) => {
    try {
      const { authorId, content } = req.body;

      if (!authorId || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const message = await prisma.communityMessage.create({
        data: {
          communityId: req.params.id,
          authorId,
          content
        },
        include: {
          author: {
            select: {
              businessName: true,
              avatar: true
            }
          }
        }
      });

      res.json(message);
    } catch (error) {
      console.error("Create community message error:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // ========== Alerts Routes ==========
  app.get("/api/alerts", async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const alerts = await prisma.alert.findMany({
        where: { userId: userId as string },
        orderBy: { createdAt: 'desc' }
      });

      res.json(alerts);
    } catch (error) {
      console.error("Get alerts error:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const { userId, keywords, categoryId, radiusKm, userLatitude, userLongitude } = req.body;

      if (!userId || !keywords || !radiusKm) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const alert = await prisma.alert.create({
        data: {
          userId,
          keywords,
          categoryId: categoryId || null,
          radiusKm,
          userLatitude: userLatitude ? parseFloat(userLatitude) : null,
          userLongitude: userLongitude ? parseFloat(userLongitude) : null
        }
      });

      res.json(alert);
    } catch (error) {
      console.error("Create alert error:", error);
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const { userId } = req.body;

      // Verify ownership
      const alert = await prisma.alert.findUnique({
        where: { id: req.params.id }
      });

      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }

      if (alert.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this alert" });
      }

      await prisma.alert.delete({
        where: { id: req.params.id }
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Delete alert error:", error);
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });

  // ========== Notifications Routes ==========
  app.get("/api/notifications", async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const notifications = await prisma.notification.findMany({
        where: { userId: userId as string },
        orderBy: { createdAt: 'desc' }
      });

      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const notification = await prisma.notification.update({
        where: { id: req.params.id },
        data: { isRead: true }
      });

      res.json(notification);
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // ========== User Preferences Routes ==========
  app.get("/api/users/:userId/preferences", async (req, res) => {
    try {
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: req.params.userId }
      });

      if (!preferences) {
        // Return default preferences if none exist
        return res.json({
          theme: "system",
          savedFilters: null,
          notifications: null,
          defaultRadius: 5000
        });
      }

      res.json(preferences);
    } catch (error) {
      console.error("Get preferences error:", error);
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  app.post("/api/users/:userId/preferences", async (req, res) => {
    try {
      const { theme, savedFilters, notifications, defaultRadius } = req.body;

      const preferences = await prisma.userPreferences.upsert({
        where: { userId: req.params.userId },
        update: {
          theme: theme || undefined,
          savedFilters: savedFilters ? JSON.stringify(savedFilters) : undefined,
          notifications: notifications ? JSON.stringify(notifications) : undefined,
          defaultRadius: defaultRadius || undefined
        },
        create: {
          userId: req.params.userId,
          theme: theme || "system",
          savedFilters: savedFilters ? JSON.stringify(savedFilters) : null,
          notifications: notifications ? JSON.stringify(notifications) : null,
          defaultRadius: defaultRadius || 5000
        }
      });

      res.json(preferences);
    } catch (error) {
      console.error("Save preferences error:", error);
      res.status(500).json({ error: "Failed to save preferences" });
    }
  });

  // ========== Search History Routes ==========
  app.get("/api/users/:userId/search-history", async (req, res) => {
    try {
      const history = await prisma.searchHistory.findMany({
        where: { userId: req.params.userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      res.json(history);
    } catch (error) {
      console.error("Get search history error:", error);
      res.status(500).json({ error: "Failed to fetch search history" });
    }
  });

  app.post("/api/search-history", async (req, res) => {
    try {
      const { userId, query } = req.body;

      if (!userId || !query) {
        return res.status(400).json({ error: "userId and query are required" });
      }

      const history = await prisma.searchHistory.create({
        data: { userId, query }
      });

      res.json(history);
    } catch (error) {
      console.error("Save search history error:", error);
      res.status(500).json({ error: "Failed to save search history" });
    }
  });

  app.delete("/api/search-history/:id", async (req, res) => {
    try {
      await prisma.searchHistory.delete({
        where: { id: req.params.id }
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Delete search history error:", error);
      res.status(500).json({ error: "Failed to delete search history" });
    }
  });

  // ========== Listing Media Routes ==========
  app.post("/api/listings/:listingId/media", async (req, res) => {
    try {
      const { type, url, thumbnail, alt, order } = req.body;

      if (!type || !url) {
        return res.status(400).json({ error: "type and url are required" });
      }

      const media = await prisma.listingMedia.create({
        data: {
          listingId: req.params.listingId,
          type,
          url,
          thumbnail: thumbnail || null,
          alt: alt || null,
          order: order || 0
        }
      });

      res.json(media);
    } catch (error) {
      console.error("Add listing media error:", error);
      res.status(500).json({ error: "Failed to add media" });
    }
  });

  app.get("/api/listings/:listingId/media", async (req, res) => {
    try {
      const media = await prisma.listingMedia.findMany({
        where: { listingId: req.params.listingId },
        orderBy: { order: 'asc' }
      });

      res.json(media);
    } catch (error) {
      console.error("Get listing media error:", error);
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  app.delete("/api/media/:id", async (req, res) => {
    try {
      await prisma.listingMedia.delete({
        where: { id: req.params.id }
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Delete media error:", error);
      res.status(500).json({ error: "Failed to delete media" });
    }
  });

  // ========== Advanced Search Route ==========
  app.post("/api/listings/search", async (req, res) => {
    try {
      const {
        query,
        categories,
        quantityRange,
        dateRange,
        listingType,
        availability,
        userId
      } = req.body;

      const whereClause: any = {
        status: "available"
      };

      // Text search
      if (query) {
        whereClause.OR = [
          { title: { contains: query } },
          { description: { contains: query } }
        ];
      }

      // Category filter
      if (categories && categories.length > 0) {
        whereClause.category = { in: categories };
      }

      // Quantity range filter
      if (quantityRange) {
        whereClause.quantity = {
          gte: quantityRange[0],
          lte: quantityRange[1]
        };
      }

      // Date range filter
      if (dateRange && dateRange.from) {
        whereClause.createdAt = {
          gte: new Date(dateRange.from),
          ...(dateRange.to && { lte: new Date(dateRange.to) })
        };
      }

      // Listing type filter
      if (listingType && listingType.length > 0) {
        whereClause.listingType = { in: listingType };
      }

      // Availability filter
      if (availability && availability.length > 0) {
        whereClause.availability = { in: availability };
      }

      const listings = await prisma.listing.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              businessName: true,
              businessType: true,
              avatar: true
            }
          },
          media: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Save search query to history if userId provided
      if (userId && query) {
        await prisma.searchHistory.create({
          data: { userId, query }
        }).catch(() => {
          // Ignore errors for search history
        });
      }

      res.json(listings);
    } catch (error) {
      console.error("Advanced search error:", error);
      res.status(500).json({ error: "Failed to search listings" });
    }
  });

  // ========== Helper Functions ==========
  
  // Check alerts for new listings and create notifications
  async function checkAlertsForListing(listing: any) {
    try {
      const alerts = await prisma.alert.findMany({
        where: {
          isActive: true,
          userId: { not: listing.userId } // Don't notify the listing owner
        }
      });

      for (const alert of alerts) {
        const keywordsMatch = alert.keywords.toLowerCase().split(' ').some((keyword: string) =>
          listing.title.toLowerCase().includes(keyword) ||
          listing.description.toLowerCase().includes(keyword)
        );

        const categoryMatches = !alert.categoryId || 
          listing.category.toLowerCase() === alert.categoryId.toLowerCase();

        let withinRadius = true;
        if (alert.userLatitude && alert.userLongitude && listing.latitude && listing.longitude) {
          const distance = calculateDistance(
            parseFloat(alert.userLatitude.toString()),
            parseFloat(alert.userLongitude.toString()),
            parseFloat(listing.latitude.toString()),
            parseFloat(listing.longitude.toString())
          );
          withinRadius = distance <= alert.radiusKm;
        }

        if (keywordsMatch && categoryMatches && withinRadius) {
          await prisma.notification.create({
            data: {
              userId: alert.userId,
              type: "listing_match",
              title: "New Item Matches Your Alert!",
              message: `"${listing.title}" matches your alert for "${alert.keywords}"`,
              relatedId: listing.id
            }
          });
        }
      }
    } catch (error) {
      console.error("Error checking alerts:", error);
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}