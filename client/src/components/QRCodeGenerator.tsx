import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download, Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface QRCodeGeneratorProps {
  data: string;
  title?: string;
  size?: number;
  filename?: string;
  showShareButton?: boolean;
}

export default function QRCodeGenerator({
  data,
  title = "QR Code",
  size = 256,
  filename = "qrcode.png",
  showShareButton = true,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        data,
        {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) {
            console.error("Error generating QR code:", error);
            toast({
              title: "Error",
              description: "Failed to generate QR code",
              variant: "destructive",
            });
          }
        }
      );
    }
  }, [data, size, toast]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.click();
      toast({
        title: "Success",
        description: "QR code downloaded successfully",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: data,
        });
      } catch (error) {
        console.log("Share canceled or failed");
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="bg-white p-4 rounded-lg">
            <canvas ref={canvasRef} />
          </div>
          
          <div className="flex gap-2 w-full">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleCopyLink} variant="outline" className="flex-1">
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            {showShareButton && (
              <Button onClick={handleShare} variant="outline">
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Scan this QR code to view the listing directly
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
