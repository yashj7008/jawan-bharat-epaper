import type { NewspaperData } from '@/lib/newspaperService';

export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: UploadStatus;
  progress: number;
  cloudinaryUrl?: string;
  error?: string;
  date: Date;
  pageNumber: number;
}

export interface NewspaperListItem {
  id: string;
  dateOfPaper: string;
  totalPages: number;
  edition: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface NewspaperListParams {
  search?: string;
  sort?: 'date_desc' | 'date_asc' | 'created_desc' | 'created_asc';
  page?: number;
  limit?: number;
}

export interface NewspaperListResult {
  items: NewspaperListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NewspaperPagePreview {
  pageNumber: number;
  title: string;
  imageUrl: string;
}

export interface NewspaperDetail {
  id: string;
  dateOfPaper: string;
  totalPages: number;
  edition: string;
  language: string;
  publicationStatus: string;
  createdAt: string;
  updatedAt: string | null;
  pages: NewspaperPagePreview[];
  rawPages: NewspaperData;
}

export type CreateWizardStep = 'date' | 'upload' | 'review';
