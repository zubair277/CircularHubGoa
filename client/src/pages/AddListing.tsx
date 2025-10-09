import { useState } from "react";
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
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>([15.4909, 73.8278]);

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

  const onSubmit = (data: ListingFormData) => {
    console.log('Form submitted:', data);
    toast({
      title: "Listing created!",
      description: "Your listing has been successfully published to the marketplace.",
    });
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2">Add New Listing</h1>
        <p className="text-muted-foreground mb-8">Share your waste or surplus materials with the community</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
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
