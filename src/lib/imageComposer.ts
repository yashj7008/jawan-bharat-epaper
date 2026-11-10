// Utility for composing cropped images with logo and page information
import jawanBharatLogo from "@/assets/jawan-bharat-logo.png";
import { format } from "date-fns";

export interface CompositeImageOptions {
  pageNumber: number;
  totalPages: number;
  date?: string;
  /** Desired logo width in px. Height is derived from the logo's natural aspect ratio. */
  logoWidth?: number;
  /** Logo width as a fraction of the composite width (default 0.4). Ignored if logoWidth is set. */
  logoWidthRatio?: number;
  /** @deprecated Ignored. Logo height is calculated from the aspect ratio. */
  logoHeight?: number;
  pageInfoHeight?: number;
  padding?: number;
  minWidth?: number;
  /** Font size (px) of the "date | Page N" line */
  pageFontSize?: number;
  /** Font size (px) of the site URL line */
  urlFontSize?: number;
}

const SITE_URL_TEXT = "epaper.jawanbharat.com";

const DEFAULTS = {
  logoWidthRatio: 0.3, // logo = 40% of image width
  baseWidth: 600, // text/spacing scale up when the image is wider than this
  pageInfoHeight: 65, // was 60 (more room for larger text)
  padding: 20,
  minWidth: 600, // was 400 (so the bigger logo always fits)
  pageFontSize: 18, // was 16
  urlFontSize: 16, // was 14
};

/** Draws the two footer lines (date | page, and site URL), centered. */
const drawFooter = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  topY: number,
  options: CompositeImageOptions,
  scale = 1
) => {
  const {
    pageNumber,
    date,
    pageFontSize = DEFAULTS.pageFontSize * scale,
    urlFontSize = DEFAULTS.urlFontSize * scale,
  } = options;

  const dateText = format(date ? new Date(date) : new Date(), "dd MMMM yyyy");
  const pageText = `${dateText} | Page ${pageNumber}`;

  ctx.fillStyle = "#333333";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Page info line
  ctx.font = `bold ${pageFontSize}px Arial, sans-serif`;
  const pageLineY = topY + pageFontSize + 6 * scale;
  ctx.fillText(pageText, canvasWidth / 2, pageLineY);

  // Site URL line
  ctx.font = `${urlFontSize}px Arial, sans-serif`;
  ctx.fillText(SITE_URL_TEXT, canvasWidth / 2, pageLineY + urlFontSize + 8 * scale);
};

/**
 * Creates a composite image with logo at top, cropped content in middle, and page info at bottom
 */
export const createCompositeImage = async (
  croppedCanvas: HTMLCanvasElement,
  options: CompositeImageOptions
): Promise<string> => {
  const { minWidth = DEFAULTS.minWidth } = options;

  const compositeWidth = Math.max(croppedCanvas.width, minWidth);
  // Everything scales up for high-resolution crops
  const scale = Math.max(1, compositeWidth / DEFAULTS.baseWidth);
  const {
    logoWidthRatio = DEFAULTS.logoWidthRatio,
    pageInfoHeight = DEFAULTS.pageInfoHeight * scale,
    padding = DEFAULTS.padding * scale,
  } = options;
  const desiredLogoWidth = options.logoWidth ?? compositeWidth * logoWidthRatio;

  const buildComposite = (logoImg: HTMLImageElement | null): string => {
    // Logo size: keep natural aspect ratio, never wider than the canvas (minus padding)
    let logoW = 0;
    let logoH = 0;
    if (logoImg && logoImg.naturalWidth > 0 && logoImg.naturalHeight > 0) {
      const aspectRatio = logoImg.naturalHeight / logoImg.naturalWidth;
      logoW = Math.min(desiredLogoWidth, compositeWidth - padding * 2);
      logoH = logoW * aspectRatio;
    }

    const hasLogo = logoW > 0;
    const headerHeight = hasLogo ? logoH + padding * 2 : padding;
    const compositeHeight =
      headerHeight + croppedCanvas.height + padding + pageInfoHeight;

    const compositeCanvas = document.createElement("canvas");
    const ctx = compositeCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get composite canvas context");
    }

    compositeCanvas.width = compositeWidth;
    compositeCanvas.height = compositeHeight;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, compositeWidth, compositeHeight);

    // Logo (centered, aspect ratio preserved)
    if (hasLogo && logoImg) {
      const logoX = (compositeWidth - logoW) / 2;
      ctx.drawImage(logoImg, logoX, padding, logoW, logoH);
    }

    // Cropped content (centered)
    const croppedX = (compositeWidth - croppedCanvas.width) / 2;
    const croppedY = headerHeight;
    ctx.drawImage(croppedCanvas, croppedX, croppedY);

    // Footer
    const footerTopY = croppedY + croppedCanvas.height + padding;
    drawFooter(ctx, compositeWidth, footerTopY, options, scale);

    return compositeCanvas.toDataURL("image/png");
  };

  return new Promise<string>((resolve, reject) => {
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";

    logoImg.onload = () => {
      try {
        resolve(buildComposite(logoImg));
      } catch (error) {
        reject(error);
      }
    };

    // If the logo fails to load, build the composite without it
    logoImg.onerror = () => {
      try {
        resolve(buildComposite(null));
      } catch (error) {
        reject(error);
      }
    };

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
  const { minWidth = DEFAULTS.minWidth } = options;

  const compositeWidth = Math.max(croppedCanvas.width, minWidth);
  const scale = Math.max(1, compositeWidth / DEFAULTS.baseWidth);
  const {
    pageInfoHeight = DEFAULTS.pageInfoHeight * scale,
    padding = DEFAULTS.padding * scale,
  } = options;
  const compositeHeight = croppedCanvas.height + pageInfoHeight + padding * 2;

  const compositeCanvas = document.createElement("canvas");
  const ctx = compositeCanvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get composite canvas context");
  }

  compositeCanvas.width = compositeWidth;
  compositeCanvas.height = compositeHeight;

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, compositeWidth, compositeHeight);

  // Cropped image at the top (centered)
  const croppedX = (compositeWidth - croppedCanvas.width) / 2;
  ctx.drawImage(croppedCanvas, croppedX, padding);

  // Footer
  const footerTopY = croppedCanvas.height + padding * 2;
  drawFooter(ctx, compositeWidth, footerTopY, options, scale);

  return compositeCanvas.toDataURL("image/png");
};