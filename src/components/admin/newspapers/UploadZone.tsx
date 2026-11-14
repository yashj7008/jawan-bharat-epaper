import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  /** null = admin has not entered a page number yet (uploads stay disabled) */
  pageNumber: number | null;
  onPageNumberChange: (n: number | null) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilesDrop: (files: File[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function UploadZone({
  pageNumber,
  onPageNumberChange,
  onFileSelect,
  onFilesDrop,
  fileInputRef,
}: UploadZoneProps) {
  // Upload is only allowed once a valid page number (>= 1) has been entered
  const canUpload = pageNumber !== null && Number.isInteger(pageNumber) && pageNumber >= 1;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      // Always prevent default so the browser doesn't open the dropped image
      e.preventDefault();
      if (!canUpload) return;
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );
      if (files.length > 0) onFilesDrop(files);
    },
    [onFilesDrop, canUpload]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = canUpload ? 'copy' : 'none';
    },
    [canUpload]
  );

  const handlePageNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    if (raw === '') {
      onPageNumberChange(null); // empty again -> uploads disabled
      return;
    }
    const n = parseInt(raw, 10);
    onPageNumberChange(Number.isNaN(n) || n < 1 ? null : n);
  };

  return (
    <div className="space-y-4">
      {/* 1. Page number first – must be entered before anything can be uploaded */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Label htmlFor="page-number-input" className="text-sm whitespace-nowrap">
            Page number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="page-number-input"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="e.g. 1"
            required
            aria-required="true"
            value={pageNumber ?? ''}
            onChange={handlePageNumberChange}
            className="w-24"
          />
          <p className="text-xs text-muted-foreground">
            Assigned to all files added in this batch
          </p>
        </div>
        {!canUpload && (
          <p className="text-xs text-destructive" role="status">
            Enter the page number first to enable upload.
          </p>
        )}
      </div>

      {/* 2. Upload zone – disabled until a valid page number is entered */}
      <div
        aria-disabled={!canUpload}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          canUpload
            ? 'hover:border-primary/50 hover:bg-muted/50'
            : 'opacity-50 cursor-not-allowed bg-muted/30'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" aria-hidden />
        <p className="text-sm font-medium mb-1">Drag & drop page images</p>
        <p className="text-xs text-muted-foreground mb-4">JPG, PNG, GIF, WebP</p>
        <Label htmlFor="admin-upload-input" className="sr-only">
          Choose image files
        </Label>
        <Input
          ref={fileInputRef}
          id="admin-upload-input"
          type="file"
          accept="image/*"
          multiple
          disabled={!canUpload}
          onChange={onFileSelect}
          className={cn('max-w-xs mx-auto', canUpload ? 'cursor-pointer' : 'cursor-not-allowed')}
        />
      </div>
    </div>
  );
}