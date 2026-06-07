import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadToCloudinary, storeUploadedImage } from '@/lib/cloudinary';
import { newspaperService } from '@/lib/newspaperService';
import type { NewspaperData } from '@/lib/newspaperService';
import { useNewspaperDetail } from '@/hooks/admin/useNewspaperDetail';
import { formatAdminDate } from '@/lib/admin/newspaperTransforms';
import { ExistingPageRow } from '@/components/admin/newspapers/ExistingPageRow';
import { ConfirmDeleteDialog } from '@/components/admin/newspapers/ConfirmDeleteDialog';

export function EditNewspaperPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { newspaper, loading, error } = useNewspaperDetail(id);

  const [pagesData, setPagesData] = useState<NewspaperData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [replacingPage, setReplacingPage] = useState<number | null>(null);
  const [removePageTarget, setRemovePageTarget] = useState<number | null>(null);
  const [newPageNumber, setNewPageNumber] = useState(1);
  const [isAddingPage, setIsAddingPage] = useState(false);

  const replaceInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const replacePageRef = useRef<number | null>(null);

  useEffect(() => {
    if (newspaper) {
      setPagesData(structuredClone(newspaper.rawPages));
      setNewPageNumber(newspaper.totalPages + 1);
    }
  }, [newspaper]);

  const handleReplaceClick = (pageNumber: number) => {
    replacePageRef.current = pageNumber;
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const pageNum = replacePageRef.current;
    if (!file || !pageNum || !newspaper || !pagesData) return;

    setReplacingPage(pageNum);
    try {
      const date = new Date(newspaper.dateOfPaper);
      const url = await uploadToCloudinary(file, date, pageNum);
      storeUploadedImage(url, date, pageNum);

      const pageKey = pageNum.toString();
      const updated = structuredClone(pagesData);
      if (updated.pages[pageKey]) {
        updated.pages[pageKey].images = [
          {
            public_id: url.split('/').pop() || `page_${pageNum}`,
            secure_url: url,
            context: { page: pageKey, date: newspaper.dateOfPaper },
            tags: [],
            created_at: new Date().toISOString(),
          },
        ];
      }
      setPagesData(updated);
      setIsDirty(true);
      toast({ title: 'Page replaced', description: `Page ${pageNum} updated` });
    } catch {
      toast({
        title: 'Replace failed',
        description: 'Could not upload replacement image',
        variant: 'destructive',
      });
    } finally {
      setReplacingPage(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleRemovePage = () => {
    if (removePageTarget === null || !pagesData) return;

    const updated = structuredClone(pagesData);
    delete updated.pages[removePageTarget.toString()];

    const pageNumbers = Object.keys(updated.pages).map(Number);
    updated.totalPages = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 0;

    setPagesData(updated);
    setIsDirty(true);
    setRemovePageTarget(null);
    toast({ title: 'Page removed', description: `Page ${removePageTarget} removed from edition` });
  };

  const handleAddPage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newspaper || !pagesData) return;

    setIsAddingPage(true);
    try {
      const date = new Date(newspaper.dateOfPaper);
      const url = await uploadToCloudinary(file, date, newPageNumber);
      storeUploadedImage(url, date, newPageNumber);

      const updated = structuredClone(pagesData);
      const pageKey = newPageNumber.toString();
      updated.pages[pageKey] = {
        title: `Page ${newPageNumber}`,
        images: [
          {
            public_id: url.split('/').pop() || `page_${newPageNumber}`,
            secure_url: url,
            context: { page: pageKey, date: newspaper.dateOfPaper },
            tags: [],
            created_at: new Date().toISOString(),
          },
        ],
      };
      updated.totalPages = Math.max(updated.totalPages, newPageNumber);
      setPagesData(updated);
      setIsDirty(true);
      setNewPageNumber(newPageNumber + 1);
      toast({ title: 'Page added', description: `Page ${newPageNumber} added` });
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Could not add new page',
        variant: 'destructive',
      });
    } finally {
      setIsAddingPage(false);
      if (addInputRef.current) addInputRef.current.value = '';
    }
  };

  const handleSave = useCallback(async () => {
    if (!id || !pagesData) return;

    const validation = newspaperService.validateNewspaperData(pagesData);
    if (!validation.isValid) {
      toast({
        title: 'Validation failed',
        description: validation.errors.join('. '),
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await newspaperService.updateNewspaper(id, pagesData);
      setIsDirty(false);
      toast({
        title: 'Changes saved',
        description: `Updated ${formatAdminDate(newspaper!.dateOfPaper)} edition`,
      });
      navigate(`/admin/newspapers/${id}`);
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Could not save changes',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [id, pagesData, newspaper, navigate]);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !newspaper || !pagesData) {
    return (
      <div className="p-6 text-center py-16">
        <p className="text-muted-foreground mb-4">{error ?? 'Newspaper not found'}</p>
        <Button asChild>
          <Link to="/admin">Back to Newspapers</Link>
        </Button>
      </div>
    );
  }

  const sortedPages = Object.entries(pagesData.pages)
    .map(([num, data]) => ({
      pageNumber: parseInt(num, 10),
      title: data.title,
      imageUrl: data.images[0]?.secure_url ?? '',
    }))
    .filter((p) => !isNaN(p.pageNumber))
    .sort((a, b) => a.pageNumber - b.pageNumber);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto w-full">
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceFile}
        aria-hidden
      />
      <input
        ref={addInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAddPage}
        aria-hidden
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/admin/newspapers/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              Edit {formatAdminDate(newspaper.dateOfPaper)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {sortedPages.length} pages · Morning edition
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!isDirty || isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {isDirty && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          You have unsaved changes
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Existing Pages</CardTitle>
            <CardDescription>Replace or remove individual pages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
            {sortedPages.map((page) => (
              <ExistingPageRow
                key={page.pageNumber}
                pageNumber={page.pageNumber}
                title={page.title}
                imageUrl={page.imageUrl}
                onReplace={() => handleReplaceClick(page.pageNumber)}
                onRemove={() => setRemovePageTarget(page.pageNumber)}
                isReplacing={replacingPage === page.pageNumber}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Page</CardTitle>
            <CardDescription>Upload an additional page image</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="new-page-num">Page number</Label>
              <Input
                id="new-page-num"
                type="number"
                min={1}
                value={newPageNumber}
                onChange={(e) => setNewPageNumber(parseInt(e.target.value, 10) || 1)}
                className="w-24"
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => addInputRef.current?.click()}
              disabled={isAddingPage}
            >
              <Upload className={`h-4 w-4 mr-2 ${isAddingPage ? 'animate-pulse' : ''}`} />
              {isAddingPage ? 'Uploading...' : 'Choose Image & Upload'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteDialog
        open={removePageTarget !== null}
        onOpenChange={(open) => !open && setRemovePageTarget(null)}
        title="Remove page?"
        description={
          removePageTarget !== null
            ? `Remove page ${removePageTarget} from this edition? Save changes to persist.`
            : ''
        }
        onConfirm={handleRemovePage}
      />
    </div>
  );
}
