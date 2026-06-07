import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { format } from 'date-fns';
import type { UploadedImage } from '@/types/admin';

interface PageGridCardProps {
  image: UploadedImage;
  onRemove: (id: string) => void;
}

export function PageGridCard({ image, onRemove }: PageGridCardProps) {
  return (
    <div className="relative rounded-lg border bg-card overflow-hidden group">
      <div className="aspect-[3/4] bg-muted">
        <img
          src={image.preview}
          alt={image.file.name}
          className="w-full h-full object-cover"
        />
      </div>
      <Button
        size="icon"
        variant="destructive"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(image.id)}
        aria-label={`Remove page ${image.pageNumber}`}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Page {image.pageNumber}</span>
          <StatusBadge status={image.status} />
        </div>
        <p className="text-xs text-muted-foreground truncate">{image.file.name}</p>
        <p className="text-xs text-muted-foreground">
          {format(image.date, 'MMM dd, yyyy')} · {(image.file.size / 1024 / 1024).toFixed(1)} MB
        </p>
        {image.status === 'uploading' && (
          <Progress value={image.progress} className="h-1.5" />
        )}
        {image.status === 'error' && image.error && (
          <p className="text-xs text-destructive">{image.error}</p>
        )}
      </div>
    </div>
  );
}
