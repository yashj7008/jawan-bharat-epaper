// Test file for Cloudinary Search API
// Run this in the browser console or as a separate test

import { testCloudinarySearch, searchNewspaperImages, getAllImagesForDate } from './lib/cloudinarySearch';

// Example 1: Test the search function directly
async function testSearchByDate() {
  try {
    console.log('🔍 Testing search by date...');
    
    // Search for images with date context "2024-01-15"
    const result = await searchNewspaperImages('2024-01-15');
    
    console.log('Search result:', result);
    console.log(`Found ${result.total_count} images`);
    
    if (result.resources.length > 0) {
      console.log('First image:', result.resources[0]);
    }
    
  } catch (error) {
    console.error('Search test failed:', error);
  }
}

// Example 2: Test getting all images for a specific date
async function testGetAllImagesForDate() {
  try {
    console.log('📅 Testing get all images for date...');
    
    const images = await getAllImagesForDate('2024-01-15');
    
    console.log(`Found ${images.length} images for date 2024-01-15`);
    
    images.forEach((image, index) => {
      console.log(`Image ${index + 1}:`, {
        public_id: image.public_id,
        url: image.secure_url,
        date: image.context?.date,
        page: image.context?.page,
        section: image.context?.section,
        tags: image.tags
      });
    });
    
  } catch (error) {
    console.error('Get all images test failed:', error);
  }
}

// Example 3: Test search with page number
async function testSearchByDateAndPage() {
  try {
    console.log('📄 Testing search by date and page...');
    
    const result = await searchNewspaperImages('2024-01-15', 1);
    
    console.log(`Found ${result.total_count} images for date 2024-01-15, page 1`);
    
    if (result.resources.length > 0) {
      console.log('Page 1 image:', result.resources[0]);
    }
    
  } catch (error) {
    console.error('Search by date and page test failed:', error);
  }
}

// Example 4: Run all tests
async function runAllTests() {
  console.log('🚀 Starting Cloudinary Search Tests...\n');
  
  await testSearchByDate();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testGetAllImagesForDate();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testSearchByDateAndPage();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Run the comprehensive test function
  await testCloudinarySearch();
  
  console.log('\n🎉 All tests completed!');
}

// // Export functions for use in browser console
window.testCloudinarySearch = {
  testSearchByDate,
  testGetAllImagesForDate,
  testSearchByDateAndPage,
  runAllTests,
  testCloudinarySearch
};

// Auto-run tests if this file is imported
if (typeof window !== 'undefined') {
  console.log('🧪 Cloudinary Search Test Functions Loaded!');
  console.log('Available functions:');
  console.log('- testSearchByDate()');
  console.log('- testGetAllImagesForDate()');
  console.log('- testSearchByDateAndPage()');
  console.log('- runAllTests()');
  console.log('- testCloudinarySearch()');
  console.log('\nRun any of these functions to test the Cloudinary Search API!');
}

export {
  testSearchByDate,
  testGetAllImagesForDate,
  testSearchByDateAndPage,
  runAllTests
};
