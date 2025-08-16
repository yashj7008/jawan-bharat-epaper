import { CloudinaryImage } from './cloudinary';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}


export interface NewspaperPage {
  title: string;
  images: CloudinaryImage[];
}

export interface NewspaperData {
  totalPages: number;
  metadata: {
    edition: string;
    language: string;
    publicationStatus: string;
  };
  pages: Record<string, NewspaperPage>;
}

export interface NewspaperRecord {
  id: string;
  date_of_paper: string;
  pages: NewspaperData;
  created_at: string;
}

export class NewspaperService {
  private static instance: NewspaperService;
  
  static getInstance(): NewspaperService {
    if (!NewspaperService.instance) {
      NewspaperService.instance = new NewspaperService();
    }
    return NewspaperService.instance;
  }

  // Create a new newspaper record
  async createNewspaper(date: string, pages: NewspaperData): Promise<NewspaperRecord> {
    try {
      console.log('Creating newspaper:', date, pages);
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('supabase', supabase);    

      const { data, error } = await supabase
        .from('newspaper')
        .insert([{ date_of_paper: date, pages: pages }])
        .select();

      if (error) {
        throw new Error(`Failed to create newspaper: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from database');
      }

      const result = data[0];
      console.log('✅ Newspaper created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating newspaper:', error);
      throw error;
    }
  }

  // Get newspaper by date
  async getNewspaperByDate(date: string): Promise<NewspaperRecord | null> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await supabase
        .from('newspaper')
        .select('*')
        .eq('date_of_paper', date)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw new Error(`Failed to fetch newspaper: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching newspaper:', error);
      return null;
    }
  }

  // Check if newspaper exists for a date
  async newspaperExists(date: string): Promise<boolean> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        return false;
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { count, error } = await supabase
        .from('newspaper')
        .select('*', { count: 'exact', head: true })
        .eq('date_of_paper', date);

      if (error) {
        console.error('Error checking newspaper existence:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Error checking newspaper existence:', error);
      return false;
    }
  }

  // Generate newspaper data structure from Cloudinary images
  generateNewspaperData(images: CloudinaryImage[], date: string): NewspaperData {
    const pages: Record<string, NewspaperPage> = {};
    let totalPages = 0;

    // Group images by page
    images.forEach(image => {
      const pageNum = image.context?.page || '1';
      
      if (!pages[pageNum]) {
        pages[pageNum] = {
          title: `Page ${pageNum}`,
          images: [],
        };
      }
      
      pages[pageNum].images.push(image);
      totalPages = Math.max(totalPages, parseInt(pageNum));
    });

    return {
      totalPages,
      metadata: {
        edition: 'morning',
        language: 'en',
        publicationStatus: 'published'
      },
      pages
    };
  }

  // Validate newspaper data before saving
  validateNewspaperData(data: NewspaperData): { isValid: boolean; errors: string[] } {
    console.log('Validating newspaper data:', data);
    const errors: string[] = [];

    if (!data.totalPages || data.totalPages <= 0) {
      errors.push('Total pages must be greater than 0');
    }

    if (!data.pages || Object.keys(data.pages).length === 0) {
      errors.push('At least one page must be provided');
    }

    // Validate each page
    Object.entries(data.pages).forEach(([pageNum, page]) => {
      if (!page.title) {
        errors.push(`Page ${pageNum}: Title is required`);
      }
      if (!page.images || page.images.length === 0) {
        errors.push(`Page ${pageNum}: At least one image is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const newspaperService = NewspaperService.getInstance();
