import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
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
  ZoomOut,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
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

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP : number = 10;

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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

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
  };

  const adjustZoom = (amount: number) => {
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + amount));
    onZoomChange(newZoom);
  };

  const handleDownload = async (format: "image" | "pdf") => {
    try {

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
    <header className="fixed inset-x-0 bottom-2 z-40 mx-auto w-[calc(100%-1rem)] max-w-xl rounded-2xl border border-border/80 bg-background/95 shadow-lg shadow-black/5 backdrop-blur-md md:sticky md:top-0 md:bottom-auto md:w-full md:max-w-none md:rounded-none md:border-x-0 md:border-t-0 md:border-b md:bg-background/90 md:shadow-sm">
      <div className="flex min-w-0 items-center justify-between gap-2 px-2 py-2 sm:px-3 md:min-h-16 md:px-6 md:py-3">
        {/* Left section: Home and Date */}
        <div className="hidden shrink-0 md:flex md:items-center">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-10 rounded-lg border-border/70 px-3 text-left font-medium text-foreground shadow-none transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
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
                disabled={{ after: new Date() }}
                toMonth={new Date()}
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
        <div className="flex min-w-0 flex-1 items-center justify-between gap-1 sm:gap-2 md:justify-center">
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* <SidebarTrigger className="mr-2 md:hidden" /> */}

            {/* Page Navigation */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 shrink-0 rounded-lg p-0 text-foreground transition-colors hover:bg-muted/70 hover:text-foreground active:bg-muted active:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="hidden md:block flex flex-col items-center space-y-1">
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
                  className="h-10 w-16 rounded-lg border-border/70 text-center text-sm font-medium shadow-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  min={1}
                  max={totalPages}
                />
                <span className="text-sm text-muted-foreground md:block hidden">
                  of {totalPages}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 shrink-0 rounded-lg p-0 text-foreground transition-colors hover:bg-muted/70 hover:text-foreground active:bg-muted active:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Crop Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCrop}
            className="h-10 w-10 shrink-0 rounded-lg p-0 text-foreground transition-colors hover:bg-muted/70 hover:text-foreground active:bg-muted active:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
          >
            <Crop className="h-5 w-5" />
          </Button>
          {/* Mobile zoom in Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => adjustZoom(-ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM}
            aria-label={`Zoom level: ${zoom}%`}
            className="group h-10 w-10 shrink-0 rounded-lg p-0 text-foreground transition-colors hover:bg-muted/70 hover:text-foreground active:bg-muted active:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
          >
            <ZoomOut className="h-5 w-5 transition-colors" />
          </Button>
          {/* Mobile zoom in Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => adjustZoom(ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM}
            aria-label={`Zoom level: ${zoom}%`}
            className="group h-10 w-10 shrink-0 rounded-lg p-0 text-foreground transition-colors hover:bg-muted/70 hover:text-foreground active:bg-muted active:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
          >
            <ZoomIn className="h-5 w-5 transition-colors" />
          </Button>
          {/* Mobile download Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload("image")}
            className="group h-10 w-10 shrink-0 rounded-lg p-0 text-foreground transition-colors hover:bg-muted/70 hover:text-foreground active:bg-muted active:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
          >
            <Download className="h-5 w-5 transition-colors" />
          </Button>


          {/* Share Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 shrink-0 rounded-lg p-0 text-foreground transition-colors hover:bg-muted/70 hover:text-foreground active:bg-muted active:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 rounded-xl border-border/70 p-1 shadow-lg"
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
        </div>

        {/* Right section: Tools and controls */}
        <div className="hidden shrink-0 md:flex md:items-center md:gap-1">
          <div className="mr-3 flex items-center gap-2 border-r border-border/70 pr-4">
            <ZoomIn className="h-5 w-5 text-muted-foreground" />
            <Slider
              value={[zoom]}
              onValueChange={(value) => onZoomChange(value[0])}
              max={200}
              min={50}
              step={10}
              className="w-20"
            />
            <span className="w-9 text-right text-xs font-medium tabular-nums text-muted-foreground">{zoom}%</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload("image")}
            className="group h-10 w-10 rounded-lg p-0 text-foreground transition-colors hover:bg-muted/70 hover:text-foreground active:bg-muted active:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Download className="h-5 w-5 transition-colors" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCrop}
            className="h-10 w-10 rounded-lg p-0 text-foreground transition-colors hover:bg-muted/70 hover:text-foreground active:bg-muted active:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Crop className="h-5 w-5" />
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
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 rounded-lg p-0 text-foreground transition-colors hover:bg-muted/70 hover:text-foreground active:bg-muted active:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 rounded-xl border-border/70 p-1 shadow-lg"
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

          <Button
            variant="ghost"
            size="sm"
            onClick={onShowPageList}
            className="h-10 w-10 rounded-lg p-0 text-foreground transition-colors hover:bg-muted/70 hover:text-foreground active:bg-muted active:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
