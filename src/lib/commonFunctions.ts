  // Get current URL with query parameters for sharing
  const getCurrentPageUrl = (selectedDate: Date, currentPage: number) => {
    const url = new URL(window.location.href);

    // Format date consistently in Indian timezone
    const formatDateForURL = (date: Date): string => {
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

    url.searchParams.set("date", formatDateForURL(selectedDate));
    url.searchParams.set("page", currentPage.toString());
    return url.toString();
  };

  export { getCurrentPageUrl };