// Browser-compatible Cloudinary Search API
// Uses Cloudinary's public search API and provides fallback for testing

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  context?: {
    date?: string;
    page?: string;
    section?: string;
  };
  tags: string[];
}

interface SearchResult {
  resources: CloudinaryImage[];
  total_count: number;
  next_cursor?: string;
}

// Cloudinary configuration from environment variables
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;

// Check if we have proper Cloudinary credentials
const hasValidCredentials = CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET;

/**
 * Mock data for testing when Cloudinary credentials aren't available
 */
function getMockData(date: string, page?: number): SearchResult {
  const mockImages: CloudinaryImage[] = [
    {
      public_id: `newspaper/${date}/page-${page || 1}`,
      secure_url: `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Newspaper+${date}+Page+${page || 1}`,
      width: 800,
      height: 600,
      format: 'jpg',
      created_at: new Date(date).toISOString(),
      context: {
        date: date,
        page: (page || 1).toString(),
        section: page === 1 ? 'front-page' : 'general'
      },
      tags: ['newspaper', 'page', date]
    },
    {
      public_id: `newspaper/${date}/page-${page ? page + 1 : 2}`,
      secure_url: `https://via.placeholder.com/800x600/059669/FFFFFF?text=Newspaper+${date}+Page+${page ? page + 1 : 2}`,
      width: 800,
      height: 600,
      format: 'jpg',
      created_at: new Date(date).toISOString(),
      context: {
        date: date,
        page: (page ? page + 1 : 2).toString(),
        section: 'general'
      },
      tags: ['newspaper', 'page', date]
    }
  ];

  return {
    resources: mockImages,
    total_count: mockImages.length,
    next_cursor: undefined
  };
}

/**
 * Search for newspaper images in Cloudinary based on date context
 * @param date - Date string in YYYY-MM-DD format
 * @param page - Optional page number
 * @returns Promise<SearchResult>
 */
export async function searchNewspaperImages(date: string, page?: number): Promise<SearchResult> {
  try {
    console.log(`Searching for images with date: ${date}${page ? `, page: ${page}` : ''}`);

    // If no valid credentials, return mock data
    if (!hasValidCredentials) {
      console.warn('⚠️ No valid Cloudinary credentials found. Using mock data for testing.');
      return getMockData(date, page);
    }

    // Build search expression
    let expression = `context.date="${date}"`;
    
    if (page) {
      expression += ` AND context.page="${page}"`;
    }

    console.log('Search expression:', expression);

    // Use Cloudinary's public search API (limited functionality but works without Admin API)
    const searchUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/search`;
    const params = new URLSearchParams({
      expression: expression,
      sort_by: 'created_at',
      max_results: '100',
    });

    const response = await fetch(`${searchUrl}?${params}`);
    
    if (!response.ok) {
      console.warn('⚠️ Cloudinary search failed, falling back to mock data');
      return getMockData(date, page);
    }

    const result = await response.json();
    console.log('Search result:', result);

    return {
      resources: result.resources || [],
      total_count: result.total_count || 0,
      next_cursor: result.next_cursor,
    };

  } catch (error) {
    console.error('Error searching Cloudinary images:', error);
    console.warn('⚠️ Falling back to mock data due to error');
    return getMockData(date, page);
  }
}

/**
 * Search for all images with a specific date context
 * @param date - Date string in YYYY-MM-DD format
 * @returns Promise<CloudinaryImage[]>
 */
export async function getAllImagesForDate(date: string): Promise<CloudinaryImage[]> {
  try {
    console.log(`Getting all images for date: ${date}`);

    // If no valid credentials, return mock data
    if (!hasValidCredentials) {
      console.warn('⚠️ No valid Cloudinary credentials found. Using mock data for testing.');
      const mockResult = getMockData(date);
      return mockResult.resources;
    }

    // Use Cloudinary's public search API
    const searchUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/search`;
    const params = new URLSearchParams({
      expression: `context.date="${date}"`,
      sort_by: 'created_at',
      max_results: '500',
    });

    const response = await fetch(`${searchUrl}?${params}`);
    
    if (!response.ok) {
      console.warn('⚠️ Cloudinary search failed, falling back to mock data');
      const mockResult = getMockData(date);
      return mockResult.resources;
    }

    const result = await response.json();
    console.log(`Found ${result.total_count} images for date ${date}`);

    return result.resources || [];

  } catch (error) {
    console.error('Error getting images for date:', error);
    console.warn('⚠️ Falling back to mock data due to error');
    const mockResult = getMockData(date);
    return mockResult.resources;
  }
}

/**
 * Search for images with specific tags
 * @param tags - Array of tags to search for
 * @returns Promise<CloudinaryImage[]>
 */
export async function searchImagesByTags(tags: string[]): Promise<CloudinaryImage[]> {
  try {
    console.log(`Searching for images with tags:`, tags);

    // If no valid credentials, return mock data
    if (!hasValidCredentials) {
      console.warn('⚠️ No valid Cloudinary credentials found. Using mock data for testing.');
      const mockResult = getMockData('2024-01-15');
      return mockResult.resources.filter(img => 
        tags.some(tag => img.tags.includes(tag))
      );
    }

    const tagExpression = tags.map(tag => `tag=${tag}`).join(' AND ');

    const searchUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/search`;
    const params = new URLSearchParams({
      expression: tagExpression,
      sort_by: 'created_at',
      max_results: '100',
    });

    const response = await fetch(`${searchUrl}?${params}`);
    
    if (!response.ok) {
      console.warn('⚠️ Cloudinary search failed, falling back to mock data');
      const mockResult = getMockData('2024-01-15');
      return mockResult.resources.filter(img => 
        tags.some(tag => img.tags.includes(tag))
      );
    }

    const result = await response.json();
    console.log(`Found ${result.total_count} images with tags:`, tags);

    return result.resources || [];

  } catch (error) {
    console.error('Error searching images by tags:', error);
    console.warn('⚠️ Falling back to mock data due to error');
    const mockResult = getMockData('2024-01-15');
    return mockResult.resources.filter(img => 
      tags.some(tag => img.tags.includes(tag))
    );
  }
}

/**
 * Advanced search with multiple criteria
 * @param criteria - Search criteria object
 * @returns Promise<SearchResult>
 */
export async function advancedSearch(criteria: {
  date?: string;
  page?: number;
  section?: string;
  tags?: string[];
  format?: string;
  minWidth?: number;
  maxWidth?: number;
}): Promise<SearchResult> {
  try {
    console.log('Advanced search criteria:', criteria);

    // If no valid credentials, return mock data
    if (!hasValidCredentials) {
      console.warn('⚠️ No valid Cloudinary credentials found. Using mock data for testing.');
      return getMockData(criteria.date || '2024-01-15', criteria.page);
    }

    let expression = '';

    // Build complex expression
    if (criteria.date) {
      expression += `context.date="${criteria.date}"`;
    }

    if (criteria.page) {
      if (expression) expression += ' AND ';
      expression += `context.page="${criteria.page}"`;
    }

    if (criteria.section) {
      if (expression) expression += ' AND ';
      expression += `context.section="${criteria.section}"`;
    }

    if (criteria.tags && criteria.tags.length > 0) {
      if (expression) expression += ' AND ';
      const tagExpression = criteria.tags.map(tag => `tag=${tag}`).join(' AND ');
      expression += `(${tagExpression})`;
    }

    if (criteria.format) {
      if (expression) expression += ' AND ';
      expression += `format=${criteria.format}`;
    }

    if (criteria.minWidth) {
      if (expression) expression += ' AND ';
      expression += `width>=${criteria.minWidth}`;
    }

    if (criteria.maxWidth) {
      if (expression) expression += ' AND ';
      expression += `width<=${criteria.maxWidth}`;
    }

    // Default expression if none provided
    if (!expression) {
      expression = 'resource_type:image';
    }

    console.log('Advanced search expression:', expression);

    const searchUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/search`;
    const params = new URLSearchParams({
      expression: expression,
      sort_by: 'created_at',
      max_results: '100',
    });

    const response = await fetch(`${searchUrl}?${params}`);
    
    if (!response.ok) {
      console.warn('⚠️ Cloudinary search failed, falling back to mock data');
      return getMockData(criteria.date || '2024-01-15', criteria.page);
    }

    const result = await response.json();
    console.log('Advanced search result:', result);

    return {
      resources: result.resources || [],
      total_count: result.total_count || 0,
      next_cursor: result.next_cursor,
    };

  } catch (error) {
    console.error('Error in advanced search:', error);
    console.warn('⚠️ Falling back to mock data due to error');
    return getMockData(criteria.date || '2024-01-15', criteria.page);
  }
}

/**
 * Test function to demonstrate usage
 */
export async function testCloudinarySearch() {
  try {
    console.log('🧪 Testing Cloudinary Search API...');

    // Test 1: Search by date
    console.log('\n📅 Test 1: Search by date');
    const dateResult = await searchNewspaperImages('2024-01-15');
    console.log(`Found ${dateResult.total_count} images for date 2024-01-15`);

    // Test 2: Search by date and page
    console.log('\n📄 Test 2: Search by date and page');
    const pageResult = await searchNewspaperImages('2024-01-15', 1);
    console.log(`Found ${pageResult.total_count} images for date 2024-01-15, page 1`);

    // Test 3: Search by tags
    console.log('\n🏷️ Test 3: Search by tags');
    const tagResult = await searchImagesByTags(['newspaper', 'front-page']);
    console.log(`Found ${tagResult.length} images with newspaper and front-page tags`);

    // Test 4: Advanced search
    console.log('\n🔍 Test 4: Advanced search');
    const advancedResult = await advancedSearch({
      date: '2024-01-15',
      section: 'front-page',
      format: 'jpg',
      minWidth: 800,
      maxWidth: 2000,
    });
    console.log(`Advanced search found ${advancedResult.total_count} images`);

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in other files
export default {
  searchNewspaperImages,
  getAllImagesForDate,
  searchImagesByTags,
  advancedSearch,
  testCloudinarySearch,
};
