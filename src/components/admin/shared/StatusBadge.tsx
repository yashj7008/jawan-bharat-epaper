import { Badge } from '@/components/ui/badge';
import type { UploadStatus } from '@/types/admin';

const STATUS_CONFIG: Record<UploadStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  uploading: { label: 'Uploading', className: 'bg-blue-100 text-blue-800' },
  success: { label: 'Uploaded', className: 'bg-green-100 text-green-800' },
  error: { label: 'Failed', className: 'bg-red-100 text-red-800' },
};

interface StatusBadgeProps {
  status: UploadStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
