// Service to manage cropped images with unique IDs and shareable URLs

interface CroppedImageData {
  id: string;
  imageData: string;
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
  storeCroppedImage(imageData: string, pageInfo?: string, pageNumber?: number, date?: string): string {
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

  // Get a cropped image by ID
  getCroppedImage(id: string): CroppedImageData | null {
    return this.images.get(id) || null;
  }

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
  cleanupOldImages(): void {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    for (const [id, image] of this.images.entries()) {
      if (image.createdAt < oneDayAgo) {
        this.images.delete(id);
      }
    }
    
    this.saveToStorage();
  }

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
setInterval(() => {
  croppedImageService.cleanupOldImages();
}, 60 * 60 * 1000);
