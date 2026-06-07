import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';

interface UploadSummaryPanelProps {
  selectedDate: Date;
  totalImages: number;
  successCount: number;
  pendingCount: number;
  maxPageNumber: number;
  isUploading: boolean;
  onUploadAll: () => void;
}

export function UploadSummaryPanel({
  selectedDate,
  totalImages,
  successCount,
  pendingCount,
  maxPageNumber,
  isUploading,
  onUploadAll,
}: UploadSummaryPanelProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Session Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{format(selectedDate, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pages queued</span>
            <span className="font-medium">{totalImages}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Uploaded</span>
            <span className="font-medium">
              {successCount}/{totalImages}
            </span>
          </div>
          {maxPageNumber > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max page #</span>
              <span className="font-medium">{maxPageNumber}</span>
            </div>
          )}
        </div>
        <Button
          className="w-full"
          onClick={onUploadAll}
          disabled={isUploading || pendingCount === 0}
        >
          <Upload className={`h-4 w-4 mr-2 ${isUploading ? 'animate-pulse' : ''}`} />
          {isUploading ? 'Uploading...' : `Upload All (${pendingCount})`}
        </Button>
      </CardContent>
    </Card>
  );
}
