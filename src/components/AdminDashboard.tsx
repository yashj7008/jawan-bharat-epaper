import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, Calendar as CalendarIcon, User, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadToCloudinary, fetchNewspaperPages, CloudinaryImage, storeUploadedImage } from '@/lib/cloudinary';
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
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedImages, setFetchedImages] = useState<CloudinaryImage[]>([]);
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

  const fetchImages = async () => {
    setIsFetching(true);
    try {
      const images = await fetchNewspaperPages(selectedDate, pageNumber);
      setFetchedImages(images);
      
      if (images.length > 0) {
        toast({
          title: "Fetch Successful",
          description: `Found ${images.length} image(s) for ${format(selectedDate, "MMM dd, yyyy")} - Page ${pageNumber}`,
        });
      } else {
        toast({
          title: "No Images Found",
          description: `No images found for ${format(selectedDate, "MMM dd, yyyy")} - Page ${pageNumber}`,
        });
      }
    } catch (error) {
      toast({
        title: "Fetch Failed",
        description: "Failed to fetch images from Cloudinary",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('cloudinary_images');
    setFetchedImages([]);
    toast({
      title: "Storage Cleared",
      description: "All locally stored images have been cleared",
    });
  };

  // Create newspaper record in database
  const createNewspaper = async () => {
    if (fetchedImages.length === 0) {
      toast({
        title: "No Images Available",
        description: "Please fetch images first before creating a newspaper record",
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

      // Generate newspaper data structure
      const newspaperData = newspaperService.generateNewspaperData(fetchedImages, dateString);
      
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
        return <ImageIcon className="h-4 w-4 text-gray-400" />;
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

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>
            Select multiple images to upload to Cloudinary. Supported formats: JPG, PNG, GIF, WebP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Date and Page Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newspaper-date">Newspaper Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="page-number">Page Number</Label>
                <Input
                  id="page-number"
                  type="number"
                  min="1"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Button 
                onClick={uploadImages}
                disabled={isUploading || images.filter(img => img.status === 'pending').length === 0}
                className="min-w-[120px]"
              >
                {isUploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload All
                  </>
                )}
              </Button>
              
              <Button 
                onClick={fetchImages}
                disabled={isFetching}
                variant="outline"
                className="min-w-[120px]"
              >
                {isFetching ? (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2 animate-pulse" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Fetch Images
                  </>
                )}
              </Button>
              
              <Button 
                onClick={createNewspaper}
                disabled={isCreatingNewspaper || fetchedImages.length === 0 || newspaperExists}
                className={`min-w-[140px] ${
                  newspaperExists 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isCreatingNewspaper ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : newspaperExists ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Already Created
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Newspaper
                  </>
                )}
              </Button>
              
              <Button 
                onClick={clearLocalStorage}
                variant="outline"
                className="min-w-[120px] text-red-600 hover:text-red-700"
              >
                Clear Storage
              </Button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                  <Card key={image.id} className="relative">
                    <CardContent className="p-4">
                      <div className="relative">
                        <img
                          src={image.preview}
                          alt={image.file.name}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {image.file.name}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(image.status)}`}>
                            {image.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusIcon(image.status)}
                          <span className="text-xs text-gray-500">
                            {(image.file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>

                        {/* Date and Page Info */}
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>📅 {format(image.date, "MMM dd, yyyy")}</div>
                          <div>📄 Page {image.pageNumber}</div>
                        </div>

                        {image.status === 'uploading' && (
                          <Progress value={image.progress} className="h-2" />
                        )}

                        {image.status === 'success' && image.cloudinaryUrl && (
                          <div className="text-xs text-green-600 break-all">
                            {image.cloudinaryUrl}
                          </div>
                        )}

                        {image.status === 'error' && image.error && (
                          <div className="text-xs text-red-600">
                            Error: {image.error}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fetched Images Section */}
      {fetchedImages.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fetched Images</CardTitle>
            <CardDescription>
              Images retrieved from Cloudinary for {format(selectedDate, "MMM dd, yyyy")} - Page {pageNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fetchedImages.map((image, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-4">
                    <div className="relative">
                      <img
                        src={image.secure_url}
                        alt={`Page ${image.context.page}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>📅 {image.context.date}</div>
                        <div>📄 Page {image.context.page}</div>
                        <div>🆔 {image.public_id}</div>
                      </div>
                      
                      <div className="text-xs text-blue-600 break-all">
                        {image.secure_url}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
