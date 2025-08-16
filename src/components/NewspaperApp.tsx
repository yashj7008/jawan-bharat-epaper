import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Header } from "./Header";
import { NewspaperSidebar } from "./NewspaperSidebar";
import { NewspaperViewer } from "./NewspaperViewer";
import { PageListDialog } from "./PageListDialog";
import {
  getNewspaper,
  getNewspaperPage,
  getAllPagesForDate,
  type NewspaperData,
  type NewspaperPage,
} from "@/lib/newspaperApi";
import { newspaperService, type NewspaperRecord } from "@/lib/newspaperService";
import { ShareCroppedImage } from "./ShareCroppedImage";
import { toast } from "@/hooks/use-toast";
import jawanBharatLogo from "@/assets/jawan-bharat-logo.jpg";

// Helper function to format dates consistently in Indian timezone
const formatDateForAPI = (date: Date): string => {
  try {
    const indianDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const year = indianDate.getFullYear();
    const month = String(indianDate.getMonth() + 1).padStart(2, "0");
    const day = String(indianDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    return date.toISOString().split("T")[0];
  }
};

// Helper function to convert Supabase data to NewspaperData format
const convertSupabaseToNewspaperData = (
  newspaperRecord: NewspaperRecord
): NewspaperData => {
  const pages: NewspaperPage[] = [];

  // Convert the nested pages structure to flat array
  Object.entries(newspaperRecord.pages.pages).forEach(([pageNum, pageData]) => {
    const pageNumber = parseInt(pageNum);
    pages.push({
      pageNumber,
      imageUrl: pageData.images[0]?.secure_url || "",
      section: `page-${pageNum}`,
      title: pageData.title,
      content: `Newspaper page ${pageNum}`,
      metadata: {
        date: newspaperRecord.date_of_paper,
        headlines: [`Page ${pageNum} Content`],
        author: "Newspaper Staff",
      },
    });
  });

  // Sort pages by page number
  pages.sort((a, b) => a.pageNumber - b.pageNumber);

  return {
    date: newspaperRecord.date_of_paper,
    totalPages: newspaperRecord.pages.totalPages,
    pages: pages,
    title: "Jawan Bharat",
    edition: "Morning Edition",
  };
};

export function NewspaperApp() {
  const [newspaperData, setNewspaperData] = useState<NewspaperData | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(8);
  const [zoom, setZoom] = useState(100);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSection, setSelectedSection] = useState("front-page");
  const [showPageList, setShowPageList] = useState(false);
  const [isCropMode, setIsCropMode] = useState(false);
  const [croppedImageData, setCroppedImageData] = useState<string | null>(null);
  const [isShareCroppedOpen, setIsShareCroppedOpen] = useState(false);
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialUrlProcessed, setInitialUrlProcessed] = useState(false);

  // Read URL query parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get("date");
    const pageParam = urlParams.get("page");

    if (dateParam) {
      try {
        const parsedDate = new Date(dateParam);
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        }
      } catch (error) {
        console.error("Invalid date parameter:", dateParam);
      }
    }

    if (pageParam) {
      const parsedPage = parseInt(pageParam);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        setCurrentPage(parsedPage);
      }
    }

    setInitialUrlProcessed(true);
  }, []); // Only run once on mount

  // Get current page data
  const currentPageData = newspaperData?.pages.find(
    (page) => page.pageNumber === currentPage
  );

  // Fetch newspaper data when date changes
  useEffect(() => {
    const fetchNewspaper = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateString = formatDateForAPI(selectedDate);
        console.log("📅 Fetching newspaper for date:", dateString);

        // Call Supabase API to get newspaper data
        const newspaperRecord = await newspaperService.getNewspaperByDate(
          dateString
        );

        if (newspaperRecord) {
          // Convert Supabase data to app format
          const data = convertSupabaseToNewspaperData(newspaperRecord);
          setNewspaperData(data);
          setTotalPages(data.totalPages);
          console.log("✅ API call successful, data received:", data);
        } else {
          // No data found for this date, fallback to dummy data
          console.log("⚠️ No data found for date, using fallback");
          const data = await getNewspaper(dateString);
          setNewspaperData(data);
          setTotalPages(data.totalPages);
        }

        // Always reset to first page when date changes
        setCurrentPage(1);
        setSelectedSection("front-page");
      } catch (err) {
        console.error("Error fetching newspaper:", err);
        // Fallback to dummy data on error
        try {
          const dateString = formatDateForAPI(selectedDate);
          const data = await getNewspaper(dateString);
          setNewspaperData(data);
          setTotalPages(data.totalPages);
        } catch (fallbackErr) {
          setError("Failed to fetch newspaper data");
          toast({
            title: "Load Failed",
            description: "Failed to load newspaper for selected date",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNewspaper();
  }, [selectedDate, initialUrlProcessed]);

  // Function to refresh all pages for current date
  const refreshAllPages = async () => {
    setLoading(true);
    try {
      const dateString = formatDateForAPI(selectedDate);
      console.log("🔄 Refreshing pages for date:", dateString);

      // Call Supabase API to get fresh newspaper data
      const newspaperRecord = await newspaperService.getNewspaperByDate(
        dateString
      );

      if (newspaperRecord) {
        // Convert Supabase data to app format
        const data = convertSupabaseToNewspaperData(newspaperRecord);
        setNewspaperData(data);
        setTotalPages(data.totalPages);

        // Always reset to first page when refreshing
        setCurrentPage(1);

        toast({
          title: "Pages Refreshed",
          description: `Successfully loaded ${data.totalPages} pages for ${dateString}`,
        });
      } else {
        // No data found, fallback to dummy data
        const allPages = await getAllPagesForDate(dateString);
        if (allPages.length > 0) {
          setNewspaperData((prev) => ({
            ...prev!,
            pages: allPages,
            totalPages: allPages.length,
          }));
          setTotalPages(allPages.length);

          // Always reset to first page when refreshing
          setCurrentPage(1);

          toast({
            title: "Pages Refreshed",
            description: `Successfully loaded ${allPages.length} pages for ${dateString}`,
          });
        } else {
          toast({
            title: "No Pages Found",
            description: `No newspaper pages found for ${dateString}`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error refreshing pages:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh newspaper pages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update section when page changes
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);

    // Use existing data from the API call - no new API call needed
    const pageData = newspaperData?.pages.find((p) => p.pageNumber === page);
    if (pageData) {
      setSelectedSection(pageData.section);
      console.log("📄 Page changed to:", page, "using existing data");
    } else {
      console.log("⚠️ Page data not found for page:", page);
    }
  };

  // Update page when section changes
  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
    const pageData = newspaperData?.pages.find((p) => p.section === section);
    if (pageData) {
      setCurrentPage(pageData.pageNumber);
    }
  };

  const handleToggleBookmark = (page: number) => {
    setBookmarkedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    );
  };

  const handleCropComplete = (croppedImage: string) => {
    setCroppedImageData(croppedImage);
    setIsShareCroppedOpen(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading newspaper...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !newspaperData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive text-2xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">
            Failed to Load Newspaper
          </h2>
          <p className="text-muted-foreground mb-4">
            {error || "No data available"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          {/* Sidebar */}
          <NewspaperSidebar
            selectedSection={selectedSection}
            onSectionChange={handleSectionChange}
            bookmarkedPages={bookmarkedPages}
            onToggleBookmark={handleToggleBookmark}
            currentPage={currentPage}
            pagesData={newspaperData.pages}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-center my-4">
              <img
                src={jawanBharatLogo}
                alt="logo"
                className="w-auto h-8 md:h-12 bg-transparent"
                style={{ mixBlendMode: "darken" }}
              />
            </div>
            <Header
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              zoom={zoom}
              onZoomChange={setZoom}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onShowPageList={() => setShowPageList(true)}
              isCropMode={isCropMode}
              onCropModeChange={setIsCropMode}
              onRefreshPages={refreshAllPages}
              isRefreshing={loading}
              currentPageData={currentPageData}
            />

            <div className="flex-1 flex">
              <NewspaperViewer
                currentPage={currentPage}
                zoom={zoom}
                selectedSection={selectedSection}
                newspaperData={newspaperData}
                onCropComplete={handleCropComplete}
                isCropMode={isCropMode}
                onCropModeChange={setIsCropMode}
                onPageChange={handlePageChange}
                totalPages={totalPages}
              />
            </div>
          </div>
        </div>

        {/* Page list dialog */}
        <PageListDialog
          open={showPageList}
          onOpenChange={setShowPageList}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageSelect={handlePageChange}
          bookmarkedPages={bookmarkedPages}
          newspaperData={newspaperData}
        />

        {/* Share Cropped Image Dialog */}
        <ShareCroppedImage
          isOpen={isShareCroppedOpen}
          onClose={() => setIsShareCroppedOpen(false)}
          croppedImageData={croppedImageData}
          pageInfo={`Page ${currentPage} of ${totalPages} - Cropped Image`}
          pageNumber={currentPage}
          date={selectedDate.toISOString().split("T")[0]}
        />
      </SidebarProvider>
    </div>
  );
}
