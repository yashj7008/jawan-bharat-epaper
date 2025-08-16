// Integrated Newspaper API service
// Combines dummy API with Cloudinary fetch for real newspaper pages

import { fetchNewspaperPages, type CloudinaryImage } from './cloudinary';

export interface NewspaperPage {
  pageNumber: number;
  imageUrl: string;
  section: string;
  title: string;
  content: string;
  metadata: {
    date: string;
    headlines: string[];
    author?: string;
  };
}

export interface NewspaperData {
  date: string;
  totalPages: number;
  pages: NewspaperPage[];
  title: string;
  edition: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Dummy newspaper data as fallback
const dummyNewspaperData: NewspaperData = {
  date: new Date().toISOString().split("T")[0],
  totalPages: 8,
  title: "Jawan Bharat",
  edition: "Morning Edition",
  pages: [
    {
      pageNumber: 1,
      imageUrl:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCA4MDAgMTAwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjZmZmZmZmIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI5MDAiIGZpbGw9IiNmMGYwZjAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZyb250IFBhZ2U8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJyZWFraW5nIE5ld3M8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRlY2ggU2VjdG9yIEJyZWFrdGhyb3VnaDwvdGV4dD4KPHRleHQgeD0iNDAwIiB5PSIzMTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29tbXVuaXR5IEZlc3RpdmFsPC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjM0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5XZWF0aGVyIEZvcmVjYXN0PC90ZXh0Pgo8L3N2Zz4K",
      section: "front-page",
      title: "Front Page - Breaking News",
      content:
        "Major developments in technology sector. Local community celebrates annual festival. Weather forecast for the week ahead.",
      metadata: {
        date: new Date().toISOString().split("T")[0],
        headlines: [
          "Tech Sector Breakthrough",
          "Community Festival Success",
          "Weekly Weather Update",
        ],
      },
    },
    {
      pageNumber: 2,
      imageUrl:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCA4MDAgMTAwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjZmZmZmZmIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI5MDAiIGZpbGw9IiNmMGYwZjAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJ1c2luZXNzPC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjIwMCIgZm9udC1mYW1seT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlN0b2NrIE1hcmtldDwvdGV4dD4KPHRleHQgeD0iNDAwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVjaCBNZXJnZXJzIE5ld3M8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iMzEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPUVjb25vbWljIEdyb3d0aDwvdGV4dD4KPC9zdmc+Cg==",
      section: "business",
      title: "Business Section",
      content:
        "Stock market reaches new heights. Tech companies announce major mergers. Economic indicators show positive growth trends.",
      metadata: {
        date: new Date().toISOString().split("T")[0],
        headlines: [
          "Stock Market Records",
          "Tech Merger News",
          "Economic Growth",
        ],
      },
    },
  ],
};

// Function to convert Cloudinary images to NewspaperPage format
const convertCloudinaryToNewspaperPage = (cloudinaryImage: CloudinaryImage, pageNumber: number): NewspaperPage => {
  return {
    pageNumber: pageNumber,
    imageUrl: cloudinaryImage.secure_url,
    section: `page-${pageNumber}`,
    title: `Page ${pageNumber} - ${cloudinaryImage.context.date}`,
    content: `Newspaper page from ${cloudinaryImage.context.date}`,
    metadata: {
      date: cloudinaryImage.context.date,
      headlines: [`Page ${pageNumber} Content`],
      author: "Newspaper Staff"
    }
  };
};

// Main function to get newspaper data
export const getNewspaper = async (dateString: string): Promise<NewspaperData> => {
  await delay(500); // Simulate network delay
  
  try {
    // First, try to fetch real newspaper pages from Cloudinary
    const date = new Date(dateString);
    const cloudinaryImages = await fetchNewspaperPages(date);
    
    if (cloudinaryImages.length > 0) {
      // Convert Cloudinary images to newspaper pages
      const pages: NewspaperPage[] = cloudinaryImages.map((img, index) => {
        const pageNumber = parseInt(img.context.page) || index + 1;
        return convertCloudinaryToNewspaperPage(img, pageNumber);
      });
      
      // Sort pages by page number
      pages.sort((a, b) => a.pageNumber - b.pageNumber);
      
      return {
        date: dateString,
        totalPages: pages.length,
        pages: pages,
        title: "Daily News",
        edition: "Morning Edition"
      };
    }
  } catch (error) {
    console.log('Cloudinary fetch failed, using dummy data:', error);
  }
  
  // Fallback to dummy data if Cloudinary fetch fails
  return {
    ...dummyNewspaperData,
    date: dateString
  };
};

// Function to get a specific page
export const getNewspaperPage = async (dateString: string, pageNumber: number): Promise<NewspaperPage | null> => {
  try {
    const date = new Date(dateString);
    const cloudinaryImages = await fetchNewspaperPages(date, pageNumber);
    
    if (cloudinaryImages.length > 0) {
      const img = cloudinaryImages[0];
      return convertCloudinaryToNewspaperPage(img, pageNumber);
    }
  } catch (error) {
    console.log('Cloudinary fetch failed for specific page:', error);
  }
  
  // Fallback to dummy data
  const dummyData = await getNewspaper(dateString);
  return dummyData.pages.find(page => page.pageNumber === pageNumber) || null;
};

// Function to get all pages for a date
export const getAllPagesForDate = async (dateString: string): Promise<NewspaperPage[]> => {
  try {
    const date = new Date(dateString);
    const cloudinaryImages = await fetchNewspaperPages(date);
    
    if (cloudinaryImages.length > 0) {
      return cloudinaryImages.map((img, index) => {
        const pageNumber = parseInt(img.context.page) || index + 1;
        return convertCloudinaryToNewspaperPage(img, pageNumber);
      }).sort((a, b) => a.pageNumber - b.pageNumber);
    }
  } catch (error) {
    console.log('Cloudinary fetch failed for all pages:', error);
  }
  
  // Fallback to dummy data
  const dummyData = await getNewspaper(dateString);
  return dummyData.pages;
};
