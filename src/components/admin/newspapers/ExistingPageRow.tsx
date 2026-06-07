import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';

interface ExistingPageRowProps {
  pageNumber: number;
  title: string;
  imageUrl: string;
  onReplace: () => void;
  onRemove: () => void;
  isReplacing?: boolean;
}

export function ExistingPageRow({
  pageNumber,
  title,
  imageUrl,
  onReplace,
  onRemove,
  isReplacing = false,
}: ExistingPageRowProps) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
      <div className="w-16 h-20 rounded-md overflow-hidden bg-muted shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            —
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Page {pageNumber}</p>
        <p className="text-xs text-muted-foreground truncate">{title}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onReplace}
          disabled={isReplacing}
          aria-label={`Replace page ${pageNumber}`}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isReplacing ? 'animate-spin' : ''}`} />
          Replace
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={onRemove}
          aria-label={`Remove page ${pageNumber}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
