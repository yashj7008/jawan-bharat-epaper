import { useState, useEffect, useCallback } from 'react';
import { newspaperService } from '@/lib/newspaperService';
import { toListItem } from '@/lib/admin/newspaperTransforms';
import type { NewspaperListItem, NewspaperListParams } from '@/types/admin';

const DEFAULT_LIMIT = 10;

export function useNewspaperList() {
  const [items, setItems] = useState<NewspaperListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<NewspaperListParams['sort']>('date_desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await newspaperService.listNewspapers({
        search,
        sort,
        page,
        limit,
      });
      setItems(result.items.map(toListItem));
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load newspapers');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, sort, page, limit]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const removeItemOptimistic = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
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
    refetch: fetchList,
    removeItemOptimistic,
  };
}
