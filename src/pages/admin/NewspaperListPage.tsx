import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { newspaperService } from '@/lib/newspaperService';
import { useNewspaperList } from '@/hooks/admin/useNewspaperList';
import { NewspaperSearchFilters } from '@/components/admin/newspapers/NewspaperSearchFilters';
import { NewspaperTable } from '@/components/admin/newspapers/NewspaperTable';
import { NewspaperPagination } from '@/components/admin/newspapers/NewspaperPagination';
import { NewspaperEmptyState } from '@/components/admin/newspapers/NewspaperEmptyState';
import { NewspaperListSkeleton } from '@/components/admin/newspapers/NewspaperListSkeleton';
import { ConfirmDeleteDialog } from '@/components/admin/newspapers/ConfirmDeleteDialog';
import { formatAdminDate } from '@/lib/admin/newspaperTransforms';
import type { NewspaperListItem } from '@/types/admin';

export function NewspaperListPage() {
  const {
    items,
    total,
    page,
    setPage,
    limit,
    search,
    setSearch,
    sort,
    setSort,
    loading,
    error,
    totalPages,
    removeItemOptimistic,
  } = useNewspaperList();

  const [searchInput, setSearchInput] = useState(search);
  const [deleteTarget, setDeleteTarget] = useState<NewspaperListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearch, setPage]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await newspaperService.deleteNewspaper(deleteTarget.id);
      removeItemOptimistic(deleteTarget.id);
      toast({
        title: 'Newspaper Deleted',
        description: `Removed edition for ${formatAdminDate(deleteTarget.dateOfPaper)}`,
      });
      setDeleteTarget(null);
    } catch (err) {
      toast({
        title: 'Delete Failed',
        description: err instanceof Error ? err.message : 'Could not delete newspaper',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Newspapers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all published editions
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/newspapers/new">
            <Plus className="h-4 w-4 mr-2" aria-hidden />
            Create Newspaper
          </Link>
        </Button>
      </div>

      <div className="mb-4">
        <NewspaperSearchFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          sort={sort}
          onSortChange={(v) => {
            setSort(v);
            setPage(1);
          }}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <NewspaperListSkeleton />
      ) : items.length === 0 && !search ? (
        <NewspaperEmptyState />
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No newspapers match your search.
        </div>
      ) : (
        <>
          <NewspaperTable items={items} onDelete={setDeleteTarget} />
          <NewspaperPagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete newspaper?"
        description={
          deleteTarget
            ? `This will permanently delete the ${formatAdminDate(deleteTarget.dateOfPaper)} edition (${deleteTarget.totalPages} pages) from the database. This action cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
