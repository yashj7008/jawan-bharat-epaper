// Utility for composing cropped newspaper images with the Jawan Bharat logo and page information.
//
// Output structure (top to bottom):
//   [thin red border]
//   [logo  – 70% of width, centered, aspect ratio preserved]
//   [cropped newspaper content – original size, never resized]
//   [footer – date | page, website – ~50% of width, centered]
//   [thin black border]
//
// Every size is derived from the composite width, so the layout scales for any crop (1–8 columns).
import jawanBharatLogo from "@/assets/jawan-bharat-logo.png";
import { format } from "date-fns";

export interface CompositeImageOptions {
  pageNumber: number;
  totalPages: number;
  date?: string;
  /** Minimum width of the final image in px (default 300). */
  minWidth?: number;
  /** Logo width as a fraction of the composite width (default 0.7 → 15% margin each side). */
  logoWidthRatio?: number;
  /** Footer text block width as a fraction of the composite width (default 0.5). */
  footerWidthRatio?: number;
  /** @deprecated Ignored. Logo size is always derived from the composite width. */
  logoWidth?: number;
  /** @deprecated Ignored. Logo height is always derived from the logo's aspect ratio. */
  logoHeight?: number;
}

/** Thrown when the logo cannot be loaded. We never silently produce an image without the logo. */
export class LogoLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LogoLoadError";
  }
}

const SITE_URL_TEXT = "epaper.jawanbharat.com";

const LAYOUT = {
  logoWidthRatio: 0.7,
  footerWidthRatio: 0.5,
  minWidth: 300,
  // Vertical rhythm: one "unit" scales with the width of the image
  unitRatio: 0.02,
  minUnit: 8,
  borderRatio: 0.004,
  minBorder: 2,
  maxBorder: 12,
  headerGap: 1, // top border -> logo            (units)
  logoContentGap: 0.75, // logo -> newspaper content   (units)
  contentFooterGap: 1, // content -> footer           (units)
  footerBottomGap: 1, // footer -> bottom border     (units)
  urlFontRatio: 0.85, // URL font relative to the date/page font
  lineHeightRatio: 1.2,
  lineGapRatio: 0.25,
  minFont: 10,
  // Browsers (esp. iOS Safari) fail on very large canvases; shrink the whole composite above this.
  maxCanvasPixels: 16_000_000,
  topBorderColor: "#d70000",
  bottomBorderColor: "#000000",
  textColor: "#333333",
};

/* ------------------------------------------------------------------ */
/* Layout (pure maths – no DOM access, easy to test)                   */
/* ------------------------------------------------------------------ */

export interface LayoutInput {
  cropWidth: number;
  cropHeight: number;
  /** logo natural height / natural width */
  logoAspect: number;
  /** Returns the width of `text` when drawn at 100px (bold or regular) */
  measure: (text: string, bold: boolean) => number;
  pageText: string;
  minWidth?: number;
  logoWidthRatio?: number;
  footerWidthRatio?: number;
}

export interface CompositeLayout {
  width: number;
  height: number;
  /** Down-scale applied to the whole composite when it would exceed the canvas pixel limit (1 = none) */
  canvasScale: number;
  border: number;
  logo: { x: number; y: number; w: number; h: number };
  content: { x: number; y: number };
  footer: {
    centerX: number;
    pageFont: number;
    urlFont: number;
    pageY: number;
    urlY: number;
    maxWidth: number;
  };
  bottomBorderY: number;
}

export const computeLayout = (input: LayoutInput): CompositeLayout => {
  const {
    cropWidth,
    cropHeight,
    logoAspect,
    measure,
    pageText,
    minWidth = LAYOUT.minWidth,
    logoWidthRatio = LAYOUT.logoWidthRatio,
    footerWidthRatio = LAYOUT.footerWidthRatio,
  } = input;

  const width = Math.max(cropWidth, minWidth);
  const unit = Math.max(LAYOUT.minUnit, width * LAYOUT.unitRatio);
  const border = Math.min(
    LAYOUT.maxBorder,
    Math.max(LAYOUT.minBorder, Math.round(width * LAYOUT.borderRatio))
  );

  // Logo: 70% of width, height from aspect ratio (never stretched)
  const logoW = width * logoWidthRatio;
  const logoH = logoW * logoAspect;
  const logoX = (width - logoW) / 2;

  // Footer: the date/page line fills ~50% of the width; the URL line is a bit smaller and always fits
  const footerWidth = width * footerWidthRatio;
  const pageFont = Math.max(
    LAYOUT.minFont,
    (footerWidth * 100) / input.measure(pageText, true)
  );
  const urlFont = Math.max(
    LAYOUT.minFont,
    Math.min(
      pageFont * LAYOUT.urlFontRatio,
      (footerWidth * 100) / input.measure(SITE_URL_TEXT, false)
    )
  );

  // Vertical positions
  const logoY = border + unit * LAYOUT.headerGap;
  const contentY = logoY + logoH + unit * LAYOUT.logoContentGap;
  const footerY = contentY + cropHeight + unit * LAYOUT.contentFooterGap;
  const pageY = footerY;
  const urlY = pageY + pageFont * LAYOUT.lineHeightRatio + pageFont * LAYOUT.lineGapRatio;
  const footerBottom = urlY + urlFont * LAYOUT.lineHeightRatio;
  const bottomBorderY = footerBottom + unit * LAYOUT.footerBottomGap;
  const height = Math.ceil(bottomBorderY + border);

  const area = width * height;
  const canvasScale = area > LAYOUT.maxCanvasPixels ? Math.sqrt(LAYOUT.maxCanvasPixels / area) : 1;

  return {
    width,
    height,
    canvasScale,
    border,
    logo: { x: logoX, y: logoY, w: logoW, h: logoH },
    content: { x: (width - cropWidth) / 2, y: contentY },
    footer: { centerX: width / 2, pageFont, urlFont, pageY, urlY, maxWidth: footerWidth },
    bottomBorderY,
  };
};

/* ------------------------------------------------------------------ */
/* Logo loading                                                        */
/* ------------------------------------------------------------------ */

let logoPromise: Promise<HTMLImageElement> | null = null;

const loadLogoOnce = (): Promise<HTMLImageElement> => {
  if (!logoPromise) {
    logoPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) resolve(img);
        else reject(new LogoLoadError("Jawan Bharat logo loaded with zero dimensions"));
      };
      img.onerror = () =>
        reject(
          new LogoLoadError(
            `Jawan Bharat logo failed to load (src: ${String(jawanBharatLogo).slice(0, 80)})`
          )
        );
      img.src = jawanBharatLogo;
    }).catch((error) => {
      logoPromise = null; // don't cache failures
      throw error;
    });
  }
  return logoPromise;
};

/** Loads (and caches) the logo; retries once before giving up. */
const loadLogo = async (): Promise<HTMLImageElement> => {
  try {
    return await loadLogoOnce();
  } catch (firstError) {
    console.warn("[compositeImage] Logo load failed, retrying once:", firstError);
    return loadLogoOnce();
  }
};

/** Optional: call once (e.g. when the crop UI mounts) so the logo is ready before the first crop. */
export const preloadCompositeLogo = (): void => {
  loadLogo().catch((error) => console.error("[compositeImage] Logo preload failed:", error));
};

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

const formatDateText = (date?: string): string => {
  const parsed = date ? new Date(date) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    console.warn(`[compositeImage] Invalid date "${date}", using today's date`);
    return format(new Date(), "dd MMMM yyyy");
  }
  return format(parsed, "dd MMMM yyyy");
};

const renderComposite = (
  croppedCanvas: HTMLCanvasElement,
  options: CompositeImageOptions,
  logoImg: HTMLImageElement
): string => {
  const pageText = `${formatDateText(options.date)} | Page ${options.pageNumber}`;

  // Measure text at 100px so font sizes can be fitted to a target width
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) throw new Error("Could not get measuring canvas context");
  const measure = (text: string, bold: boolean) => {
    probe.font = `${bold ? "bold " : ""}100px Arial, sans-serif`;
    return probe.measureText(text).width;
  };

  const layout = computeLayout({
    cropWidth: croppedCanvas.width,
    cropHeight: croppedCanvas.height,
    logoAspect: logoImg.naturalHeight / logoImg.naturalWidth,
    measure,
    pageText,
    minWidth: options.minWidth,
    logoWidthRatio: options.logoWidthRatio,
    footerWidthRatio: options.footerWidthRatio,
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(layout.width * layout.canvasScale);
  canvas.height = Math.round(layout.height * layout.canvasScale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get composite canvas context");

  // Draw in layout units; canvasScale is 1 unless the image is huge
  ctx.scale(layout.canvasScale, layout.canvasScale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, layout.width, layout.height);

  // Borders (they sit in their own band; nothing else is drawn there)
  ctx.fillStyle = LAYOUT.topBorderColor;
  ctx.fillRect(0, 0, layout.width, layout.border);
  ctx.fillStyle = LAYOUT.bottomBorderColor;
  ctx.fillRect(0, layout.bottomBorderY, layout.width, layout.border);

  // Logo (transparent PNG drawn over white, aspect ratio preserved)
  ctx.drawImage(logoImg, layout.logo.x, layout.logo.y, layout.logo.w, layout.logo.h);

  // Cropped newspaper content – original size
  ctx.drawImage(croppedCanvas, layout.content.x, layout.content.y);

  // Footer
  const { footer } = layout;
  ctx.fillStyle = LAYOUT.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = `bold ${footer.pageFont}px Arial, sans-serif`;
  ctx.fillText(pageText, footer.centerX, footer.pageY, footer.maxWidth);
  ctx.font = `${footer.urlFont}px Arial, sans-serif`;
  ctx.fillText(SITE_URL_TEXT, footer.centerX, footer.urlY, footer.maxWidth);

  const dataUrl = canvas.toDataURL("image/png");
  if (!dataUrl || dataUrl === "data:,") {
    throw new Error(
      `Canvas export failed (${canvas.width}x${canvas.height}) – the image may exceed the browser's canvas size limit`
    );
  }
  return dataUrl;
};

/**
 * Creates the composite image: red border, logo, cropped content, footer, black border.
 * Rejects (with a LogoLoadError if the logo is the problem) instead of returning an image without a logo.
 */
export const createCompositeImage = async (
  croppedCanvas: HTMLCanvasElement,
  options: CompositeImageOptions
): Promise<string> => {
  const logoImg = await loadLogo();
  return renderComposite(croppedCanvas, options, logoImg);
};

/**
 * Fallback entry point, kept for backwards compatibility. It now uses exactly the same renderer
 * (and therefore always includes the logo). NOTE: it is async now – call it with `await`.
 */
export const createSimpleComposite = async (
  croppedCanvas: HTMLCanvasElement,
  options: CompositeImageOptions
): Promise<string> => createCompositeImage(croppedCanvas, options);