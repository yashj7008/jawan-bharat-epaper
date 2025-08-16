import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Upload, X, CheckCircle, AlertCircle, Calendar as CalendarIcon, User, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadToCloudinary, CloudinaryImage, storeUploadedImage } from '@/lib/cloudinary';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { newspaperService, NewspaperData } from '@/lib/newspaperService';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  cloudinaryUrl?: string;
  error?: string;
  date: Date;
  pageNumber: number;
}

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pageNumber, setPageNumber] = useState(1);
  const [isCreatingNewspaper, setIsCreatingNewspaper] = useState(false);
  const [newspaperExists, setNewspaperExists] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if newspaper exists when date changes
  React.useEffect(() => {
    checkNewspaperExists(selectedDate);
  }, [selectedDate]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const newImages: UploadedImage[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
      date: selectedDate,
      pageNumber: pageNumber
    }));

    setImages(prev => [...prev, ...newImages]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };



  const clearLocalStorage = () => {
    localStorage.removeItem('cloudinary_images');
    setImages([]);
    setNewspaperExists(false);
    toast({
      title: "Storage Cleared",
      description: "All uploaded images have been cleared",
    });
  };

  // Create newspaper record in database
  const createNewspaper = async () => {
    const successImages = images.filter(img => img.status === 'success');
    
    if (successImages.length === 0) {
      toast({
        title: "No Images Available",
        description: "Please upload images first before creating a newspaper record",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingNewspaper(true);
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      // Check if newspaper already exists
      const exists = await newspaperService.newspaperExists(dateString);
      if (exists) {
        setNewspaperExists(true);
        toast({
          title: "Newspaper Already Exists",
          description: `A newspaper record already exists for ${format(selectedDate, "MMM dd, yyyy")}`,
          variant: "destructive",
        });
        return;
      }

      // Generate newspaper data structure from uploaded images
      // Convert UploadedImage to CloudinaryImage format for the service
      const cloudinaryImages = successImages.map(img => ({
        public_id: img.cloudinaryUrl?.split('/').pop() || img.id,
        secure_url: img.cloudinaryUrl || '',
        context: {
          page: img.pageNumber.toString(),
          date: format(img.date, 'yyyy-MM-dd')
        },
        tags: [],
        created_at: new Date().toISOString()
      }));
      
      const newspaperData = newspaperService.generateNewspaperData(cloudinaryImages, dateString);
      
      // Validate the data
      const validation = newspaperService.validateNewspaperData(newspaperData);
      if (!validation.isValid) {
        toast({
          title: "Validation Failed",
          description: `Please fix the following errors:\n${validation.errors.join('\n')}`,
          variant: "destructive",
        });
        return;
      }

      // Create newspaper record
      const result = await newspaperService.createNewspaper(dateString, newspaperData);
      
      toast({
        title: "Newspaper Created Successfully",
        description: `Newspaper record created for ${format(selectedDate, "MMM dd, yyyy")} with ${newspaperData.totalPages} pages`,
      });

      console.log('Newspaper created:', result);
      
    } catch (error) {
      console.error('Failed to create newspaper:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create newspaper record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingNewspaper(false);
    }
  };

  // Check if newspaper exists when date changes
  const checkNewspaperExists = async (date: Date) => {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const exists = await newspaperService.newspaperExists(dateString);
      setNewspaperExists(exists);
    } catch (error) {
      console.error('Error checking newspaper existence:', error);
      setNewspaperExists(false);
    }
  };

  const uploadImages = async () => {
    if (images.length === 0) return;

    setIsUploading(true);
    const pendingImages = images.filter(img => img.status === 'pending');

    for (const image of pendingImages) {
      try {
        // Update status to uploading
        setImages(prev => prev.map(img => 
          img.id === image.id 
            ? { ...img, status: 'uploading', progress: 0 }
            : img
        ));

        // Simulate progress
        const progressInterval = setInterval(() => {
          setImages(prev => prev.map(img => 
            img.id === image.id 
              ? { ...img, progress: Math.min(img.progress + 10, 90) }
              : img
          ));
        }, 200);

        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(image.file, image.date, image.pageNumber);
        
        clearInterval(progressInterval);

        // Store image locally for later retrieval
        storeUploadedImage(cloudinaryUrl, image.date, image.pageNumber);

        // Update status to success
        setImages(prev => prev.map(img => 
          img.id === image.id 
            ? { ...img, status: 'success', progress: 100, cloudinaryUrl }
            : img
        ));

        toast({
          title: "Upload Successful",
          description: `${image.file.name} uploaded successfully`,
        });

      } catch (error) {
        // Update status to error
        setImages(prev => prev.map(img => 
          img.id === image.id 
            ? { ...img, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : img
        ));

        toast({
          title: "Upload Failed",
          description: `Failed to upload ${image.file.name}`,
          variant: "destructive",
        });
      }
    }

    setIsUploading(false);
  };

  const getStatusIcon = (status: UploadedImage['status']) => {
    switch (status) {
      case 'pending':
        return <div className="h-4 w-4 text-gray-400">⏳</div>;
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: UploadedImage['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'uploading':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* User Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Upload and manage newspaper images</p>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4 bg-white rounded-lg shadow-sm border p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.email}</p>
                <p className="text-gray-500 text-xs">Administrator</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </div>

      {/* Date Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Newspaper Date</CardTitle>
          <CardDescription>
            Choose the date for your newspaper publication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal min-w-[200px]",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <div className="text-sm text-gray-600">
              Selected: <span className="font-medium">{format(selectedDate, "EEEE, MMMM dd, yyyy")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>
            Add images with their page numbers. Each image will be uploaded to Cloudinary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add New Image Row */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="flex-1">
                <Label htmlFor="new-image-file" className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Image
                </Label>
                <Input
                  ref={fileInputRef}
                  id="new-image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full"
                />
              </div>
              
              <div className="w-32">
                <Label htmlFor="new-page-number" className="text-sm font-medium text-gray-700 mb-2 block">
                  Page Number
                </Label>
                <Input
                  id="new-page-number"
                  type="number"
                  min="1"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                  className="w-full"
                />
              </div>
              
              <div className="w-32">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  &nbsp;
                </Label>
                <Button 
                  onClick={uploadImages}
                  disabled={isUploading || images.filter(img => img.status === 'pending').length === 0}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-pulse" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Uploaded Images List */}
            {images.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Uploaded Images</h3>
                {images.map((image) => (
                  <div key={image.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                    {/* Image Preview */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img
                        src={image.preview}
                        alt={image.file.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        onClick={() => removeImage(image.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Image Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {image.file.name}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(image.status)}`}>
                          {image.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Page:</span> {image.pageNumber}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span> {(image.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {format(image.date, "MMM dd, yyyy")}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {getStatusIcon(image.status)}
                        </div>
                      </div>

                      {image.status === 'uploading' && (
                        <Progress value={image.progress} className="h-2 mt-2" />
                      )}

                      {image.status === 'success' && image.cloudinaryUrl && (
                        <div className="text-xs text-green-600 break-all mt-2">
                          ✅ {image.cloudinaryUrl}
                        </div>
                      )}

                      {image.status === 'error' && image.error && (
                        <div className="text-xs text-red-600 mt-2">
                          ❌ Error: {image.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Pages to Newspaper CTA */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Newspaper Record</CardTitle>
          <CardDescription>
            Review and create newspaper record with all uploaded images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700">Date:</span>
                  <div className="text-blue-900">{format(selectedDate, "MMM dd, yyyy")}</div>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Total Images:</span>
                  <div className="text-blue-900">{images.length}</div>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Total Pages:</span>
                  <div className="text-blue-900">{Math.max(...images.map(img => img.pageNumber), 0)}</div>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Uploaded:</span>
                  <div className="text-blue-900">{images.filter(img => img.status === 'success').length}/{images.length}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button 
                onClick={createNewspaper}
                disabled={isCreatingNewspaper || images.filter(img => img.status === 'success').length === 0 || newspaperExists}
                className={`min-w-[200px] ${
                  newspaperExists 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isCreatingNewspaper ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Newspaper...
                  </>
                ) : newspaperExists ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Newspaper Already Created
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Add Pages to Newspaper
                  </>
                )}
              </Button>
              
              <Button 
                onClick={clearLocalStorage}
                variant="outline"
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                Clear All
              </Button>
            </div>

            {/* Debug Info (Console Only) */}
            {images.filter(img => img.status === 'success').length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Info (Check Console)</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const successImages = images.filter(img => img.status === 'success');
                    const newspaperData = {
                      date: format(selectedDate, 'yyyy-MM-dd'),
                      totalPages: Math.max(...successImages.map(img => img.pageNumber), 0),
                      totalImages: successImages.length,
                      pages: successImages.map(img => ({
                        pageNumber: img.pageNumber,
                        cloudinaryUrl: img.cloudinaryUrl,
                        fileName: img.file.name,
                        fileSize: img.file.size
                      }))
                    };
                    console.log('📰 Newspaper Data for API:', newspaperData);
                    toast({
                      title: "Data Logged to Console",
                      description: "Check browser console for newspaper data structure",
                    });
                  }}
                >
                  Log Newspaper Data to Console
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>



    </div>
  );
}
