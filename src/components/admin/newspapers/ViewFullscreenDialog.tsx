import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ViewFullscreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  pageNumber: number;
  totalPages: number;
}

export function ViewFullscreenDialog({
  open,
  onOpenChange,
  imageUrl,
  pageNumber,
  totalPages,
}: ViewFullscreenDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b shrink-0 flex-row items-center justify-between">
          <DialogTitle className="text-base">
            Page {pageNumber} of {totalPages}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close fullscreen"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4 flex items-start justify-center bg-muted/30">
          <img
            src={imageUrl}
            alt={`Page ${pageNumber}`}
            className="max-w-full h-auto shadow-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
