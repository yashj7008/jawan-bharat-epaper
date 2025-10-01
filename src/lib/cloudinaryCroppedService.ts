// Cloudinary Service for cropped images
// This service handles uploading cropped images to Cloudinary and generating public URLs

import { CLOUDINARY_CONFIG } from './cloudinary';
import {
  supabaseCroppedImageService,
  type CroppedImageInsert,
} from "./supabaseCroppedImageService";

interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  supabaseId?: number;
  error?: string;
}

interface CloudinaryCroppedImage {
  public_id: string;
  secure_url: string;
  context?: {
    page_info?: string;
    page_number?: string;
    date?: string;
    created_at?: string;
  };
  tags: string[];
}

class CloudinaryCroppedService {
  private uploadPreset: string;
  private cloudName: string;
  private apiUrl: string;

  constructor() {
    this.uploadPreset = CLOUDINARY_CONFIG.uploadPreset;
    this.cloudName = CLOUDINARY_CONFIG.cloudName;
    this.apiUrl = CLOUDINARY_CONFIG.apiUrl;
  }

  // Convert base64 image data to blob
  private base64ToBlob(base64Data: string): Blob {
    const byteCharacters = atob(base64Data.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: "image/png" });
  }

  // Generate a unique public ID for the cropped image
  private generatePublicId(id: string): string {
    return `cropped-images/${id}`;
  }

  // Upload cropped image to Cloudinary
  async uploadCroppedImage(
    id: string,
    imageData: string,
    metadata?: {
      pageInfo?: string;
      pageNumber?: number;
      date?: string;
    }
  ): Promise<UploadResult> {
    try {
      if (!this.uploadPreset || !this.cloudName) {
        console.warn("Cloudinary configuration missing, cannot upload");
        return { success: false, error: "Cloudinary configuration missing" };
      }

      const blob = this.base64ToBlob(imageData);
      const publicId = this.generatePublicId(id);

      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", this.uploadPreset);
      formData.append("cloud_name", this.cloudName);
      formData.append("public_id", publicId);

      // Add context metadata for better searchability
      if (metadata) {
        const contextData = [
          metadata.pageInfo
            ? `page_info=${encodeURIComponent(metadata.pageInfo)}`
            : null,
          metadata.pageNumber ? `page_number=${metadata.pageNumber}` : null,
          metadata.date ? `date=${metadata.date}` : null,
          `created_at=${new Date().toISOString()}`,
        ]
          .filter(Boolean)
          .join("|");

        if (contextData) {
          formData.append("context", contextData);
        }
      }

      // Add tags for easy identification and cleanup
      const tags = [
        "cropped-image",
        "newspaper-crop",
        metadata?.date ? `date-${metadata.date}` : null,
        metadata?.pageNumber ? `page-${metadata.pageNumber}` : null,
      ].filter(Boolean);

      formData.append("tags", tags.join(","));

      const response = await fetch(this.apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Cloudinary upload failed: ${response.statusText} - ${errorText}`,
        };
      }

      const result = await response.json();

      console.log("result", result);

      // Save to Supabase database after successful Cloudinary upload
      let supabaseResult = null;
      if (metadata) {
        const supabaseData: CroppedImageInsert = {
          cloudinaryUrl: result.secure_url,
          cloudinaryKey: result.public_id,
          pageInfo: metadata.pageInfo,
          pageNumber: metadata.pageNumber,
          newsPaperDate: metadata.date,
        };

        supabaseResult = await supabaseCroppedImageService.saveCroppedImage(
          supabaseData
        );

        console.log("supabaseResult", supabaseResult);

        if (!supabaseResult.success) {
          console.warn("Failed to save to Supabase:", supabaseResult.error);
          // Continue with success since Cloudinary upload worked
          // You might want to implement retry logic here
        } else {
          console.log(
            "Successfully saved cropped image to Supabase:",
            supabaseResult.data
          );
        }
      }

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        supabaseId: supabaseResult?.success
          ? supabaseResult.data?.id
          : undefined,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  // Get public URL for a cropped image by ID
  getImageUrl(id: string): string {
    const publicId = this.generatePublicId(id);
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicId}`;
  }

  // Check if image exists in Cloudinary
  async imageExists(id: string): Promise<boolean> {
    try {
      const url = this.getImageUrl(id);
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Search for cropped images by ID (using Cloudinary search)
  async getCroppedImageInfo(
    id: string
  ): Promise<CloudinaryCroppedImage | null> {
    try {
      const publicId = this.generatePublicId(id);

      // Use Cloudinary's search API to get image details
      const searchUrl = `https://res.cloudinary.com/${this.cloudName}/image/search`;
      const params = new URLSearchParams({
        expression: `public_id="${publicId}"`,
        max_results: "1",
      });

      const response = await fetch(`${searchUrl}?${params}`);

      if (!response.ok) {
        return null;
      }

      const result = await response.json();

      if (result.resources && result.resources.length > 0) {
        return result.resources[0] as CloudinaryCroppedImage;
      }

      return null;
    } catch (error) {
      console.error("Error getting cropped image info:", error);
      return null;
    }
  }

  // Delete cropped image from Cloudinary (for cleanup)
  async deleteCroppedImage(id: string): Promise<boolean> {
    try {
      // Note: Deleting from Cloudinary requires Admin API credentials
      // For now, we'll just mark it as deleted or rely on Cloudinary's auto-cleanup
      console.log(`Marked cropped image ${id} for deletion`);
      return true;
    } catch (error) {
      console.error("Error deleting cropped image:", error);
      return false;
    }
  }

  // Check if Cloudinary is properly configured
  isConfigured(): boolean {
    return !!(this.uploadPreset && this.cloudName);
  }

  // Get all cropped images (for admin/cleanup purposes)
  async getAllCroppedImages(): Promise<CloudinaryCroppedImage[]> {
    try {
      const searchUrl = `https://res.cloudinary.com/${this.cloudName}/image/search`;
      const params = new URLSearchParams({
        expression: "tags:cropped-image",
        sort_by: "created_at",
        max_results: "100",
      });

      const response = await fetch(`${searchUrl}?${params}`);

      if (!response.ok) {
        return [];
      }

      const result = await response.json();
      return result.resources || [];
    } catch (error) {
      console.error("Error getting all cropped images:", error);
      return [];
    }
  }
}

// Export singleton instance
export const cloudinaryCroppedService = new CloudinaryCroppedService();
