// Utility for composing cropped images with logo and page information
import jawanBharatLogo from "@/assets/jawan-bharat-logo.jpg";

export interface CompositeImageOptions {
  pageNumber: number;
  totalPages: number;
  date?: string;
  logoHeight?: number;
  logoWidth?: number;
  pageInfoHeight?: number;
  padding?: number;
  minWidth?: number;
}

/**
 * Creates a composite image with logo at top, cropped content in middle, and page info at bottom
 */
export const createCompositeImage = async (
  croppedCanvas: HTMLCanvasElement,
  options: CompositeImageOptions
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    // Load the logo image
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    
    const {
      pageNumber,
      totalPages,
      date,
      logoHeight = 33,
      logoWidth = 189,
      pageInfoHeight = 60,
      padding = 20,
      minWidth = 400
    } = options;
    
    logoImg.onload = () => {
      try {
        // Calculate dimensions for the composite image
        const compositeWidth = Math.max(croppedCanvas.width, minWidth);
        const compositeHeight = logoHeight + croppedCanvas.height + pageInfoHeight + (padding * 3);

        // Create composite canvas
        const compositeCanvas = document.createElement('canvas');
        const compositeCtx = compositeCanvas.getContext('2d');

        if (!compositeCtx) {
          reject(new Error('Could not get composite canvas context'));
          return;
        }

        compositeCanvas.width = compositeWidth;
        compositeCanvas.height = compositeHeight;

        // Fill with white background
        compositeCtx.fillStyle = '#ffffff';
        compositeCtx.fillRect(0, 0, compositeWidth, compositeHeight);

        // Draw logo at the top (centered) with fixed dimensions
        const logoX = (compositeWidth - logoWidth) / 2;
        compositeCtx.drawImage(logoImg, logoX, padding, logoWidth, logoHeight);

        // Draw cropped image in the middle (centered)
        const croppedX = (compositeWidth - croppedCanvas.width) / 2;
        const croppedY = logoHeight + (padding * 2);
        compositeCtx.drawImage(croppedCanvas, croppedX, croppedY);

        // Draw page info at the bottom
        const pageInfoY = croppedY + croppedCanvas.height + padding;
        
        const pageText = `Page ${pageNumber} of ${totalPages}`;
        const dateText = date || new Date().toLocaleDateString('en-IN');

        // Set font for page info
        compositeCtx.fillStyle = '#333333';
        compositeCtx.font = 'bold 16px Arial, sans-serif';
        compositeCtx.textAlign = 'center';

        // Draw page number
        compositeCtx.fillText(pageText, compositeWidth / 2, pageInfoY + 20);
        
        // Draw date
        compositeCtx.font = '14px Arial, sans-serif';
        compositeCtx.fillText(dateText, compositeWidth / 2, pageInfoY + 40);

        // Convert to data URL and resolve
        const compositeImageData = compositeCanvas.toDataURL('image/png');
        resolve(compositeImageData);
      } catch (error) {
        reject(error);
      }
    };

    logoImg.onerror = () => {
      // If logo fails to load, create composite without logo
      try {
        const compositeWidth = Math.max(croppedCanvas.width, minWidth);
        const compositeHeight = croppedCanvas.height + pageInfoHeight + (padding * 2);

        const compositeCanvas = document.createElement('canvas');
        const compositeCtx = compositeCanvas.getContext('2d');

        if (!compositeCtx) {
          reject(new Error('Could not get composite canvas context'));
          return;
        }

        compositeCanvas.width = compositeWidth;
        compositeCanvas.height = compositeHeight;

        // Fill with white background
        compositeCtx.fillStyle = '#ffffff';
        compositeCtx.fillRect(0, 0, compositeWidth, compositeHeight);

        // Draw cropped image at the top (centered)
        const croppedX = (compositeWidth - croppedCanvas.width) / 2;
        compositeCtx.drawImage(croppedCanvas, croppedX, padding);

        // Draw page info at the bottom
        const pageInfoY = croppedCanvas.height + padding;
        
        const pageText = `Page ${pageNumber} of ${totalPages}`;
        const dateText = date || new Date().toLocaleDateString('en-IN');

        compositeCtx.fillStyle = '#333333';
        compositeCtx.font = 'bold 16px Arial, sans-serif';
        compositeCtx.textAlign = 'center';
        compositeCtx.fillText(pageText, compositeWidth / 2, pageInfoY + 20);
        
        compositeCtx.font = '14px Arial, sans-serif';
        compositeCtx.fillText(dateText, compositeWidth / 2, pageInfoY + 40);

        const compositeImageData = compositeCanvas.toDataURL('image/png');
        resolve(compositeImageData);
      } catch (error) {
        reject(error);
      }
    };

    // Load the logo image
    logoImg.src = jawanBharatLogo;
  });
};

/**
 * Creates a simple composite image with just the cropped content and page info (fallback)
 */
export const createSimpleComposite = (
  croppedCanvas: HTMLCanvasElement,
  options: CompositeImageOptions
): string => {
  const {
    pageNumber,
    totalPages,
    date,
    logoHeight = 32,
    logoWidth = 189,
    pageInfoHeight = 60,
    padding = 20,
    minWidth = 400
  } = options;

  const compositeWidth = Math.max(croppedCanvas.width, minWidth);
  const compositeHeight = croppedCanvas.height + pageInfoHeight + (padding * 2);

  const compositeCanvas = document.createElement('canvas');
  const compositeCtx = compositeCanvas.getContext('2d');

  if (!compositeCtx) {
    throw new Error('Could not get composite canvas context');
  }

  compositeCanvas.width = compositeWidth;
  compositeCanvas.height = compositeHeight;

  // Fill with white background
  compositeCtx.fillStyle = '#ffffff';
  compositeCtx.fillRect(0, 0, compositeWidth, compositeHeight);

  // Draw cropped image at the top (centered)
  const croppedX = (compositeWidth - croppedCanvas.width) / 2;
  compositeCtx.drawImage(croppedCanvas, croppedX, padding);

  // Draw page info at the bottom
  const pageInfoY = croppedCanvas.height + padding;
  
  const pageText = `Page ${pageNumber} of ${totalPages}`;
  const dateText = date || new Date().toLocaleDateString('en-IN');

  compositeCtx.fillStyle = '#333333';
  compositeCtx.font = 'bold 16px Arial, sans-serif';
  compositeCtx.textAlign = 'center';
  compositeCtx.fillText(pageText, compositeWidth / 2, pageInfoY + 20);
  
  compositeCtx.font = '14px Arial, sans-serif';
  compositeCtx.fillText(dateText, compositeWidth / 2, pageInfoY + 40);

  return compositeCanvas.toDataURL('image/png');
};

