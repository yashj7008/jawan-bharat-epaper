import { CloudinaryImage } from './cloudinary';

export interface NewspaperPage {
  section: string;
  title: string;
  images: CloudinaryImage[];
  content: any[];
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
      const response = await fetch('/api/newspapers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date_of_paper: date,
          pages: pages
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create newspaper: ${response.statusText}`);
      }

      const result = await response.json();
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
      const response = await fetch(`/api/newspapers/${date}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching newspaper:', error);
      return null;
    }
  }

  // Check if newspaper exists for a date
  async newspaperExists(date: string): Promise<boolean> {
    const newspaper = await this.getNewspaperByDate(date);
    return !!newspaper;
  }

  // Generate newspaper data structure from Cloudinary images
  generateNewspaperData(images: CloudinaryImage[], date: string): NewspaperData {
    const pages: Record<string, NewspaperPage> = {};
    let totalPages = 0;

    // Group images by page
    images.forEach(image => {
      const pageNum = image.context?.page || '1';
      const section = image.context?.section || 'general';
      
      if (!pages[pageNum]) {
        pages[pageNum] = {
          section,
          title: `Page ${pageNum}`,
          images: [],
          content: []
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
    const errors: string[] = [];

    if (!data.totalPages || data.totalPages <= 0) {
      errors.push('Total pages must be greater than 0');
    }

    if (!data.pages || Object.keys(data.pages).length === 0) {
      errors.push('At least one page must be provided');
    }

    // Validate each page
    Object.entries(data.pages).forEach(([pageNum, page]) => {
      if (!page.section) {
        errors.push(`Page ${pageNum}: Section is required`);
      }
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
