import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CalendarIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useNewspaperUpload } from '@/hooks/admin/useNewspaperUpload';
import { StepWizard } from '@/components/admin/newspapers/StepWizard';
import { UploadZone } from '@/components/admin/newspapers/UploadZone';
import { PageGridCard } from '@/components/admin/newspapers/PageGridCard';
import { UploadSummaryPanel } from '@/components/admin/newspapers/UploadSummaryPanel';
import { PageThumbnail } from '@/components/admin/shared/PageThumbnail';
import type { CreateWizardStep } from '@/types/admin';

export function CreateNewspaperPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<CreateWizardStep>('date');
  const upload = useNewspaperUpload();

  useEffect(() => {
    if (step === 'date') {
      upload.checkNewspaperExists(upload.selectedDate);
    }
  }, [upload.selectedDate, upload.checkNewspaperExists, step]);

  // Page numbers used by more than one image. Failed uploads are ignored because
  // only successfully uploaded images are published.
  const duplicatePages = useMemo(() => {
    const filesByPage = new Map<number, string[]>();
    upload.images
      .filter((img) => img.status !== 'error')
      .forEach((img) => {
        filesByPage.set(img.pageNumber, [
          ...(filesByPage.get(img.pageNumber) ?? []),
          img.file.name,
        ]);
      });
    return Array.from(filesByPage.entries())
      .filter(([, files]) => files.length > 1)
      .map(([page, files]) => ({ page, files }))
      .sort((a, b) => a.page - b.page);
  }, [upload.images]);

  const hasDuplicatePages = duplicatePages.length > 0;

  const canProceedToUpload = !upload.newspaperExists;
  const canProceedToReview =
    upload.successCount > 0 &&
    upload.pendingCount === 0 &&
    !upload.isUploading &&
    !hasDuplicatePages;

  // Block "Upload all" while duplicates exist (the same page number would overwrite the earlier file)
  const handleUploadAll = () => {
    if (hasDuplicatePages) {
      toast({
        title: 'Duplicate Page Numbers',
        description: 'Remove the duplicate pages from the queue before uploading.',
        variant: 'destructive',
      });
      return;
    }
    upload.uploadImages();
  };

  const handlePublish = async () => {
    const id = await upload.publishNewspaper();
    if (id) {
      navigate(`/admin/newspapers/${id}`);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto w-full">
      <div className='flex justify-between'>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1 text-left">Create Newspaper</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Publish a new edition in three steps
          </p>
        </div>
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Newspapers
          </Link>
        </Button>
      </div>


      <StepWizard currentStep={step} />

      {step === 'date' && (
        <Card>
          <CardHeader>
            <CardTitle>Publication Date</CardTitle>
            <CardDescription>
              Choose the date for this newspaper edition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal min-w-[240px]',
                    !upload.selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {upload.selectedDate
                    ? format(upload.selectedDate, 'PPP')
                    : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={upload.selectedDate}
                  onSelect={(date) => date && upload.setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {upload.newspaperExists && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  A newspaper already exists for this date.{' '}
                  <Link to="/admin" className="underline font-medium">
                    View existing editions
                  </Link>{' '}
                  or choose a different date.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" asChild>
                <Link to="/admin">Cancel</Link>
              </Button>
              <Button
                onClick={() => setStep('upload')}
                disabled={!canProceedToUpload}
              >
                Next: Upload Pages
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'upload' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Pages</CardTitle>
                <CardDescription>
                  Add images with page numbers. Each file uploads to Cloudinary.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadZone
                  pageNumber={upload.pageNumber}
                  onPageNumberChange={upload.setPageNumber}
                  onFileSelect={upload.handleFileSelect}
                  onFilesDrop={upload.addFiles}
                  fileInputRef={upload.fileInputRef}
                />
              </CardContent>
            </Card>

            {upload.images.length > 0 && (
              <div className="space-y-3">
                {hasDuplicatePages && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium mb-1 text-left">
                        Duplicate page numbers found. Remove the extra images to continue.
                      </p>
                      <ul className="list-disc pl-5 space-y-0.5 text-left">
                        {duplicatePages.map(({ page, files }) => (
                          <li key={page}>
                            Page {page} is used by {files.length} images: {files.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <h3 className="text-sm font-medium">
                  Queued Pages ({upload.images.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {upload.images.map((img) => (
                    <PageGridCard
                      key={img.id}
                      image={img}
                      onRemove={upload.removeImage}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <UploadSummaryPanel
              selectedDate={upload.selectedDate}
              totalImages={upload.images.length}
              successCount={upload.successCount}
              pendingCount={upload.pendingCount}
              maxPageNumber={upload.maxPageNumber}
              isUploading={upload.isUploading}
              onUploadAll={handleUploadAll}
            />
          </div>

          <div className="lg:col-span-3 flex justify-between gap-3">
            <Button variant="outline" onClick={() => setStep('date')}>
              Back
            </Button>
            <Button
              onClick={() => setStep('review')}
              disabled={!canProceedToReview}
              title={hasDuplicatePages ? 'Remove duplicate page numbers to continue' : undefined}
            >
              Next: Review
            </Button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Publish</CardTitle>
            <CardDescription>
              Confirm details before publishing to the reader
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50 border text-sm">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{format(upload.selectedDate, 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Pages</p>
                <p className="font-medium">{upload.maxPageNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Images</p>
                <p className="font-medium">{upload.successCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Edition</p>
                <p className="font-medium capitalize">Morning</p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {upload.images
                .filter((img) => img.status === 'success')
                .sort((a, b) => a.pageNumber - b.pageNumber)
                .map((img) => (
                  <PageThumbnail
                    key={img.id}
                    imageUrl={img.preview}
                    pageNumber={img.pageNumber}
                  />
                ))}
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button
                onClick={handlePublish}
                disabled={upload.isPublishing}
                className="bg-green-600 hover:bg-green-700"
              >
                {upload.isPublishing ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish Newspaper
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}