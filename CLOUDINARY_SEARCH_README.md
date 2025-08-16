# Cloudinary Search API - Test Guide

This guide explains how to use the Cloudinary Search API to find newspaper images based on metadata context.

## 🚀 Quick Start

### 1. Environment Variables

Make sure you have these environment variables set in your `.env` file:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Basic Usage

The main function follows the pattern you requested:

```typescript
const result = await cloudinary.search
  .expression('context.date="2024-01-15"')
  .execute();
```

## 📚 Available Functions

### `searchNewspaperImages(date, page?)`
Search for images with specific date context and optional page number.

```typescript
// Search by date only
const result = await searchNewspaperImages('2024-01-15');

// Search by date and page
const result = await searchNewspaperImages('2024-01-15', 1);
```

### `getAllImagesForDate(date)`
Get all images for a specific date.

```typescript
const images = await getAllImagesForDate('2024-01-15');
console.log(`Found ${images.length} images for date 2024-01-15`);
```

### `searchImagesByTags(tags)`
Search for images with specific tags.

```typescript
const images = await searchImagesByTags(['newspaper', 'front-page']);
```

### `advancedSearch(criteria)`
Advanced search with multiple criteria.

```typescript
const result = await advancedSearch({
  date: '2024-01-15',
  section: 'front-page',
  format: 'jpg',
  minWidth: 800,
  maxWidth: 2000,
});
```

## 🧪 Testing

### Method 1: Browser Console

1. Import the test file in your app
2. Open browser console
3. Run test functions:

```javascript
// Test individual functions
testSearchByDate();
testGetAllImagesForDate();
testSearchByDateAndPage();

// Run all tests
runAllTests();
```

### Method 2: Direct Function Calls

```javascript
// Test the search directly
const result = await searchNewspaperImages('2024-01-15');
console.log('Search result:', result);

// Test with page number
const pageResult = await searchNewspaperImages('2024-01-15', 1);
console.log('Page result:', pageResult);
```

## 🔍 Search Expressions

The search API supports various expressions:

### Basic Context Search
```typescript
// Search by date
'context.date="2024-01-15"'

// Search by date and page
'context.date="2024-01-15" AND context.page="1"'

// Search by section
'context.section="front-page"'
```

### Tag Search
```typescript
// Search by single tag
'tag=newspaper'

// Search by multiple tags (AND)
'tag=newspaper AND tag=front-page'

// Search by multiple tags (OR)
'tag=newspaper OR tag=back-page'
```

### Format and Size Search
```typescript
// Search by format
'format=jpg'

// Search by dimensions
'width>=800 AND height>=600'

// Search by file size
'bytes<1000000'
```

## 📊 Expected Response Structure

```typescript
interface SearchResult {
  resources: CloudinaryImage[];
  total_count: number;
  next_cursor?: string;
}

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
```

## 🎯 Example Use Cases

### 1. Get Today's Newspaper Pages
```typescript
const today = new Date().toISOString().split('T')[0];
const todaysImages = await getAllImagesForDate(today);
```

### 2. Find Specific Page
```typescript
const page1Image = await searchNewspaperImages('2024-01-15', 1);
```

### 3. Search by Section
```typescript
const frontPageImages = await advancedSearch({
  date: '2024-01-15',
  section: 'front-page'
});
```

### 4. Find High-Resolution Images
```typescript
const hdImages = await advancedSearch({
  date: '2024-01-15',
  minWidth: 1920,
  format: 'jpg'
});
```

## ⚠️ Important Notes

1. **API Limits**: Cloudinary has rate limits and result limits
2. **Context Metadata**: Images must have proper context metadata set during upload
3. **Authentication**: Requires valid API key and secret
4. **CORS**: May need to handle CORS issues in production

## 🐛 Troubleshooting

### Common Issues:

1. **"Invalid credentials"**: Check your API key and secret
2. **"No results found"**: Verify context metadata exists on images
3. **"Rate limit exceeded"**: Wait and retry, or implement rate limiting
4. **"CORS error"**: Use server-side implementation for production

### Debug Tips:

1. Check console logs for detailed error messages
2. Verify environment variables are loaded correctly
3. Test with simple expressions first
4. Use the test functions to isolate issues

## 🔗 Integration

To integrate with your existing newspaper app:

```typescript
// In your NewspaperApp.tsx or similar
import { searchNewspaperImages, getAllImagesForDate } from '@/lib/cloudinarySearch';

// Replace existing dummy API calls
const fetchNewspaper = async (dateString: string) => {
  try {
    const images = await getAllImagesForDate(dateString);
    // Transform Cloudinary images to your app's format
    return transformCloudinaryImages(images);
  } catch (error) {
    console.error('Failed to fetch from Cloudinary:', error);
    // Fallback to dummy data
    return dummyNewspaperData;
  }
};
```

This setup gives you a robust foundation for searching Cloudinary images based on your newspaper's metadata structure! 🎉
