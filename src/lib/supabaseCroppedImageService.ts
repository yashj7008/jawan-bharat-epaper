// Supabase service for cropped images
import { supabase } from './supabase';

export interface CroppedImageRecord {
  id?: number | string;
  created_at?: string;
  cloudinary_url: string;
  cloudinary_key?: string;
  page_info?: string;
  page_number?: number;
  news_paper_date?: string;
}

export interface CroppedImageInsert {
  cloudinary_url: string;
  cloudinary_key?: string;
  page_info: string;
  page_number?: number;
  news_paper_date?: string;
}

class SupabaseCroppedImageService {
  private tableName = 'newspaper_clips'; // Adjust table name as needed

  // Save cropped image data to Supabase
  async saveCroppedImage(data: CroppedImageInsert): Promise<{ success: boolean; data?: CroppedImageRecord; error?: string }> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Error saving cropped image to Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Error saving cropped image:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get cropped image by ID
  async getCroppedImageById(id: string): Promise<{ success: boolean; data?: CroppedImageRecord; error?: string }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('cloudinary_key', id)
        .single();

      if (error) {
        console.error('Error fetching cropped image:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching cropped image:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get cropped image by Cloudinary key (public_id)
  async getCroppedImageByCloudinaryKey(cloudinaryKey: string): Promise<{ success: boolean; data?: CroppedImageRecord; error?: string }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('cloudinaryKey', cloudinaryKey)
        .single();

      if (error) {
        console.error('Error fetching cropped image by cloudinary key:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching cropped image by cloudinary key:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get cropped images by date
  async getCroppedImagesByDate(date: string): Promise<{ success: boolean; data?: CroppedImageRecord[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('newsPaperDate', date)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cropped images by date:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching cropped images by date:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get cropped images by page number and date
  async getCroppedImagesByPageAndDate(pageNumber: number, date: string): Promise<{ success: boolean; data?: CroppedImageRecord[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('pageNumber', pageNumber)
        .eq('newsPaperDate', date)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cropped images by page and date:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching cropped images by page and date:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Delete cropped image by ID
  async deleteCroppedImage(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting cropped image:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting cropped image:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get all cropped images with pagination
  async getAllCroppedImages(limit: number = 50, offset: number = 0): Promise<{ success: boolean; data?: CroppedImageRecord[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching all cropped images:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching all cropped images:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const supabaseCroppedImageService = new SupabaseCroppedImageService();
