import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NewspaperViewer } from "./NewspaperViewer";
import { PageListDialog } from "./PageListDialog";
import {
  getNewspaper,
  getAllPagesForDate,
  type NewspaperData,
  type NewspaperPage,
} from "@/lib/newspaperApi";
import { newspaperService, type NewspaperRecord } from "@/lib/newspaperService";
import { ShareCroppedImage } from "./ShareCroppedImage";
import { toast } from "@/hooks/use-toast";
import jawanBharatLogo from "@/assets/jawan-bharat-logo.png";
import { CalendarIcon, ChevronsRight,  ChevronsLeft} from "lucide-react";
import { format } from "date-fns";
import { cn, playSound } from "@/lib/utils";
import { useParams, useLocation } from "react-router-dom";

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
  const { date: routeDate } = useParams<{ date: string }>();
  const location = useLocation();
  const [newspaperData, setNewspaperData] = useState<NewspaperData | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(8);
  const [zoom, setZoom] = useState(100);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPageList, setShowPageList] = useState(false);
  const [isCropMode, setIsCropMode] = useState(false);
  const [croppedImageData, setCroppedImageData] = useState<string | null>(null);
  const [isShareCroppedOpen, setIsShareCroppedOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialUrlProcessed, setInitialUrlProcessed] = useState(false);
  const [isMobileDatePickerOpenInHeader, setIsMobileDatePickerOpenInHeader] = useState(false);
  const [adjacentEditions, setAdjacentEditions] = useState<{ previous: string | null; next: string | null }>({ previous: null, next: null });


  // Read URL query parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = routeDate || urlParams.get("date");
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
  }, [routeDate]);

  useEffect(() => {
    const date = formatDateForAPI(selectedDate);
    const isEdition = location.pathname.startsWith("/edition/");
    const title = isEdition
      ? `Jawan Bharat ePaper ${date} | आजचा दैनिक जवान भारत`
      : "Jawan Bharat ePaper | दैनिक जवान भारत";
    const description = isEdition
      ? `${date} रोजचा जवान भारत मराठी ePaper वाचा. जळगावच्या बातम्या आणि आजच्या अंकातील सर्व पाने येथे पाहा.`
      : "'जवान भारत' हे जळगाव येथून प्रकाशित होणारे मराठी दैनिक असून उत्तर महाराष्ट्र, विदर्भ आणि मराठवाड्यातील वाचकांपर्यंत पोहोचते. आजचा ePaper वाचा.";
    const canonical = `https://epaper.jawanbharat.com${isEdition ? `/edition/${date}` : "/"}`;
    document.title = title;
    const setMeta = (selector: string, key: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) { element = document.createElement("meta"); element.setAttribute(key, selector.includes("property") ? selector.match(/\[property="([^"]+)/)?.[1] || "" : selector.match(/\[name="([^"]+)/)?.[1] || ""); document.head.appendChild(element); }
      element.content = value;
    };
    setMeta('meta[name="description"]', "name", description);
    setMeta('meta[property="og:title"]', "property", title);
    setMeta('meta[property="og:description"]', "property", description);
    setMeta('meta[property="og:url"]', "property", canonical);
    setMeta('meta[property="og:type"]', "property", "website");
    setMeta('meta[property="og:image"]', "property", "https://res.cloudinary.com/djm9pwfzu/image/upload/v1785834120/Javan_Bharat_pubkvw.png");
    setMeta('meta[name="twitter:card"]', "name", "summary_large_image");
    setMeta('meta[name="twitter:image"]', "name", "https://res.cloudinary.com/djm9pwfzu/image/upload/v1785834120/Javan_Bharat_pubkvw.png");
    setMeta('meta[name="robots"]', "name", "index,follow,max-image-preview:large");
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = canonical;
    const structuredData = {
      "@context": "https://schema.org", "@graph": [
        { "@type": "Organization", "@id": "https://epaper.jawanbharat.com/#organization", name: "Jawan Bharat", url: "https://epaper.jawanbharat.com/", logo: { "@type": "ImageObject", url: "https://res.cloudinary.com/djm9pwfzu/image/upload/v1785834120/Javan_Bharat_pubkvw.png" } },
        { "@type": "WebSite", "@id": "https://epaper.jawanbharat.com/#website", url: "https://epaper.jawanbharat.com/", name: "Jawan Bharat ePaper", publisher: { "@id": "https://epaper.jawanbharat.com/#organization" }, inLanguage: ["mr", "en"] },
        { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://epaper.jawanbharat.com/" }, ...(isEdition ? [{ "@type": "ListItem", position: 2, name: `ePaper ${date}`, item: canonical }] : [])] },
        ...(newspaperData?.pages[0]?.imageUrl ? [{ "@type": "ImageObject", contentUrl: newspaperData.pages[0].imageUrl, name: `Jawan Bharat newspaper front page ${date}`, description: `Front page of Jawan Bharat Marathi newspaper published on ${date}` }] : [])
      ]
    };
    let script = document.getElementById("seo-structured-data") as HTMLScriptElement | null;
    if (!script) { script = document.createElement("script"); script.id = "seo-structured-data"; script.type = "application/ld+json"; document.head.appendChild(script); }
    script.textContent = JSON.stringify(structuredData);
  }, [selectedDate, location.pathname, newspaperData]);

  useEffect(() => {
    if (location.pathname.startsWith('/edition/')) {
      newspaperService.getAdjacentEditionDates(formatDateForAPI(selectedDate)).then(setAdjacentEditions);
    }
  }, [selectedDate, location.pathname]);

  // Get current page data
  const currentPageData = newspaperData?.pages.find(
    (page) => page.pageNumber === currentPage
  );

  // Fetch newspaper data when date changes (only after URL processing is complete)
  useEffect(() => {
    // Don't fetch until URL processing is complete
    if (!initialUrlProcessed) return;

    const fetchNewspaper = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateString = formatDateForAPI(selectedDate);

        // Call Supabase API to get newspaper data
        const newspaperRecord = await newspaperService.getNewspaperByDate(
          dateString
        );

        if (newspaperRecord) {
          // Convert Supabase data to app format
          const data = convertSupabaseToNewspaperData(newspaperRecord);
          setNewspaperData(data);
          setTotalPages(data.totalPages);
        } else {
          // No data found for this date, fallback to dummy data
          const data = await getNewspaper(dateString);
          setNewspaperData(data);
          setTotalPages(data.totalPages);
        }

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
        // setCurrentPage(1);

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
          // setCurrentPage(1);

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
    playSound();
    setCurrentPage(page);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setCurrentPage(1);
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
  // if (error || !newspaperData) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="text-destructive text-2xl mb-4">⚠️</div>
  //         <h2 className="text-xl font-semibold mb-2">
  //           Failed to Load Newspaper
  //         </h2>
  //         <p className="text-muted-foreground mb-4">
  //           {error || "No data available"}
  //         </p>
  //         {/* <button
  //           onClick={() => window.location.reload()}
  //           className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
  //         >
  //           Retry
  //         </button> */}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background relative">
      {/* <SidebarProvider> */}
      <div className="flex min-h-screen w-full">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="sticky top-0 z-40 flex items-center justify-start bg-background px-4 py-3 md:my-4 border-b border-red-100  shadow-[0_4px_6px_-4px_rgba(0,0,0,0.3)] md:static md:justify-center md:border-none md:p-0 md:shadow-none">
            <img
              src={jawanBharatLogo}
              alt="Jawan Bharat Marathi newspaper logo"
              className="w-auto h-6 md:h-12 bg-transparent"
              style={{ mixBlendMode: "darken" }}
            />
            <Popover
              open={isMobileDatePickerOpenInHeader}
              onOpenChange={setIsMobileDatePickerOpenInHeader}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-10 min-w-10 rounded-lg border-border/70 px-2 text-left font-medium shadow-none transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:px-3 md:hidden ml-4",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-5 w-5 shrink-0 sm:mr-2" />
                  <span>
                    {format(selectedDate, "MMM dd, yyyy")}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  disabled={{ after: new Date() }}
                  toMonth={new Date()}
                  onSelect={(date) => {
                    if (date) {
                      handleDateChange(date);
                      setIsMobileDatePickerOpenInHeader(false);
                    }
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <Header
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            zoom={zoom}
            onZoomChange={setZoom}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            onShowPageList={() => setShowPageList(true)}
            isCropMode={isCropMode}
            onCropModeChange={setIsCropMode}
            onRefreshPages={refreshAllPages}
            isRefreshing={loading}
            currentPageData={currentPageData}
          />
          {location.pathname.startsWith('/edition/') && <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
            {adjacentEditions.previous ? <a className="text-sm text-primary underline" href={`/edition/${adjacentEditions.previous}`}>← मागील अंक</a> : <span />}
            <h1 className="text-center text-lg font-semibold">Jawan Bharat ePaper — {format(selectedDate, "dd MMMM yyyy")} | जवान भारत ई पेपर</h1>
            {adjacentEditions.next ? <a className="text-sm text-primary underline" href={`/edition/${adjacentEditions.next}`}>पुढील अंक →</a> : <span />}
          </div>}
          <div className="flex flex-1 min-h-0 min-w-0">
            {
              newspaperData ? <NewspaperViewer
                currentPage={currentPage}
                zoom={zoom}
                newspaperData={newspaperData}
                onCropComplete={handleCropComplete}
                isCropMode={isCropMode}
                onCropModeChange={setIsCropMode}
                totalPages={totalPages}
              /> : <div className=" w-full h-full flex justify-center items-center">
                <p className="text-muted-foreground">
                  {"No data available"}
                </p>
              </div>
            }

          </div>
          <div className="mb-5 shrink-0 bg-[#595959] py-2 text-center text-white md:mb-0">
            Copyright © 2026 Jawan Bharat. All rights reserved.
          </div>
          {location.pathname === "/" && <section className="mx-auto max-w-4xl space-y-3 px-5 py-5 text-foreground" aria-labelledby="about-jawan-bharat">
            <h1 id="about-jawan-bharat" className="text-2xl font-bold">'जवान भारत' जळगाव येथून प्रकाशित होणारे मराठी दैनिक आहे.</h1>
            <p>दैनिक "जवान भारत" हे उत्तर महाराष्ट्रासह विदर्भ आणि मराठवाड्यातील वाचकांचे व्यासपीठ आहे. जळगाव, धुळे, नंदुरबार, नाशिक, बुलढाणा, अकोला, वाशिम, छत्रपती संभाजीनगर आणि जालना जिल्ह्यांत या दैनिकाचे वितरण होते.</p>
            <p>Read the Jawan Bharat ePaper, a Marathi daily newspaper published from Jalgaon. Jawan Bharat serves readers across North Maharashtra, Vidarbha and Marathwada, with circulation in Jalgaon, Dhule, Nandurbar, Nashik, Buldhana, Akola, Washim, Chhatrapati Sambhajinagar and Jalna.</p>
            <p className="text-sm">आजचा जवान भारत पेपर किंवा उपलब्ध मागील अंक वाचण्यासाठी दिनदर्शिकेतून प्रकाशन तारीख निवडा. प्रत्येक उपलब्ध अंकाची स्वतंत्र लिंक सामायिक करता येते.</p>
          </section>}
        </div>
      </div>
      {/* Left Navigation Bar - Positioned within container bounds */}
      {currentPage > 1 && (
        <div
          className="fixed left-2 top-1/2 transform -translate-y-1/2 z-50 cursor-pointer group"
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <div className="bg-black/30 hover:bg-black/40 transition-all duration-200 rounded-r-lg p-2 h-36 flex justify-center items-center">
              <ChevronsLeft className="h-6 w-6 text-white drop-shadow-lg" />
          </div>
        </div>
      )}

      {/* Right Navigation Bar - Positioned within container bounds */}
      {currentPage < totalPages && (
        <div
          className="fixed right-2 top-1/2 transform -translate-y-1/2 z-50 cursor-pointer group"
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <div className="bg-black/30 hover:bg-black/40 transition-all duration-200 rounded-l-lg p-2 h-36 flex justify-center items-center">
            <div className="flex items-center justify-center">
              <ChevronsRight className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      )}
      {/* Page list dialog */}
      <PageListDialog
        open={showPageList}
        onOpenChange={setShowPageList}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageSelect={handlePageChange}
        newspaperData={newspaperData}
      />

      {/* Share Cropped Image Dialog */}
      <ShareCroppedImage
        isOpen={isShareCroppedOpen}
        onClose={() => setIsShareCroppedOpen(false)}
        croppedImageData={croppedImageData}
        pageInfo={`Page ${currentPage} of ${totalPages}`}
        pageNumber={currentPage}
        date={selectedDate.toISOString().split("T")[0]}
      />
      {/* </SidebarProvider> */}
    </div>
  );
}
