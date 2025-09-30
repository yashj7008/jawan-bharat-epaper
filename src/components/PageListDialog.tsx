import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";;
import { type NewspaperData } from "@/lib/newspaperApi";

interface PageListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalPages: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
  newspaperData: NewspaperData;
}

export function PageListDialog({
  open,
  onOpenChange,
  totalPages,
  currentPage,
  onPageSelect,
  newspaperData,
}: PageListDialogProps) {
  const handlePageClick = (page: number) => {
    onPageSelect(page);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw]">
        <DialogHeader>
          <DialogTitle className="headline">
            {newspaperData.title} - {newspaperData.edition}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {newspaperData.date} • {totalPages} Pages
          </p>
        </DialogHeader>

        <ScrollArea className="h-[70vh]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
            {newspaperData.pages.map((page) => (
              <div
                key={page.pageNumber}
                className="relative group cursor-pointer"
                onClick={() => handlePageClick(page.pageNumber)}
              >
                <div
                  className={`
                    aspect-[3/4] bg-paper border-2 rounded-lg overflow-hidden
                    paper-shadow hover:elevated-shadow transition-all duration-200
                    ${
                      page.pageNumber === currentPage
                        ? "border-accent ring-2 ring-accent/20 scale-105"
                        : "border-border hover:border-accent/50 hover:scale-105"
                    }
                  `}
                >
                  {/* Page Image */}
                  <div className="relative w-full h-full group">
                    <img
                      src={page.imageUrl}
                      alt={`Page ${page.pageNumber} - ${page.title}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        // Fallback to placeholder when image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallback = target.parentElement?.querySelector(
                          ".image-fallback"
                        ) as HTMLElement;
                        if (fallback) {
                          fallback.style.display = "flex";
                        }
                      }}
                    />

                    {/* Fallback placeholder when image fails to load */}
                    <div className="image-fallback hidden absolute inset-0 bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center p-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                          <span className="text-2xl font-bold text-primary">
                            {page.pageNumber}
                          </span>
                        </div>
                        <h3 className="text-xs font-semibold text-foreground leading-tight mb-1">
                          {page.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {page.section.replace("-", " ")}
                        </p>
                      </div>
                    </div>

                    {/* Page number overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                      <div className="text-center">
                        <Badge
                          variant={
                            page.pageNumber === currentPage
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs font-bold"
                        >
                          Page {page.pageNumber}
                        </Badge>
                      </div>
                    </div>

                    {/* Section indicator overlay at top */}
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0.5 bg-white/90 text-foreground border-white/50 backdrop-blur-sm"
                      >
                        {page.section.replace("-", " ")}
                      </Badge>
                    </div>

                    {/* Hover title overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="text-center text-white p-2">
                        <h3 className="text-sm font-semibold leading-tight">
                          {page.title}
                        </h3>
                        <p className="text-xs text-gray-200 mt-1">
                          {page.section.replace("-", " ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current page indicator */}
                {page.pageNumber === currentPage && (
                  <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded-full font-medium">
                    Current
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Page summary */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Total Pages: {totalPages}</span>
            <span>Current: {currentPage}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}