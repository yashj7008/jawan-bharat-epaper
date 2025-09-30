import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Home } from "lucide-react";
import { croppedImageService } from "@/lib/croppedImageService";
import { toast } from "@/components/ui/use-toast";
import jawanBharatLogo from "@/assets/jawan-bharat-logo.jpg";

export function CroppedImage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [imageData, setImageData] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCroppedImage = async () => {
      if (!id) {
        setError("No image ID provided");
        setLoading(false);
        return;
      }

      try {
        const croppedImage = await croppedImageService.getCroppedImage(id);

        if (croppedImage) {
          // Prioritize Cloudinary URL if available, otherwise use local image data
          const imageUrl = croppedImage.cloudinaryUrl || croppedImage.imageData;
          setImageData(imageUrl);
          setPageInfo(croppedImage.pageInfo || "");
          setLoading(false);
        } else {
          setError("Image not found or has expired");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading cropped image:", error);
        setError("Failed to load image");
        setLoading(false);
      }
    };

    loadCroppedImage();
  }, [id]);

  const handleDownload = () => {
    if (!imageData) return;

    const link = document.createElement("a");
    link.href = imageData;
    link.download = `cropped-newspaper-${id}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: "Cropped image download has begun",
    });
  };

  const handleShare = (platform: string) => {
    const currentUrl = window.location.href;
    const shareText = pageInfo || "Check out this cropped newspaper image!";

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            currentUrl
          )}&quote=${encodeURIComponent(shareText)}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            currentUrl
          )}&text=${encodeURIComponent(shareText)}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `${shareText} - ${currentUrl}`
          )}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(currentUrl).then(() => {
          toast({
            title: "Link Copied!",
            description: "Shareable link copied to clipboard",
          });
        });
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cropped image...</p>
        </div>
      </div>
    );
  }

  if (error || !imageData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🖼️</div>
          <h1 className="text-2xl font-bold mb-2">Image Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error ||
              "The cropped image you're looking for doesn't exist or has expired."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/")} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-paper paper-shadow border-b">
        <div className=" mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate("/")} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Newspaper
              </Button>
            </div>
            <img
              src={jawanBharatLogo}
              alt="logo"
              className="w-auto h-8 md:h-12 bg-transparent"
              style={{ mixBlendMode: "darken" }}
            />
            <div className="flex items-center gap-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Info */}
          {pageInfo && (
            <div className="text-center">
              <p className="text-muted-foreground">{pageInfo}</p>
            </div>
          )}

          {/* Image Display */}
          <div className="flex justify-center">
            <div className="bg-paper paper-shadow rounded-lg p-6 max-w-4xl">
              <img
                src={imageData}
                alt="Cropped newspaper image"
                className="max-w-full h-auto rounded border"
              />
            </div>
          </div>

          {/* Share Options */}
          <div className="text-center">
            <h3 className="text-lg font-medium mb-4">Share this image</h3>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                onClick={() => handleShare("facebook")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <span className="text-blue-600">f</span>
                Facebook
              </Button>

              <Button
                onClick={() => handleShare("twitter")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <span className="text-blue-400">𝕏</span>
                Twitter
              </Button>

              <Button
                onClick={() => handleShare("whatsapp")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <span className="text-green-600">WhatsApp</span>
              </Button>

              <Button
                onClick={() => handleShare("copy")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
