import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  ZoomIn,
} from 'lucide-react';

interface ViewPageToolbarProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onDownload: () => void;
  onFullscreen: () => void;
  isDownloading?: boolean;
}

export function ViewPageToolbar({
  currentPage,
  totalPages,
  zoom,
  onPageChange,
  onZoomChange,
  onDownload,
  onFullscreen,
  isDownloading = false,
}: ViewPageToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[100px] text-center">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
        <Slider
          value={[zoom]}
          onValueChange={(v) => onZoomChange(v[0])}
          min={50}
          max={200}
          step={10}
          className="w-24"
          aria-label="Zoom level"
        />
        <span className="text-xs text-muted-foreground w-10">{zoom}%</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={isDownloading}
          aria-label="Download current page"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onFullscreen}
          aria-label="Full screen preview"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
