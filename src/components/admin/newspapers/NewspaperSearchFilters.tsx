import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { NewspaperListParams } from '@/types/admin';

interface NewspaperSearchFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: NewspaperListParams['sort'];
  onSortChange: (value: NewspaperListParams['sort']) => void;
}

export function NewspaperSearchFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: NewspaperSearchFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder="Search by date (e.g. 2025-06-07)"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search newspapers by date"
        />
      </div>
      <Select
        value={sort}
        onValueChange={(v) => onSortChange(v as NewspaperListParams['sort'])}
      >
        <SelectTrigger className="w-full sm:w-[180px]" aria-label="Sort newspapers">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date_desc">Date (newest)</SelectItem>
          <SelectItem value="date_asc">Date (oldest)</SelectItem>
          <SelectItem value="created_desc">Created (newest)</SelectItem>
          <SelectItem value="created_asc">Created (oldest)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
