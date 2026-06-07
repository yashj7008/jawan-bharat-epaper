import { cn } from '@/lib/utils';

interface PageThumbnailProps {
  imageUrl: string;
  pageNumber: number;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PageThumbnail({
  imageUrl,
  pageNumber,
  isActive = false,
  onClick,
  className,
}: PageThumbnailProps) {
  const content = (
    <>
      <div className="aspect-[3/4] overflow-hidden rounded-md bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Page ${pageNumber}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <span className="text-xs text-center mt-1 block text-muted-foreground">
        P{pageNumber}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'rounded-lg p-1.5 transition-colors text-left w-full',
          isActive ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-muted',
          className
        )}
        aria-label={`View page ${pageNumber}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {content}
      </button>
    );
  }

  return <div className={cn('p-1.5', className)}>{content}</div>;
}
