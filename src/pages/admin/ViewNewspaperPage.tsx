import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { newspaperService } from '@/lib/newspaperService';
import { useNewspaperDetail } from '@/hooks/admin/useNewspaperDetail';
import { formatAdminDate, formatAdminDateTime } from '@/lib/admin/newspaperTransforms';
import { PageThumbnail } from '@/components/admin/shared/PageThumbnail';
import { ViewPageToolbar } from '@/components/admin/newspapers/ViewPageToolbar';
import { ViewFullscreenDialog } from '@/components/admin/newspapers/ViewFullscreenDialog';
import { ConfirmDeleteDialog } from '@/components/admin/newspapers/ConfirmDeleteDialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ViewNewspaperPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { newspaper, loading, error } = useNewspaperDetail(id);

  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const activePage = newspaper?.pages.find((p) => p.pageNumber === currentPage);

  const handleDownload = async () => {
    if (!activePage?.imageUrl) return;

    setIsDownloading(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = activePage.imageUrl;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const scale = zoom / 100;
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `newspaper-${newspaper?.dateOfPaper}-page-${currentPage}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Download started' });
      }, 'image/png');
    } catch {
      toast({
        title: 'Download failed',
        description: 'Could not download this page',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !newspaper) return;
    setIsDeleting(true);
    try {
      await newspaperService.deleteNewspaper(id);
      toast({
        title: 'Newspaper Deleted',
        description: `Removed edition for ${formatAdminDate(newspaper.dateOfPaper)}`,
      });
      navigate('/admin');
    } catch (err) {
      toast({
        title: 'Delete Failed',
        description: err instanceof Error ? err.message : 'Could not delete',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !newspaper) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center py-16">
        <h2 className="text-lg font-semibold mb-2">Newspaper not found</h2>
        <p className="text-muted-foreground text-sm mb-4">{error}</p>
        <Button asChild>
          <Link to="/admin">Back to Newspapers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Back">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              {formatAdminDate(newspaper.dateOfPaper)}
            </h1>
            <p className="text-sm text-muted-foreground capitalize">
              {newspaper.edition} edition · {newspaper.totalPages} pages
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href={`/?date=${newspaper.dateOfPaper}&page=${currentPage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Reader
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/newspapers/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <aside className="lg:w-36 shrink-0">
          <ScrollArea className="h-[120px] lg:h-[calc(100vh-220px)]">
            <div className="flex lg:flex-col gap-2 pb-2">
              {newspaper.pages.map((page) => (
                <PageThumbnail
                  key={page.pageNumber}
                  imageUrl={page.imageUrl}
                  pageNumber={page.pageNumber}
                  isActive={page.pageNumber === currentPage}
                  onClick={() => setCurrentPage(page.pageNumber)}
                  className="w-20 lg:w-full shrink-0"
                />
              ))}
            </div>
          </ScrollArea>
        </aside>

        <div className="flex-1 min-w-0 space-y-4">
          <ViewPageToolbar
            currentPage={currentPage}
            totalPages={newspaper.totalPages}
            zoom={zoom}
            onPageChange={setCurrentPage}
            onZoomChange={setZoom}
            onDownload={handleDownload}
            onFullscreen={() => setFullscreenOpen(true)}
            isDownloading={isDownloading}
          />

          <div className="rounded-lg border bg-card overflow-auto p-4 md:p-6 flex justify-center min-h-[50vh]">
            {activePage?.imageUrl ? (
              <img
                src={activePage.imageUrl}
                alt={`Page ${currentPage}`}
                className="max-w-full h-auto shadow-md transition-transform origin-top"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            ) : (
              <p className="text-muted-foreground">No image for this page</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Created {formatAdminDateTime(newspaper.createdAt)}
            {newspaper.updatedAt && ` · Updated ${formatAdminDateTime(newspaper.updatedAt)}`}
          </p>
        </div>
      </div>

      {activePage && (
        <ViewFullscreenDialog
          open={fullscreenOpen}
          onOpenChange={setFullscreenOpen}
          imageUrl={activePage.imageUrl}
          pageNumber={currentPage}
          totalPages={newspaper.totalPages}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete newspaper?"
        description={`Permanently delete the ${formatAdminDate(newspaper.dateOfPaper)} edition?`}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
