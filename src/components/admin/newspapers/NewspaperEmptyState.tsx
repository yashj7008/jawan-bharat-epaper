import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Newspaper, Plus } from 'lucide-react';

export function NewspaperEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Newspaper className="h-8 w-8 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold mb-1">No newspapers yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Upload your first newspaper edition to get started. Select a date, upload
        page images, and publish.
      </p>
      <Button asChild>
        <Link to="/admin/newspapers/new">
          <Plus className="h-4 w-4 mr-2" aria-hidden />
          Create Newspaper
        </Link>
      </Button>
    </div>
  );
}
