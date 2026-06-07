import { useState, useEffect, useCallback } from 'react';
import { newspaperService } from '@/lib/newspaperService';
import { toNewspaperDetail } from '@/lib/admin/newspaperTransforms';
import type { NewspaperDetail } from '@/types/admin';

export function useNewspaperDetail(id: string | undefined) {
  const [newspaper, setNewspaper] = useState<NewspaperDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewspaper = useCallback(async () => {
    if (!id) {
      setError('No newspaper ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const record = await newspaperService.getNewspaperById(id);
      if (!record) {
        setError('Newspaper not found');
        setNewspaper(null);
      } else {
        setNewspaper(toNewspaperDetail(record));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load newspaper');
      setNewspaper(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNewspaper();
  }, [fetchNewspaper]);

  return { newspaper, loading, error, refetch: fetchNewspaper };
}
