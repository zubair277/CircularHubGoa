import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const createAlertSchema = z.object({
  keywords: z.string().min(1, "Keywords are required"),
  categoryId: z.string().optional(),
  radiusKm: z.number().min(1, "Radius must be at least 1km"),
  userLatitude: z.number().optional(),
  userLongitude: z.number().optional(),
});

type CreateAlertFormData = z.infer<typeof createAlertSchema>;

const CATEGORIES = [
  { value: "organic", label: "Organic" },
  { value: "glass", label: "Glass" },
  { value: "plastic", label: "Plastic" },
  { value: "metal", label: "Metal" },
  { value: "textile", label: "Textile" },
  { value: "paper", label: "Paper" },
  { value: "electronics", label: "Electronics" },
];

const RADIUS_OPTIONS = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
];

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKeywords?: string;
  userLocation?: { latitude: number; longitude: number };
}

export default function CreateAlertModal({
  isOpen,
  onClose,
  initialKeywords = "",
  userLocation,
}: CreateAlertModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateAlertFormData>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: {
      keywords: initialKeywords,
      categoryId: "",
      radiusKm: 10,
      userLatitude: userLocation?.latitude,
      userLongitude: userLocation?.longitude,
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async (data: CreateAlertFormData) => {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId: "demo-user-1", // TODO: Get from auth context
        }),
      });
      if (!response.ok) throw new Error("Failed to create alert");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Alert created!",
        description: "We'll notify you when matching items are available.",
      });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create alert",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateAlertFormData) => {
    createAlertMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Alert</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              {...form.register("keywords")}
              placeholder="e.g., organic waste, glass bottles"
            />
            {form.formState.errors.keywords && (
              <p className="text-sm text-red-500">{form.formState.errors.keywords.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select onValueChange={(value) => form.setValue("categoryId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="radius">Notify me within</Label>
            <Select
              onValueChange={(value) => form.setValue("radiusKm", parseInt(value))}
              defaultValue="10"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select radius" />
              </SelectTrigger>
              <SelectContent>
                {RADIUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAlertMutation.isPending}>
              {createAlertMutation.isPending ? "Creating..." : "Save Alert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
