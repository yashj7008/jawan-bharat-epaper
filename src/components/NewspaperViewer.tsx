import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Crop, X, Check, ChevronLeft, ChevronRight } from "lucide-react";
import ReactCrop, { Crop as CropType, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ScrollArea } from "@/components/ui/scroll-area";
import { type NewspaperData } from "@/lib/dummyApi";
import {
  createCompositeImage,
  createSimpleComposite,
} from "@/lib/imageComposer";

interface NewspaperViewerProps {
  currentPage: number;
  zoom: number;
  selectedSection: string;
  newspaperData: NewspaperData | null;
  onCropComplete: (croppedImageData: string) => void;
  isCropMode: boolean;
  onCropModeChange: (isCropMode: boolean) => void;
  totalPages: number;
}

export function NewspaperViewer({
  currentPage,
  zoom,
  selectedSection,
  newspaperData,
  onCropComplete,
  isCropMode,
  onCropModeChange,
  totalPages,
}: NewspaperViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset scroll position when page changes
    if (viewerRef.current) {
      viewerRef.current.scrollTop = 0;
      viewerRef.current.scrollLeft = 0;
    }
  }, [currentPage]);

  // Set initial crop when entering crop mode
  useEffect(() => {
    if (isCropMode && imageLoaded && imgRef.current && !crop) {
      const imgWidth = imgRef.current.naturalWidth;
      const imgHeight = imgRef.current.naturalHeight;
      const displayWidth = imgRef.current.width;
      const displayHeight = imgRef.current.height;

      // Calculate initial crop size (20% of image dimensions, max 300x300px)
      const cropWidth = Math.min(300, Math.round(imgWidth * 0.2));
      const cropHeight = Math.min(300, Math.round(imgHeight * 0.2));

      // Calculate scale factors between natural and displayed dimensions
      const scaleX = imgWidth / displayWidth;
      const scaleY = imgHeight / displayHeight;

      // Position crop at the top center of the displayed image
      const cropX = Math.round((displayWidth - cropWidth / scaleX) / 2);
      const cropY = 0; // Position at the top

      setCrop({
        unit: "px",
        width: cropWidth,
        height: cropHeight,
        x: cropX,
        y: cropY,
      });
    }
  }, [isCropMode, imageLoaded, crop]);

  const zoomStyle = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: "top center",
  };

  // Get current page data
  const currentPageData = newspaperData?.pages.find(
    (page) => page.pageNumber === currentPage
  );

  const onSelectCrop = (crop: CropType, percentCrop: CropType) => {
    setCrop(percentCrop);
  };

  const onCompleteCrop = (crop: PixelCrop) => {
    setCompletedCrop(crop);
  };

  const centerAspectCrop = (
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
  ) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageLoaded(true);

    // Set a smaller default crop size when image loads
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const displayWidth = img.width;
    const displayHeight = img.height;

    // Calculate a smaller crop size (e.g., 20% of image dimensions)
    const cropWidth = Math.min(300, Math.round(imgWidth * 0.2));
    const cropHeight = Math.min(300, Math.round(imgHeight * 0.2));

    // Calculate scale factors between natural and displayed dimensions
    const scaleX = imgWidth / displayWidth;
    const scaleY = imgHeight / displayHeight;

    // Center the crop area in the displayed image viewport
    const cropX = Math.round((displayWidth - cropWidth / scaleX) / 2);
    const cropY = 0; // Position at the top

    setCrop({
      unit: "px",
      width: cropWidth,
      height: cropHeight,
      x: cropX,
      y: cropY,
    });
  };

  const handleCrop = async () => {
    if (!imgRef.current || !completedCrop || !onCropComplete) return;

    try {
      // First, create the cropped image
      const cropCanvas = document.createElement("canvas");
      const cropCtx = cropCanvas.getContext("2d");

      if (!cropCtx) return;

      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      cropCanvas.width = completedCrop.width;
      cropCanvas.height = completedCrop.height;

      // Draw the cropped portion
      cropCtx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      // Now create the composite image with logo and page info
      const currentPageData = newspaperData?.pages.find(
        (page) => page.pageNumber === currentPage
      );
      const compositeImageData = await createCompositeImage(cropCanvas, {
        pageNumber: currentPage,
        totalPages: totalPages,
        date: currentPageData?.metadata?.date,
        logoHeight: 32, // Fixed logo height
        logoWidth: 189, // Fixed logo width
      });
      onCropComplete(compositeImageData);

      onCropModeChange(false);
      setCrop(undefined);
      setCompletedCrop(undefined);
    } catch (error) {
      console.error("Error cropping image:", error);
      // Fallback to simple crop with page info but without logo
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;

        ctx.drawImage(
          imgRef.current,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0,
          0,
          completedCrop.width,
          completedCrop.height
        );

        // Create simple composite with page info
        const currentPageData = newspaperData?.pages.find(
          (page) => page.pageNumber === currentPage
        );
        const compositeImageData = createSimpleComposite(canvas, {
          pageNumber: currentPage,
          totalPages: totalPages,
          date: currentPageData?.metadata?.date,
          logoHeight: 32, // Fixed logo height
          logoWidth: 189, // Fixed logo width
        });

        onCropComplete(compositeImageData);
        onCropModeChange(false);
        setCrop(undefined);
        setCompletedCrop(undefined);
      } catch (fallbackError) {
        console.error("Fallback crop also failed:", fallbackError);
      }
    }
  };

  const handleCancelCrop = () => {
    onCropModeChange(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const handleStartCrop = () => {
    if (currentPageData?.imageUrl && imageLoaded) {
      onCropModeChange(true);
      setCompletedCrop(null);

      // Set initial crop selection when entering crop mode
      if (imgRef.current) {
        const imgWidth = imgRef.current.naturalWidth;
        const imgHeight = imgRef.current.naturalHeight;
        const displayWidth = imgRef.current.width;
        const displayHeight = imgRef.current.height;

        // Calculate initial crop size (20% of image dimensions, max 300x300px)
        const cropWidth = Math.min(300, Math.round(imgWidth * 0.2));
        const cropHeight = Math.min(300, Math.round(imgHeight * 0.2));

        // Calculate scale factors between natural and displayed dimensions
        const scaleX = imgWidth / displayWidth;
        const scaleY = imgHeight / displayHeight;

        // Center the crop area in the displayed image viewport
        const cropX = Math.round((displayWidth - cropWidth / scaleX) / 2);
        const cropY = 0; // Position at the top

        setCrop({
          unit: "px",
          width: cropWidth,
          height: cropHeight,
          x: cropX,
          y: cropY,
        });
      }
    }
  };

  if (!currentPageData) {
    return (
      <div className="flex-1 bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-muted relative overflow-hidden">
      <ScrollArea className="h-full w-full" ref={viewerRef}>
        <div className="md:p-8 flex justify-center">
          <div
            className="bg-paper paper-shadow relative w-full"
            style={zoomStyle}
          >
            {/* Page Controls */}
            {/* Crop button removed - using header's crop button instead */}

            {/* Crop Mode Controls - Positioned at bottom-right of crop selection */}
            {isCropMode && completedCrop && (
              <div
                className="absolute z-20 bg-white/95 p-1 rounded-lg border shadow-lg"
                style={{
                  left: `${completedCrop.x + completedCrop.width - 70}px`,
                  top: `${completedCrop.y + completedCrop.height + 5}px`,
                }}
              >
                <div className="flex gap-1">
                  <Button
                    onClick={handleCrop}
                    size="sm"
                    className="flex items-center justify-center h-7 w-7 p-0 bg-green-600 hover:bg-green-700 text-white"
                    title="Accept crop"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={handleCancelCrop}
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center h-7 w-7 p-0 border-red-300 text-red-600 hover:bg-red-50"
                    title="Cancel crop"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Newspaper Page Content */}
            <div className="relative">
              {/* Page Content */}
              <div className="min-w-4xl">
                {/* Page Content */}
                <div className="space-y-6 min-h-[70vh]">
                  {isCropMode ? (
                    /* Crop Mode: Image with ReactCrop */
                    <div className="w-full">
                      <ReactCrop
                        crop={crop}
                        onChange={onSelectCrop}
                        onComplete={onCompleteCrop}
                        aspect={undefined}
                        minWidth={50}
                        minHeight={50}
                        className="w-full"
                      >
                        <img
                          ref={imgRef}
                          src={currentPageData.imageUrl}
                          alt="Newspaper Page"
                          className="w-full h-auto"
                          onLoad={onImageLoad}
                          draggable={false}
                          crossOrigin="anonymous"
                          style={{ maxWidth: "100%", width: "100%" }}
                        />
                      </ReactCrop>
                    </div>
                  ) : (
                    /* Normal Mode: Regular Image */
                    <img
                      src={currentPageData.imageUrl}
                      alt="Newspaper Page"
                      className="w-full h-auto"
                      crossOrigin="anonymous"
                      style={{ maxWidth: "100%", width: "100%" }}
                    />
                  )}
                </div>
              </div>

              {/* Page overlay for section highlighting */}
              {/* <div className="absolute inset-0 pointer-events-none">
                {selectedSection !== "front-page" && (
                  <div className="absolute top-0 left-0 w-full h-12 bg-accent/10 border-l-4 border-accent">
                    <div className="p-2">
                      <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                        {selectedSection.replace("-", " ")} Section
                      </span>
                    </div>
                  </div>
                )}
              </div> */}

              {/* Page number indicator */}
              <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Page {currentPage}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}