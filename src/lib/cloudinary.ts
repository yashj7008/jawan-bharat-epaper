// Cloudinary Configuration
// Set these environment variables in your .env file

export interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  context: {
    date: string;
    page: string;
  };
  tags: string[];
  created_at: string;
}

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  context?: {
    date?: string;
    page?: string;
  };
  tags?: string[];
  created_at: string;
}

interface CloudinaryApiResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
  total_count?: number;
}

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your_api_key',
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET || 'your_api_secret',
  apiUrl: `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name'}/image/upload`
};

// Setup Instructions:
// 1. Create a .env file in your project root
// 2. Add these variables:
//    VITE_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
//    VITE_CLOUDINARY_UPLOAD_PRESET=your_actual_upload_preset
//    VITE_CLOUDINARY_API_KEY=your_actual_api_key
//    VITE_CLOUDINARY_API_SECRET=your_actual_api_secret
// 3. Restart your development server

export const uploadToCloudinary = async (file: File, date: Date, pageNumber: number): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
  
  // Add context metadata for newspaper pages
  const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  formData.append('context', `date=${formattedDate}|page=${pageNumber}`);
  formData.append('tags', `newspaper,page-${pageNumber},date-${formattedDate}`);

  const response = await fetch(CLOUDINARY_CONFIG.apiUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};

// Function to fetch newspaper pages from Cloudinary based on date and page number
export const fetchNewspaperPages = async (date: Date, pageNumber?: number): Promise<CloudinaryImage[]> => {
  const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  try {
    // Get existing images
    const existingImages = localStorage.getItem('cloudinary_images');
    const allImages: CloudinaryImage[] = existingImages ? JSON.parse(existingImages) : [];
    
    // Filter by date
    let filteredImages = allImages.filter(img => {
      const imageDate = img.context?.date || img.tags?.find(tag => tag.startsWith('date-'))?.replace('date-', '');
      return imageDate === formattedDate;
    });
    
    // Filter by page number if specified
    if (pageNumber) {
      filteredImages = filteredImages.filter(img => {
        const imagePage = img.context?.page || img.tags?.find(tag => tag.startsWith('page-'))?.replace('page-', '');
        return parseInt(imagePage) === pageNumber;
      });
    }
    
    console.log(`Found ${filteredImages.length} images for ${formattedDate}${pageNumber ? ` - Page ${pageNumber}` : ''}`);
    return filteredImages;
    
  } catch (error) {
    console.error('Error fetching stored images:', error);
    return [];
  }
};

// Function to store uploaded image information locally
export const storeUploadedImage = (cloudinaryUrl: string, date: Date, pageNumber: number, publicId?: string) => {
  try {
    const formattedDate = date.toISOString().split('T')[0];
    
    const imageData: CloudinaryImage = {
      public_id: publicId || `newspaper_${formattedDate}_page_${pageNumber}`,
      secure_url: cloudinaryUrl,
      context: {
        date: formattedDate,
        page: pageNumber.toString()
      },
      tags: [`newspaper`, `page-${pageNumber}`, `date-${formattedDate}`],
      created_at: new Date().toISOString()
    };
    
    // Get existing images
    const existingImages = localStorage.getItem('cloudinary_images');
    const images: CloudinaryImage[] = existingImages ? JSON.parse(existingImages) : [];
    
    // Add new image
    images.push(imageData);
    
    // Store back to localStorage
    localStorage.setItem('cloudinary_images', JSON.stringify(images));
    
    console.log('Image stored locally:', imageData);
    
  } catch (error) {
    console.error('Error storing image locally:', error);
  }
};