import { useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { uploadToCloudinary, storeUploadedImage } from '@/lib/cloudinary';
import { newspaperService } from '@/lib/newspaperService';
import type { UploadedImage } from '@/types/admin';

function createUploadedImage(file: File, date: Date, pageNumber: number): UploadedImage {
  return {
    id: Math.random().toString(36).slice(2, 11),
    file,
    preview: URL.createObjectURL(file),
    status: 'pending',
    progress: 0,
    date,
    pageNumber,
  };
}

export function useNewspaperUpload(initialDate: Date = new Date()) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [pageNumber, setPageNumber] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newspaperExists, setNewspaperExists] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkNewspaperExists = useCallback(async (date: Date) => {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const exists = await newspaperService.newspaperExists(dateString);
      setNewspaperExists(exists);
      return exists;
    } catch {
      setNewspaperExists(false);
      return false;
    }
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      const newImages = files.map((file) =>
        createUploadedImage(file, selectedDate, pageNumber)
      );
      setImages((prev) => [...prev, ...newImages]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [selectedDate, pageNumber]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length > 0) addFiles(files);
    },
    [addFiles]
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) URL.revokeObjectURL(image.preview);
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const uploadImages = useCallback(async () => {
    const pendingImages = images.filter((img) => img.status === 'pending');
    if (pendingImages.length === 0) return;

    setIsUploading(true);

    for (const image of pendingImages) {
      try {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id ? { ...img, status: 'uploading', progress: 0 } : img
          )
        );

        const progressInterval = setInterval(() => {
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? { ...img, progress: Math.min(img.progress + 10, 90) }
                : img
            )
          );
        }, 200);

        const cloudinaryUrl = await uploadToCloudinary(
          image.file,
          image.date,
          image.pageNumber
        );

        clearInterval(progressInterval);
        storeUploadedImage(cloudinaryUrl, image.date, image.pageNumber);

        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? { ...img, status: 'success', progress: 100, cloudinaryUrl }
              : img
          )
        );
      } catch (error) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : img
          )
        );

        toast({
          title: 'Upload Failed',
          description: `Failed to upload ${image.file.name}`,
          variant: 'destructive',
        });
      }
    }

    setIsUploading(false);
  }, [images]);

  const publishNewspaper = useCallback(async (): Promise<string | null> => {
    const successImages = images.filter((img) => img.status === 'success');

    if (successImages.length === 0) {
      toast({
        title: 'No Images Available',
        description: 'Please upload images before publishing',
        variant: 'destructive',
      });
      return null;
    }

    setIsPublishing(true);

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const exists = await newspaperService.newspaperExists(dateString);

      if (exists) {
        setNewspaperExists(true);
        toast({
          title: 'Newspaper Already Exists',
          description: `A newspaper already exists for ${format(selectedDate, 'MMM dd, yyyy')}`,
          variant: 'destructive',
        });
        return null;
      }

      const cloudinaryImages = successImages.map((img) => ({
        public_id: img.cloudinaryUrl?.split('/').pop() || img.id,
        secure_url: img.cloudinaryUrl || '',
        context: {
          page: img.pageNumber.toString(),
          date: format(img.date, 'yyyy-MM-dd'),
        },
        tags: [],
        created_at: new Date().toISOString(),
      }));

      const newspaperData = newspaperService.generateNewspaperData(
        cloudinaryImages,
        dateString
      );

      const validation = newspaperService.validateNewspaperData(newspaperData);
      if (!validation.isValid) {
        toast({
          title: 'Validation Failed',
          description: validation.errors.join('. '),
          variant: 'destructive',
        });
        return null;
      }

      const result = await newspaperService.createNewspaper(dateString, newspaperData);

      toast({
        title: 'Newspaper Published',
        description: `Created edition for ${format(selectedDate, 'MMM dd, yyyy')} with ${newspaperData.totalPages} pages`,
      });

      return result.id;
    } catch (error) {
      console.error('Failed to create newspaper:', error);
      toast({
        title: 'Creation Failed',
        description: 'Failed to create newspaper record. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsPublishing(false);
    }
  }, [images, selectedDate]);

  const reset = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setPageNumber(1);
    setNewspaperExists(false);
  }, [images]);

  const successCount = images.filter((img) => img.status === 'success').length;
  const pendingCount = images.filter((img) => img.status === 'pending').length;
  const maxPageNumber = images.length > 0 ? Math.max(...images.map((i) => i.pageNumber)) : 0;

  return {
    images,
    selectedDate,
    setSelectedDate,
    pageNumber,
    setPageNumber,
    isUploading,
    isPublishing,
    newspaperExists,
    fileInputRef,
    checkNewspaperExists,
    handleFileSelect,
    addFiles,
    removeImage,
    uploadImages,
    publishNewspaper,
    reset,
    successCount,
    pendingCount,
    maxPageNumber,
  };
}
