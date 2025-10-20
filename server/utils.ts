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

// Simple auth middleware - checks if user is logged in
export async function requireAuth(req: any, res: any, next: any) {
  // For now, we'll check if userId is in request headers
  // In a real app, this would check session/JWT
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Mock user check - in a real app this would check against database
  if (!userId) {
    return res.status(401).json({ error: "Invalid user" });
  }
  
  req.user = { id: userId };
  next();
}

// Check if user owns a resource
export function checkOwnership(resourceUserId: string, requestUserId: string): boolean {
  return resourceUserId === requestUserId;
}
