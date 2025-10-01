import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Share2,
  Home,
  Facebook,
  Twitter,
  MessageCircle,
  Copy,
} from "lucide-react";
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
        console.log("id", id);
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
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-paper paper-shadow border-b">
        <div className="mx-auto px-4 py-4">
          <div className="relative flex items-center">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate("/")}
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm hover:bg-white hover:text-black"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Newspaper</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
            <div
              onClick={() => navigate("/")}
              className="absolute left-1/2 transform -translate-x-1/2"
            >
              <img
                src={jawanBharatLogo}
                alt="logo"
                className="w-auto h-6 sm:h-8 md:h-12 bg-transparent"
                style={{ mixBlendMode: "darken" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Page Info */}
          {pageInfo && (
            <div className="text-center">
              <p className="text-muted-foreground text-sm sm:text-base">
                {pageInfo}
              </p>
            </div>
          )}

          {/* Image and Share Section */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start justify-center">
            {/* Image Display */}
            <div className="flex-1 flex justify-center items-start md:flex-row flex-col gap-3">
              <div className="bg-paper paper-shadow rounded-lg p-3 sm:p-6 max-w-4xl w-full">
                <img
                  src={imageData}
                  alt="Cropped newspaper image"
                  className="w-full h-auto rounded border"
                />
              </div>
              {/* Share Options - Right side on desktop, below on mobile */}
              <div className="flex lg:flex-col gap-3 lg:gap-4 justify-center lg:justify-start items-center lg:items-start">
                <div className="text-center lg:text-left mb-2 lg:mb-4 w-full">
                  <h3 className="text-sm sm:text-lg font-medium text-muted-foreground">
                    Share
                  </h3>
                </div>

                <div className="flex lg:flex-col gap-3 lg:gap-4">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Download className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    onClick={() => handleShare("facebook")}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 hover:bg-blue-50 hover:border-blue-300"
                    title="Share on Facebook"
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                  </Button>

                  <Button
                    onClick={() => handleShare("twitter")}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 hover:bg-blue-50 hover:border-blue-400"
                    title="Share on Twitter"
                  >
                    <Twitter className="h-4 w-4 text-blue-400" />
                  </Button>

                  <Button
                    onClick={() => handleShare("whatsapp")}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 hover:bg-green-50 hover:border-green-500"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </Button>

                  <Button
                    onClick={() => handleShare("copy")}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 hover:bg-gray-50 hover:border-gray-400"
                    title="Copy Link"
                  >
                    <Copy className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
