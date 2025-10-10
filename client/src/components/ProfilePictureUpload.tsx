import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfilePictureUploadProps {
  currentAvatar?: string;
  onAvatarChange: (newAvatar: string) => void;
  children: React.ReactNode;
}

export default function ProfilePictureUpload({
  currentAvatar,
  onAvatarChange,
  children,
}: ProfilePictureUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, GIF, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = () => {
    if (selectedFile && previewUrl) {
      // In a real app, you would upload the file to a server
      // For now, we'll just use the preview URL as the new avatar
      onAvatarChange(previewUrl);
      
      toast({
        title: "Profile picture updated!",
        description: "Your new profile picture has been saved.",
      });
      
      setIsOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setIsOpen(false);
  };

  const handleRemovePicture = () => {
    onAvatarChange('');
    toast({
      title: "Profile picture removed",
      description: "Your profile picture has been removed.",
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current/Preview Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt="Current avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-green-100 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-green-600" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose New Picture
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {currentAvatar && (
              <Button
                onClick={handleRemovePicture}
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Remove Picture
              </Button>
            )}
            
            <Button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>

          <Button
            onClick={handleCancel}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
