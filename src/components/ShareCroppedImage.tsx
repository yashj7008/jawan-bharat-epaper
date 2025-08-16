import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Facebook, Twitter, MessageCircle, Download, Share2, X, Check, Link as LinkIcon } from "lucide-react";
import { croppedImageService } from "@/lib/croppedImageService";
import { toast } from "@/components/ui/use-toast";

interface ShareCroppedImageProps {
  isOpen: boolean;
  onClose: () => void;
  croppedImageData: string;
  pageInfo?: string;
  pageNumber?: number;
  date?: string;
}

export function ShareCroppedImage({ isOpen, onClose, croppedImageData, pageInfo, pageNumber, date }: ShareCroppedImageProps) {
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [shareableUrl, setShareableUrl] = useState<string>("");

  // Generate shareable link when component opens
  useEffect(() => {
    if (isOpen && croppedImageData) {
      const imageId = croppedImageService.storeCroppedImage(
        croppedImageData, 
        pageInfo, 
        pageNumber, 
        date
      );
      const url = croppedImageService.generateShareableUrl(imageId);
      setShareableUrl(url);
    }
  }, [isOpen, croppedImageData, pageInfo, pageNumber, date]);

  const handleShare = async (platform: string) => {
    if (!shareableUrl) return;

    try {
      switch (platform) {
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}&quote=${encodeURIComponent(pageInfo || 'Check out this cropped newspaper image!')}`,
            '_blank'
          );
          break;
          
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareableUrl)}&text=${encodeURIComponent(pageInfo || 'Check out this cropped newspaper image!')}`,
            '_blank'
          );
          break;
          
        case 'whatsapp':
          window.open(
            `https://wa.me/?text=${encodeURIComponent(`${pageInfo || 'Check out this cropped newspaper image!'} - ${shareableUrl}`)}`,
            '_blank'
          );
          break;
          
        case 'copy':
          // Copy the shareable link instead of image data
          await navigator.clipboard.writeText(shareableUrl);
          setIsLinkCopied(true);
          setTimeout(() => setIsLinkCopied(false), 2000);
          
          toast({
            title: "Link Copied!",
            description: "Shareable link copied to clipboard",
          });
          break;
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      toast({
        title: "Share Failed",
        description: "Failed to share the image",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = croppedImageData;
    link.download = `cropped-newspaper-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Cropped image download has begun",
    });
  };

  const openShareableLink = () => {
    if (shareableUrl) {
      window.open(shareableUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-96 md:max-w-2xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Cropped Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview of cropped image */}
          <div className="border rounded-lg p-4 bg-muted">
            <div className="text-sm text-muted-foreground mb-2">Preview:</div>
            <img
              src={croppedImageData}
              alt="Cropped image preview"
              className="max-w-full h-auto max-h-44 mx-auto rounded border"
            />
          </div>
          
          {/* Page info */}
          {pageInfo && (
            <div className="text-sm text-muted-foreground text-center">
              {pageInfo}
            </div>
          )}

          {/* Shareable Link */}
          <div className="border rounded-lg p-3 bg-muted">
            <div className="text-sm text-muted-foreground mb-2">Shareable Link:</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareableUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded bg-background"
              />
              <Button onClick={openShareableLink} variant="outline" size="sm">
                <LinkIcon className="h-4 w-4 mr-2" />
                Open
              </Button>
            </div>
          </div>
          
          {/* Share options */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-2"
            >
              <Facebook className="h-4 w-4 text-blue-600" />
              Share on Facebook
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2"
            >
              <Twitter className="h-4 w-4 text-blue-400" />
              Share on Twitter
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleShare('whatsapp')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
              Share on WhatsApp
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleShare('copy')}
              className="flex items-center gap-2"
            >
              {isLinkCopied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
          
          {/* Download button */}
          <Button onClick={handleDownload} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Cropped Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
