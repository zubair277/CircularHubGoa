import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { useAlerts } from "@/hooks/useAlerts";
import MapView from "@/components/MapView";

const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  latitude: z.number(),
  longitude: z.number(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export default function AddListing() {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { getActiveAlerts } = useAlerts();
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>([15.4909, 73.8278]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Check if user is logged in
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('AddListing page loaded, current user:', user);
    if (!user.id) {
      console.log('No user found, redirecting to home');
      window.location.href = '/';
    }
  }, []);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPG, etc.)",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to check for matching alerts and notify users
  const checkMatchingAlerts = (listingData: any) => {
    try {
      const activeAlerts = getActiveAlerts();
      const matchingAlerts = activeAlerts.filter(alert => {
        // Check if keywords match (case insensitive)
        const keywordsMatch = alert.keywords.toLowerCase().split(' ').some(keyword => 
          listingData.title.toLowerCase().includes(keyword) ||
          listingData.description.toLowerCase().includes(keyword)
        );
        
        // Check if category matches (if specified in alert)
        const categoryMatch = !alert.category || alert.category.toLowerCase() === listingData.category.toLowerCase();
        
        return keywordsMatch && categoryMatch;
      });

      // Notify users with matching alerts
      matchingAlerts.forEach(alert => {
        // Only notify if it's not the same user who created the listing
        if (alert.userId !== listingData.userId) {
          addNotification({
            type: 'alert_triggered',
            title: 'New Match Found!',
            message: `"${listingData.title}" matches your alert for "${alert.keywords}"`,
            data: { 
              alertId: alert.id, 
              listingId: listingData.id,
              listingTitle: listingData.title,
              alertKeywords: alert.keywords
            }
          });
        }
      });

      console.log(`Found ${matchingAlerts.length} matching alerts for listing: ${listingData.title}`);
    } catch (error) {
      console.error('Error checking matching alerts:', error);
    }
  };

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      quantity: "",
      unit: "kg",
      latitude: 15.4909,
      longitude: 73.8278,
    },
  });

  // Add form submission debugging
  const handleFormSubmit = (data: ListingFormData) => {
    console.log('=== FORM VALIDATION PASSED ===');
    console.log('Validated data:', data);
    onSubmit(data);
  };

  const onSubmit = async (data: ListingFormData) => {
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form submitted with data:', data);
    
    try {
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current user:', user);
      
      if (!user.id) {
        console.log('No user found in localStorage');
        toast({
          title: "Error",
          description: "Please log in to create a listing",
          variant: "destructive"
        });
        return;
      }

      let imageUrl = null;
      
      // Handle image upload if selected
      if (selectedImage) {
        try {
          // Convert image to data URL for local storage
          imageUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              console.log('Image converted to data URL:', result);
              resolve(result);
            };
            reader.onerror = () => {
              console.warn('Image processing error');
              reject(new Error('Failed to process image'));
            };
            reader.readAsDataURL(selectedImage);
          });
          
          console.log('Image processed successfully:', imageUrl);
        } catch (uploadError) {
          console.warn('Image processing error:', uploadError);
          imageUrl = null; // Ensure it's null if processing fails
        }
      }

      // Generate a unique ID for the listing
      const listingId = 'listing_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      const listingData = {
        id: listingId,
        userId: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        quantity: parseFloat(data.quantity) || 0,
        unit: data.unit,
        location: 'Goa, India',
        latitude: data.latitude.toString(),
        longitude: data.longitude.toString(),
        availability: 'one-time',
        listingType: 'offer',
        imageUrl: imageUrl,
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add properties required by ListingCard
        businessName: user.businessName || 'Unknown Business',
        businessType: user.businessType || 'Business',
        distance: Math.random() * 5 // Generate random distance
      };

      console.log('Creating listing data:', listingData);
      console.log('Image URL in listing data:', listingData.imageUrl);

      // Prepare API data with correct field names and types
      const apiData = {
        userId: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        quantity: parseFloat(data.quantity) || 0,
        unit: data.unit,
        location: 'Goa, India',
        latitude: data.latitude,
        longitude: data.longitude,
        availability: 'one-time',
        listingType: 'offer',
        imageUrl: imageUrl,
      };
      
      console.log('Saving listing locally:', listingData);

      // Save to localStorage (primary storage - no API calls)
      const existingListings = JSON.parse(localStorage.getItem('listings') || '[]');
      existingListings.push(listingData);
      localStorage.setItem('listings', JSON.stringify(existingListings));
      console.log('Listing saved to localStorage:', listingData);
      
      // Trigger listing update event
      window.dispatchEvent(new CustomEvent('listingUpdated'));
      
      // Check for matching alerts and notify users
      checkMatchingAlerts(listingData);
      
      toast({
        title: "Listing created!",
        description: "Your listing has been saved and published to the marketplace.",
      });
      
      // Add notification
      addNotification({
        type: 'listing_created',
        title: 'Listing Published!',
        message: `"${data.title}" has been added to the marketplace`,
        data: { listingId: listingData.id, title: data.title }
      });
      
      form.reset();
      setSelectedImage(null);
      setImagePreview(null);
      
      // Redirect to marketplace to see the new listing
      window.location.href = '/marketplace';
      
    } catch (error) {
      console.error('Listing creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2">Add New Listing</h1>
        <p className="text-muted-foreground mb-8">Share your waste or surplus materials with the community</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>Listing Details</CardTitle>
                <CardDescription>Provide information about the materials you want to exchange</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fresh Organic Kitchen Waste" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="organic">Organic</SelectItem>
                            <SelectItem value="plastic">Plastic</SelectItem>
                            <SelectItem value="glass">Glass</SelectItem>
                            <SelectItem value="paper">Paper</SelectItem>
                            <SelectItem value="electronics">Electronics</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="25" {...field} data-testid="input-quantity" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-unit">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="units">units</SelectItem>
                              <SelectItem value="liters">liters</SelectItem>
                              <SelectItem value="pieces">pieces</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the materials, condition, and any special handling instructions..."
                          className="min-h-24"
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Image Upload</FormLabel>
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer block"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                    </label>
                    
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Pickup Location
                </CardTitle>
                <CardDescription>Select where the materials can be collected from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] rounded-lg overflow-hidden">
                  <MapView
                    listings={[]}
                    center={selectedLocation}
                    selectable
                    onSelect={(coords) => {
                      setSelectedLocation([coords.lat, coords.lng]);
                      form.setValue("latitude", coords.lat, { shouldValidate: true });
                      form.setValue("longitude", coords.lng, { shouldValidate: true });
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Click on the map to set your pickup location
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => form.reset()} className="rounded-full" data-testid="button-cancel">
                Cancel
              </Button>
              <Button type="submit" className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-submit">
                Publish Listing
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
