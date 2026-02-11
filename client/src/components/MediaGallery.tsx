import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Media {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface MediaGalleryProps {
  media: Media[];
  className?: string;
}

export default function MediaGallery({ media, className }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!media || media.length === 0) {
    return null;
  }

  const currentMedia = media[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    setZoom(1);
    setIsPlaying(false);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    setZoom(1);
    setIsPlaying(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 1));
  };

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
    setZoom(1);
    setIsPlaying(false);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoom(1);
    setIsPlaying(false);
  };

  return (
    <>
      {/* Gallery Grid */}
      <div className={cn("space-y-4", className)}>
        {/* Main Display */}
        <div
          className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted cursor-pointer group"
          onClick={() => openLightbox(selectedIndex)}
        >
          {currentMedia.type === "image" ? (
            <img
              src={currentMedia.url}
              alt={currentMedia.alt || `Media ${selectedIndex + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="relative w-full h-full">
              <video
                src={currentMedia.url}
                className="w-full h-full object-cover"
                controls
                poster={currentMedia.thumbnail}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                <Play className="h-16 w-16 text-white opacity-80" />
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          {media.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Media Counter */}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {selectedIndex + 1} / {media.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {media.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {media.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all",
                  selectedIndex === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/50"
                )}
              >
                {item.type === "image" ? (
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.alt || `Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full bg-muted">
                    <img
                      src={item.thumbnail || item.url}
                      alt={item.alt || `Video thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black/95">
          <div className="relative w-full h-[95vh] flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Zoom Controls (only for images) */}
            {currentMedia.type === "image" && (
              <div className="absolute top-4 left-4 z-50 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <div className="flex items-center justify-center bg-white/20 text-white px-3 rounded text-sm">
                  {Math.round(zoom * 100)}%
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Main Content */}
            <div className="relative w-full h-full flex items-center justify-center p-8">
              {currentMedia.type === "image" ? (
                <img
                  src={currentMedia.url}
                  alt={currentMedia.alt || `Media ${selectedIndex + 1}`}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoom})` }}
                />
              ) : (
                <video
                  src={currentMedia.url}
                  className="max-w-full max-h-full object-contain"
                  controls
                  autoPlay={isPlaying}
                  poster={currentMedia.thumbnail}
                />
              )}
            </div>

            {/* Navigation */}
            {media.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Bottom Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-sm text-white/60">
                    {currentMedia.type === "image" ? "Image" : "Video"} {selectedIndex + 1} of{" "}
                    {media.length}
                  </p>
                  {currentMedia.alt && (
                    <p className="text-sm mt-1">{currentMedia.alt}</p>
                  )}
                </div>

                {/* Thumbnail Navigation */}
                <div className="flex gap-2 max-w-md overflow-x-auto">
                  {media.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedIndex(index);
                        setZoom(1);
                      }}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all",
                        selectedIndex === index
                          ? "border-white ring-2 ring-white/50"
                          : "border-white/30 hover:border-white/80 opacity-60 hover:opacity-100"
                      )}
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.thumbnail || item.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full bg-black">
                          <img
                            src={item.thumbnail || item.url}
                            alt={`Video thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
