import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { searchNewspaperImages, getAllImagesForDate, searchImagesByTags, advancedSearch } from '@/lib/cloudinarySearch';

export function CloudinaryTest() {
  const [date, setDate] = useState('2025-08-16');
  const [page, setPage] = useState('1');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchByDate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchNewspaperImages(date);
      setResults(result);
      console.log('Search result:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const images = await getAllImagesForDate(date);
      setResults({ resources: images, total_count: images.length });
      console.log('All images:', images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get images');
      console.error('Get images error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByDateAndPage = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchNewspaperImages(date, parseInt(page));
      setResults(result);
      console.log('Page search result:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Page search failed');
      console.error('Page search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await advancedSearch({
        date: date,
        page: parseInt(page),
        format: 'jpg',
        minWidth: 800,
      });
      setResults(result);
      console.log('Advanced search result:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Advanced search failed');
      console.error('Advanced search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const images = await searchImagesByTags(['newspaper', 'front-page']);
      setResults({ resources: images, total_count: images.length });
      console.log('Tag search result:', images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tag search failed');
      console.error('Tag search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Cloudinary Search Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date (YYYY-MM-DD)</Label>
              <Input
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="2025-08-16"
              />
            </div>
            <div>
              <Label htmlFor="page">Page Number</Label>
              <Input
                id="page"
                value={page}
                onChange={(e) => setPage(e.target.value)}
                placeholder="1"
                type="number"
              />
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              onClick={handleSearchByDate} 
              disabled={loading}
              variant="outline"
            >
              🔍 Search by Date
            </Button>
            
            <Button 
              onClick={handleGetAllImages} 
              disabled={loading}
              variant="outline"
            >
              📅 Get All Images
            </Button>
            
            <Button 
              onClick={handleSearchByDateAndPage} 
              disabled={loading}
              variant="outline"
            >
              📄 Search by Date & Page
            </Button>
            
            <Button 
              onClick={handleAdvancedSearch} 
              disabled={loading}
              variant="outline"
            >
              🔬 Advanced Search
            </Button>
            
            <Button 
              onClick={handleSearchByTags} 
              disabled={loading}
              variant="outline"
            >
              🏷️ Search by Tags
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Searching Cloudinary...</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {results && !loading && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">Results:</p>
              <p className="text-green-600 text-sm">
                Found {results.total_count} images
              </p>
              {results.resources && results.resources.length > 0 && (
                <div className="mt-3">
                  <p className="text-green-700 text-sm font-medium">First Image:</p>
                  <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-auto">
                    {JSON.stringify(results.resources[0], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">How to Use:</p>
            <ol className="text-blue-700 text-sm mt-2 space-y-1 list-decimal list-inside">
              <li>Set the date and page number above</li>
              <li>Click any of the test buttons</li>
              <li>Check the browser console for detailed results</li>
              <li>Results will appear below when complete</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
