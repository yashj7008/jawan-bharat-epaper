import type { NewspaperRecord, NewspaperData } from '@/lib/newspaperService';
import type { NewspaperDetail, NewspaperListItem, NewspaperPagePreview } from '@/types/admin';

export function toListItem(record: NewspaperRecord): NewspaperListItem {
  return {
    id: record.id,
    dateOfPaper: record.date_of_paper,
    totalPages: record.pages?.totalPages ?? 0,
    edition: record.pages?.metadata?.edition ?? 'morning',
    createdAt: record.created_at,
    updatedAt: record.updated_at ?? null,
  };
}

export function toPagePreviews(pages: NewspaperData): NewspaperPagePreview[] {
  return Object.entries(pages.pages)
    .map(([pageNum, pageData]) => ({
      pageNumber: parseInt(pageNum, 10),
      title: pageData.title,
      imageUrl: pageData.images[0]?.secure_url ?? '',
    }))
    .filter((p) => !isNaN(p.pageNumber))
    .sort((a, b) => a.pageNumber - b.pageNumber);
}

export function toNewspaperDetail(record: NewspaperRecord): NewspaperDetail {
  return {
    id: record.id,
    dateOfPaper: record.date_of_paper,
    totalPages: record.pages?.totalPages ?? 0,
    edition: record.pages?.metadata?.edition ?? 'morning',
    language: record.pages?.metadata?.language ?? 'en',
    publicationStatus: record.pages?.metadata?.publicationStatus ?? 'published',
    createdAt: record.created_at,
    updatedAt: record.updated_at ?? null,
    pages: toPagePreviews(record.pages),
    rawPages: record.pages,
  };
}

export function formatAdminDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatAdminDateTime(dateString: string | null): string {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
