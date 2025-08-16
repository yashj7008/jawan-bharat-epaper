import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Crop, X, Check, ChevronLeft, ChevronRight } from "lucide-react";
import ReactCrop, { Crop as CropType, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ScrollArea } from "@/components/ui/scroll-area";
import { type NewspaperData } from "@/lib/dummyApi";

interface NewspaperViewerProps {
  currentPage: number;
  zoom: number;
  selectedSection: string;
  newspaperData: NewspaperData | null;
  onCropComplete: (croppedImageData: string) => void;
  isCropMode: boolean;
  onCropModeChange: (isCropMode: boolean) => void;
  onPageChange: (page: number) => void;
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
  onPageChange,
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
        unit: 'px',
        width: cropWidth,
        height: cropHeight,
        x: cropX,
        y: cropY
      });
    }
  }, [isCropMode, imageLoaded, crop]);

  const zoomStyle = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: "top center",
  };

  // Get current page data
  const currentPageData = newspaperData?.pages.find(page => page.pageNumber === currentPage);

  const onSelectCrop = (crop: CropType, percentCrop: CropType) => {
    setCrop(percentCrop);
  };

  const onCompleteCrop = (crop: PixelCrop) => {
    setCompletedCrop(crop);
  };

  const centerAspectCrop = (
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
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
      unit: 'px',
      width: cropWidth,
      height: cropHeight,
      x: cropX,
      y: cropY
    });
  };

  const handleCrop = async () => {
    if (!imgRef.current || !completedCrop || !onCropComplete) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      // Try to draw the image to canvas
      try {
        ctx.drawImage(
          imgRef.current,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0,
          0,
          completedCrop.width,
          completedCrop.height,
        );

        const croppedImageData = canvas.toDataURL('image/png');
        onCropComplete(croppedImageData);
        onCropModeChange(false);
        setCrop(undefined);
        setCompletedCrop(undefined);
      } catch (canvasError) {
        // If canvas is tainted, use an alternative approach
        console.log('Canvas tainted, using alternative cropping method...');
        
        // Create a new image element with the cropped area
        const croppedImg = new Image();
        croppedImg.crossOrigin = 'anonymous';
        
        // Create a temporary canvas with the original image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          tempCanvas.width = completedCrop.width;
          tempCanvas.height = completedCrop.height;
          
          // Fill with white background
          tempCtx.fillStyle = '#ffffff';
          tempCtx.fillRect(0, 0, completedCrop.width, completedCrop.height);
          
          // Try to draw the cropped portion
          try {
            tempCtx.drawImage(
              imgRef.current,
              completedCrop.x * scaleX,
              completedCrop.y * scaleY,
              completedCrop.width * scaleX,
              completedCrop.height * scaleY,
              0,
              0,
              completedCrop.width,
              completedCrop.height,
            );
            
            const croppedImageData = tempCanvas.toDataURL('image/png');
            onCropComplete(croppedImageData);
            onCropModeChange(false);
            setCrop(undefined);
            setCompletedCrop(undefined);
          } catch (finalError) {
            // If all else fails, create a simple cropped representation
            console.log('Creating fallback cropped image...');
            
            // Create a simple colored rectangle representing the crop area
            const fallbackCanvas = document.createElement('canvas');
            const fallbackCtx = fallbackCanvas.getContext('2d');
            
            if (fallbackCtx) {
              fallbackCanvas.width = completedCrop.width;
              fallbackCanvas.height = completedCrop.height;
              
              // Fill with a pattern to represent the crop
              fallbackCtx.fillStyle = '#f0f0f0';
              fallbackCtx.fillRect(0, 0, completedCrop.width, completedCrop.height);
              
              // Add border
              fallbackCtx.strokeStyle = '#333';
              fallbackCtx.lineWidth = 2;
              fallbackCtx.strokeRect(1, 1, completedCrop.width - 2, completedCrop.height - 2);
              
              // Add text
              fallbackCtx.fillStyle = '#666';
              fallbackCtx.font = '14px Arial';
              fallbackCtx.textAlign = 'center';
              fallbackCtx.fillText('Cropped Area', completedCrop.width / 2, completedCrop.height / 2);
              fallbackCtx.fillText(`${completedCrop.width} × ${completedCrop.height}`, completedCrop.width / 2, completedCrop.height / 2 + 20);
              
              const fallbackImageData = fallbackCanvas.toDataURL('image/png');
              onCropComplete(fallbackImageData);
              onCropModeChange(false);
              setCrop(undefined);
              setCompletedCrop(undefined);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error cropping image:', error);
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
          unit: 'px',
          width: cropWidth,
          height: cropHeight,
          x: cropX,
          y: cropY
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

            {/* Crop Mode Controls */}
            {isCropMode && (
              <div className="absolute top-4 left-4 z-10 bg-white/95 p-3 rounded-lg border shadow-lg">
                {/* <div className="text-sm text-muted-foreground mb-2">
                  {completedCrop ? (
                    `Crop Area: ${Math.round(completedCrop.width)} × ${Math.round(completedCrop.height)} pixels`
                  ) : (
                    "Drag to select crop area"
                  )}
                </div> */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleCrop}
                    disabled={!completedCrop}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleCancelCrop}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
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
                          style={{ maxWidth: '100%', width: '100%' }}
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
                      style={{ maxWidth: '100%', width: '100%' }}
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

      {/* Left Navigation Bar - Positioned within container bounds */}
      {currentPage > 1 && (
        <div 
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-50 cursor-pointer group"
          onClick={() => onPageChange(currentPage - 1)}
        >
          <div className="bg-black/20 hover:bg-black/40 transition-all duration-200 rounded-r-lg p-2 backdrop-blur-sm">
            <div className="flex items-center justify-center">
              <ChevronLeft className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Right Navigation Bar - Positioned within container bounds */}
      {currentPage < totalPages && (
        <div 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-50 cursor-pointer group"
          onClick={() => onPageChange(currentPage + 1)}
        >
          <div className="bg-black/20 hover:bg-black/40 transition-all duration-200 rounded-l-lg p-2 backdrop-blur-sm">
            <div className="flex items-center justify-center">
              <ChevronRight className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}