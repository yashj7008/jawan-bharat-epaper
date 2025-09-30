import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Calendar as CalendarIcon,
  Download,
  Crop,
  Share2,
  ZoomIn,
  List,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  MessageCircle,
  Link,
  Check,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "./ui/sidebar";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router";
import { getCurrentPageUrl } from "@/lib/commonFunctions";

interface HeaderProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onShowPageList: () => void;
  isCropMode: boolean;
  onCropModeChange: (isCropMode: boolean) => void;
  onRefreshPages: () => void;
  isRefreshing?: boolean;
  currentPageData?: {
    imageUrl: string;
    title: string;
  };
}

export function Header({
  currentPage,
  totalPages,
  onPageChange,
  zoom,
  onZoomChange,
  selectedDate,
  onDateChange,
  onShowPageList,
  isCropMode,
  onCropModeChange,
  onRefreshPages,
  isRefreshing,
  currentPageData,
}: HeaderProps) {
  const { user, signOut } = useAuth();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isMobileDatePickerOpen, setIsMobileDatePickerOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();

  // Update URL query parameters when date or page changes
  useEffect(() => {
    const url = new URL(window.location.href);

    // Format date consistently in Indian timezone
    const formatDateForURL = (date: Date): string => {
      try {
        const indianDate = new Date(
          date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );
        const year = indianDate.getFullYear();
        const month = String(indianDate.getMonth() + 1).padStart(2, "0");
        const day = String(indianDate.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      } catch (error) {
        return date.toISOString().split("T")[0];
      }
    };

    url.searchParams.set("date", formatDateForURL(selectedDate));
    url.searchParams.set("page", currentPage.toString());

    // Update URL without reloading the page
    window.history.replaceState({}, "", url.toString());
  }, [selectedDate, currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handleDownloadPDF = () => {
    // Implement PDF download functionality
    console.log("Downloading PDF...");
  };

  const handleDownload = async (format: "image" | "pdf") => {
    try {
      setIsDownloading(true);

      if (format === "image") {
        if (!currentPageData?.imageUrl) {
          toast({
            title: "No Image Available",
            description: "Current page has no image to download",
            variant: "destructive",
          });
          return;
        }

        // Create a canvas to capture the image
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            toast({
              title: "Download Failed",
              description: "Could not create canvas context",
              variant: "destructive",
            });
            return;
          }

          // Set canvas dimensions with zoom consideration
          const zoomFactor = zoom / 100;
          canvas.width = img.naturalWidth * zoomFactor;
          canvas.height = img.naturalHeight * zoomFactor;

          // Apply zoom transformation
          ctx.scale(zoomFactor, zoomFactor);

          // Draw the image
          ctx.drawImage(img, 0, 0);

          // Convert to blob and download
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                // Format date consistently for download filename
                const formatDateForDownload = (date: Date): string => {
                  try {
                    const indianDate = new Date(
                      date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
                    );
                    const year = indianDate.getFullYear();
                    const month = String(indianDate.getMonth() + 1).padStart(
                      2,
                      "0"
                    );
                    const day = String(indianDate.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                  } catch (error) {
                    return date.toISOString().split("T")[0];
                  }
                };

                link.download = `newspaper-page-${currentPage}-${formatDateForDownload(
                  selectedDate
                )}-zoom-${zoom}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast({
                  title: "Download Successful",
                  description: `Page ${currentPage} downloaded as image (${zoom}% zoom)`,
                });
              }
              setIsDownloading(false);
            },
            "image/png",
            1.0
          ); // High quality
        };

        img.onerror = () => {
          toast({
            title: "Download Failed",
            description: "Could not load the image",
            variant: "destructive",
          });
          setIsDownloading(false);
        };

        img.src = currentPageData.imageUrl;
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download the page",
        variant: "destructive",
      });
      setIsDownloading(false);
    }
  };

  const handleCrop = () => {
    onCropModeChange(!isCropMode);
  };

  const handleShare = (platform: string) => {
    const currentUrl = getCurrentPageUrl(selectedDate, currentPage); // Use URL with query parameters
    const pageInfo = `Page ${currentPage} of Jawan Bharat Epaper`;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            currentUrl
          )}&quote=${encodeURIComponent(pageInfo)}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            currentUrl
          )}&text=${encodeURIComponent(pageInfo)}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `${pageInfo} - ${currentUrl}`
          )}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(currentUrl).then(() => {
          setIsLinkCopied(true);
          setTimeout(() => setIsLinkCopied(false), 2000);
        });
        break;
    }
  };

  return (
    <header className="bg-paper paper-shadow sticky top-0 z-40  border-t border-red-500">
      <div className="flex items-center justify-center md:justify-between  px-4 border border-gray-100">
        {/* Left section: Home and Date */}
        <div className="hidden md:flex items-center space-x-4">
          <SidebarTrigger className="mr-2" />
          {/* <Button
            variant="outline"
            size="sm"
            className=""
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button> */}

          {/* <Button
            variant="outline"
            size="sm"
            className="text-foreground hover:bg-secondary"
            onClick={() => (window.location.href = "/admin")}
          >
            Admin
          </Button> */}

          {/* {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:bg-secondary"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground hover:bg-secondary"
              onClick={() => (window.location.href = "/signin")}
            >
              Sign In
            </Button>
          )} */}

          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(selectedDate, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    onDateChange(date);
                    setIsDatePickerOpen(false);
                  }
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Center section: Page navigation */}
        <div className="flex items-center space-x-3 md:ml-32">
          <div className="flex items-center space-x-2">
            <SidebarTrigger className="mr-2 md:hidden" />

            {/* Mobile Date Picker */}
            <Popover
              open={isMobileDatePickerOpen}
              onOpenChange={setIsMobileDatePickerOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "justify-start text-left font-normal md:hidden",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(selectedDate, "MMM dd, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      onDateChange(date);
                      setIsMobileDatePickerOpen(false);
                    }
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Page Navigation */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center space-x-2 md:ml-4">
                <span className="hidden md:block text-sm text-muted-foreground">
                  Page
                </span>
                <Input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      onPageChange(page);
                    }
                  }}
                  className="w-10 md:w-16 h-8 text-center"
                  min={1}
                  max={totalPages}
                />
                <span className="text-sm text-muted-foreground md:block hidden">
                  of {totalPages}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Crop Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCrop}
            className="md:hidden"
          >
            <Crop className="h-4 w-4" />
          </Button>
        </div>

        {/* Right section: Tools and controls */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="flex items-center space-x-2 mr-4">
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              onValueChange={(value) => onZoomChange(value[0])}
              max={200}
              min={50}
              step={10}
              className="w-20"
            />
            <span className="text-xs text-muted-foreground w-8">{zoom}%</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload("image")}
            className="group"
          >
            <Download className="h-4 w-4 mr-2 text-blue-600 group-hover:text-white transition-colors" />
          </Button>

          <Button variant="outline" size="sm" onClick={handleCrop}>
            <Crop className="h-4 w-4" />
          </Button>

          {/* <Button
            variant="outline"
            size="sm"
            onClick={onRefreshPages}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button> */}

          {/* Share Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 [&_.dropdown-item:hover]:text-white [&_.dropdown-item:hover_svg]:text-white"
            >
              <DropdownMenuItem
                onClick={() => handleShare("facebook")}
                className="dropdown-item"
              >
                <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                Share on Facebook
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleShare("twitter")}
                className="dropdown-item"
              >
                <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleShare("whatsapp")}
                className="dropdown-item"
              >
                <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                Share on WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleShare("copy")}
                className="dropdown-item"
              >
                {isLinkCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Copy Link
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={onShowPageList}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
