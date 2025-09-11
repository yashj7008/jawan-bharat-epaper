// Service to manage cropped images with unique IDs and shareable URLs
// Updated to use Cloudinary storage instead of localStorage for better sharing capabilities

import { cloudinaryCroppedService } from './cloudinaryCroppedService';

interface CroppedImageData {
  id: string;
  imageData: string; // For backward compatibility and fallback
  cloudinaryUrl?: string; // Cloudinary URL for the uploaded image
  cloudinaryPublicId?: string; // Cloudinary public ID for the image
  pageInfo?: string;
  createdAt: Date;
  pageNumber?: number;
  date?: string;
}

class CroppedImageService {
  private storageKey = 'cropped-images';
  private images: Map<string, CroppedImageData> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  // Generate a unique ID for the cropped image
  private generateId(): string {
    return `crop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Store a new cropped image and return its ID
  // Updated to use S3 storage with localStorage as fallback
  async storeCroppedImage(imageData: string, pageInfo?: string, pageNumber?: number, date?: string): Promise<string> {
    const id = this.generateId();
    const croppedImage: CroppedImageData = {
      id,
      imageData,
      pageInfo,
      createdAt: new Date(),
      pageNumber,
      date
    };

    // Try to upload to Cloudinary first
    if (cloudinaryCroppedService.isConfigured()) {
      try {
        const uploadResult = await cloudinaryCroppedService.uploadCroppedImage(id, imageData, {
          pageInfo,
          pageNumber,
          date
        });

        if (uploadResult.success && uploadResult.url) {
          croppedImage.cloudinaryUrl = uploadResult.url;
          croppedImage.cloudinaryPublicId = uploadResult.publicId;
          console.log('Image uploaded to Cloudinary:', uploadResult.url);
        } else {
          console.warn('Cloudinary upload failed, using localStorage fallback:', uploadResult.error);
        }
      } catch (error) {
        console.warn('Cloudinary upload error, using localStorage fallback:', error);
      }
    }

    // Store in localStorage (either as primary storage or fallback)
    this.images.set(id, croppedImage);
    this.saveToStorage();
    return id;
  }

  // Legacy synchronous method for backward compatibility
  // COMMENTED OUT - Use storeCroppedImage (async) instead
  /*
  storeCroppedImageSync(imageData: string, pageInfo?: string, pageNumber?: number, date?: string): string {
    const id = this.generateId();
    const croppedImage: CroppedImageData = {
      id,
      imageData,
      pageInfo,
      createdAt: new Date(),
      pageNumber,
      date
    };

    this.images.set(id, croppedImage);
    this.saveToStorage();
    return id;
  }
  */

  // Get a cropped image by ID
  // Updated to handle both S3 and localStorage sources
  async getCroppedImage(id: string): Promise<CroppedImageData | null> {
    // First, try to get from localStorage
    const localImage = this.images.get(id);
    
    if (localImage) {
      // If we have Cloudinary URL, prioritize it
      if (localImage.cloudinaryUrl) {
        return localImage;
      }
      // Otherwise return local data
      return localImage;
    }

    // If not in localStorage, try to check if it exists in Cloudinary
    if (cloudinaryCroppedService.isConfigured()) {
      try {
        const cloudinaryImage = await cloudinaryCroppedService.getCroppedImageInfo(id);
        
        if (cloudinaryImage) {
          // Create a virtual image data object from Cloudinary
          return {
            id,
            imageData: '', // Empty since we'll use Cloudinary URL
            cloudinaryUrl: cloudinaryImage.secure_url,
            cloudinaryPublicId: cloudinaryImage.public_id,
            pageInfo: cloudinaryImage.context?.page_info || '', // Get from context metadata
            createdAt: new Date(), // Approximate - could parse from context
            pageNumber: cloudinaryImage.context?.page_number ? parseInt(cloudinaryImage.context.page_number) : undefined,
            date: cloudinaryImage.context?.date || undefined
          };
        }
      } catch (error) {
        console.warn('Error checking Cloudinary for image:', error);
      }
    }

    return null;
  }

  // Legacy synchronous method for backward compatibility
  // COMMENTED OUT - Use getCroppedImage (async) instead
  /*
  getCroppedImageSync(id: string): CroppedImageData | null {
    return this.images.get(id) || null;
  }
  */

  // Generate a shareable URL for a cropped image
  generateShareableUrl(id: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/cropped/${id}`;
  }

  // Get all stored cropped images
  getAllCroppedImages(): CroppedImageData[] {
    return Array.from(this.images.values());
  }

  // Clean up old cropped images (older than 24 hours)
  // Updated to also clean up S3 images
  async cleanupOldImages(): Promise<void> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const imagesToDelete: string[] = [];
    
    for (const [id, image] of this.images.entries()) {
      if (image.createdAt < oneDayAgo) {
        imagesToDelete.push(id);
        this.images.delete(id);
        
        // Also delete from Cloudinary if it exists
        if (image.cloudinaryUrl && cloudinaryCroppedService.isConfigured()) {
          try {
            await cloudinaryCroppedService.deleteCroppedImage(id);
            console.log('Deleted old image from Cloudinary:', id);
          } catch (error) {
            console.warn('Failed to delete image from Cloudinary:', id, error);
          }
        }
      }
    }
    
    this.saveToStorage();
    
    if (imagesToDelete.length > 0) {
      console.log(`Cleaned up ${imagesToDelete.length} old cropped images`);
    }
  }

  // Legacy synchronous cleanup method
  // COMMENTED OUT - Use cleanupOldImages (async) instead
  /*
  cleanupOldImagesSync(): void {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    for (const [id, image] of this.images.entries()) {
      if (image.createdAt < oneDayAgo) {
        this.images.delete(id);
      }
    }
    
    this.saveToStorage();
  }
  */

  // Save to localStorage
  private saveToStorage(): void {
    try {
      const data = Array.from(this.images.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save cropped images to storage:', error);
    }
  }

  // Load from localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.images = new Map(data);
      }
    } catch (error) {
      console.error('Failed to load cropped images from storage:', error);
    }
  }
}

// Export singleton instance
export const croppedImageService = new CroppedImageService();

// Clean up old images every hour
setInterval(async () => {
  try {
    await croppedImageService.cleanupOldImages();
  } catch (error) {
    console.warn('Failed to cleanup old images:', error);
  }
}, 60 * 60 * 1000);
