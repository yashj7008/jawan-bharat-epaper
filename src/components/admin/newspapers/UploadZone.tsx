import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  pageNumber: number;
  onPageNumberChange: (n: number) => void;
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
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );
      if (files.length > 0) onFilesDrop(files);
    },
    [onFilesDrop]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          'hover:border-primary/50 hover:bg-muted/50'
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
          onChange={onFileSelect}
          className="max-w-xs mx-auto cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-3">
        <Label htmlFor="page-number-input" className="text-sm whitespace-nowrap">
          Page number
        </Label>
        <Input
          id="page-number-input"
          type="number"
          min={1}
          value={pageNumber}
          onChange={(e) => onPageNumberChange(parseInt(e.target.value, 10) || 1)}
          className="w-24"
        />
        <p className="text-xs text-muted-foreground">
          Assigned to all files added in this batch
        </p>
      </div>
    </div>
  );
}
