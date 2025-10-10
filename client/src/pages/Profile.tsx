import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Mail, Building2, Edit, Camera } from "lucide-react";
import DashboardStats from "@/components/DashboardStats";
import ProfileAvatar from "@/components/ProfileAvatar";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { useState, useEffect } from "react";

export default function Profile() {
  const [user, setUser] = useState<{
    id: string;
    businessName?: string;
    email?: string;
    avatar?: string;
    businessType?: string;
    location?: string;
  } | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleAvatarChange = (newAvatar: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: newAvatar };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Dispatch event to update other components
      window.dispatchEvent(new CustomEvent('userUpdated'));
    }
  };

  const businessData = {
    name: user?.businessName || "Business User",
    email: user?.email || "user@example.com",
    type: user?.businessType || "Business",
    location: user?.location || "Goa, India",
    joinedDate: "January 2025",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Business Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader className="text-center">
                <div className="relative inline-block mb-4">
                  <ProfileAvatar
                    user={user || undefined}
                    size="lg"
                    className="mx-auto"
                  />
                  <ProfilePictureUpload
                    currentAvatar={user?.avatar}
                    onAvatarChange={handleAvatarChange}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-white shadow-md hover:bg-green-50"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </ProfilePictureUpload>
                </div>
                <CardTitle className="text-xl" data-testid="text-business-name">{businessData.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {businessData.type}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span data-testid="text-email">{businessData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span data-testid="text-location">{businessData.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>Member since {businessData.joinedDate}</span>
                </div>
                <Button variant="outline" className="w-full mt-4 rounded-full" data-testid="button-edit-profile">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
                <CardDescription>Track your contribution to Goa's circular economy</CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardStats
                  stats={{
                    wasteDiverted: 847,
                    co2Saved: 356,
                    exchanges: 23,
                    activeListings: 5,
                  }}
                />
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Manage your business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input id="business-name" defaultValue={businessData.name} data-testid="input-business-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-type">Business Type</Label>
                    <Input id="business-type" defaultValue={businessData.type} data-testid="input-business-type" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={businessData.email} data-testid="input-email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" defaultValue={businessData.location} data-testid="input-location" />
                </div>
                <div className="flex gap-4 justify-end mt-6">
                  <Button variant="outline" className="rounded-full" data-testid="button-cancel-edit">Cancel</Button>
                  <Button className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-save-changes">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
