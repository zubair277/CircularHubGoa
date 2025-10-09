import { storage } from "./storage";
import type { Listing, Alert } from "@shared/schema";

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Check if a listing matches an alert
export function listingMatchesAlert(listing: Listing, alert: Alert): boolean {
  if (!alert.isActive) return false;
  
  // Check category match
  const categories = alert.categories as string[];
  if (!categories.includes(listing.category)) return false;
  
  // Check distance (if alert has distance preference)
  if (alert.distanceRadius) {
    const distance = calculateDistance(
      parseFloat(listing.latitude),
      parseFloat(listing.longitude),
      parseFloat(alert.userId), // This should be user's coordinates
      parseFloat(alert.userId)  // Placeholder - need to get user location
    );
    
    if (distance > alert.distanceRadius) return false;
  }
  
  return true;
}

// Find all users who should be notified about a new listing
export async function findMatchingAlerts(listing: Listing): Promise<Alert[]> {
  const activeAlerts = await storage.getAllActiveAlerts();
  
  return activeAlerts.filter(alert => {
    // Don't notify the listing owner
    if (alert.userId === listing.userId) return false;
    
    // Check category match
    const categories = alert.categories as string[];
    if (!categories.includes(listing.category)) return false;
    
    // TODO: Add distance check when user locations are properly stored
    
    return true;
  });
}

// Simple auth middleware - checks if user is logged in
export async function requireAuth(req: any, res: any, next: any) {
  // For now, we'll check if userId is in request headers
  // In a real app, this would check session/JWT
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ error: "Invalid user" });
  }
  
  req.user = user;
  next();
}

// Check if user owns a resource
export function checkOwnership(resourceUserId: string, requestUserId: string): boolean {
  return resourceUserId === requestUserId;
}
