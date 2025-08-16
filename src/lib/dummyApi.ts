// Dummy API service to simulate backend responses
// This will be replaced with real API calls later

export interface NewspaperPage {
  pageNumber: number;
  imageUrl: string;
  section: string;
  title: string;
  content: string;
  metadata: {
    date: string;
    headlines: string[];
    author?: string;
  };
}

export interface NewspaperData {
  date: string;
  totalPages: number;
  pages: NewspaperPage[];
  title: string;
  edition: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Dummy newspaper data
const dummyNewspaperData: NewspaperData = {
  date: new Date().toISOString().split("T")[0],
  totalPages: 8,
  title: "Jawan Bharat",
  edition: "Morning Edition",
  pages: [
    {
      pageNumber: 1,
      imageUrl:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCA4MDAgMTAwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjZmZmZmZmIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI5MDAiIGZpbGw9IiNmMGYwZjAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZyb250IFBhZ2U8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJyZWFraW5nIE5ld3M8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRlY2ggU2VjdG9yIEJyZWFrdGhyb3VnaDwvdGV4dD4KPHRleHQgeD0iNDAwIiB5PSIzMTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29tbXVuaXR5IEZlc3RpdmFsPC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjM0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5XZWF0aGVyIEZvcmVjYXN0PC90ZXh0Pgo8L3N2Zz4K",
      section: "front-page",
      title: "Front Page - Breaking News",
      content:
        "Major developments in technology sector. Local community celebrates annual festival. Weather forecast for the week ahead.",
      metadata: {
        date: new Date().toISOString().split("T")[0],
        headlines: [
          "Tech Sector Breakthrough",
          "Community Festival Success",
          "Weekly Weather Update",
        ],
      },
    },
    {
      pageNumber: 2,
      imageUrl:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCA4MDAgMTAwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjZmZmZmZmIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI5MDAiIGZpbGw9IiNmMGYwZjAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJ1c2luZXNzPC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TdG9jayBNYXJrZXQ8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRlY2ggTWVyZ2VycyBOZXdzPC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjMxMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FY29ub21pYyBHcm93dGg8L3RleHQ+Cjwvc3ZnPgo=",
      section: "business",
      title: "Business Section",
      content:
        "Stock market reaches new heights. Tech companies announce major mergers. Economic indicators show positive growth trends.",
      metadata: {
        date: new Date().toISOString().split("T")[0],
        headlines: [
          "Stock Market Records",
          "Tech Merger News",
          "Economic Growth",
        ],
      },
    },
    {
      pageNumber: 3,
      imageUrl:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCA4MDAgMTAwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjZmZmZmZmIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI5MDAiIGZpbGw9IiNmMGYwZjAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPldvcmxkIE5ld3M8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNsaW1hdGUgU3VtbWl0PC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EaXBsb21hdGljIFJlbGF0aW9uczwvdGV4dD4KPHRleHQgeD0iNDAwIiB5PSIzMTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VHJhZGUgQWdyZWVtZW50czwvdGV4dD4KPC9zdmc+Cg==",
      section: "world",
      title: "World News",
      content:
        "International summit addresses climate change. Diplomatic relations strengthen between nations. Global trade agreements finalized.",
      metadata: {
        date: new Date().toISOString().split("T")[0],
        headlines: [
          "Climate Summit",
          "Diplomatic Relations",
          "Trade Agreements",
        ],
      },
    },
    {
      pageNumber: 4,
      imageUrl:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCA4MDAgMTAwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjZmZmZmZmIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI5MDAiIGZpbGw9IiNmMGYwZjAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBvbGl0aWNzPC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OZXcgTGVnaXNsYXRpb248L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVsZWN0aW9uIENhbXBhZ25zPC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjMxMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qb2xpY3kgUmVmb3JtczwvdGV4dD4KPC9zdmc+Cg==",
      section: "politics",
      title: "Politics",
      content:
        "New legislation proposed in parliament. Election campaigns gain momentum. Policy reforms impact various sectors.",
      metadata: {
        date: new Date().toISOString().split("T")[0],
        headlines: ["New Legislation", "Election Campaigns", "Policy Reforms"],
      },
    },
    {
      pageNumber: 5,
      imageUrl:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCA4MDAgMTAwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjZmZmZmZmIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI5MDAiIGZpbGw9IiNmMGYwZjAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNwb3J0czwvdGV4dD4KPHRleHQgeD0iNDAwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2hhbXBpb25zaGlwPC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2NhbCBUZWFtIFZpY3Rvcnk8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iMzEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk9seW1waWMgUHJlcGFyYXRpb25zPC90ZXh0Pgo8L3N2Zz4K",
      section: "sports",
      title: "Sports",
      content:
        "Championship finals set new records. Local team wins regional tournament. Olympic preparations in full swing.",
      metadata: {
        date: new Date().toISOString().split("T")[0],
        headlines: [
          "Championship Records",
          "Local Team Victory",
          "Olympic Preparations",
        ],
      },
    },
    {
      pageNumber: 6,
      imageUrl:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCA4MDAgMTAwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjZmZmZmZmIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI5MDAiIGZpbGw9IiNmMGYwZjAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxpZmVzdHlsZTwvdGV4dD4KPHRleHQgeD0iNDAwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SGVhbHRoIFRyZW5kczwvdGV4dD4KPHRleHQgeD0iNDAwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RmFzaGlvbiBJbmR1c3RyeTwvdGV4dD4KPHRleHQgeD0iNDAwIiB5PSIzMTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q3VsdHVyYWwgRXZlbnRzPC90ZXh0Pgo8L3N2Zz4K",
      section: "lifestyle",
      title: "Lifestyle",
      content:
        "Health and wellness trends on the rise. Fashion industry embraces sustainability. Cultural events showcase local talent.",
      metadata: {
        date: new Date().toISOString().split("T")[0],
        headlines: [
          "Health Trends",
          "Fashion Sustainability",
          "Cultural Events",
        ],
      },
    },
    {
      pageNumber: 7,
      imageUrl:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCA4MDAgMTAwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjZmZmZmZmIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI5MDAiIGZpbGw9IiNmMGYwZjAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFJPC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UcmFkZSBBZ3JlZW1lbnRzPC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GYXNoaW9uIEluZHVzdHJ5PC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjMxMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DdWx0dXJhbCBFdmVudHM8L3RleHQ+Cjwvc3ZnPgo=",
      section: "technology",
      title: "Technology",
      content:
        "AI breakthrough in medical research. New smartphone models launched. Cybersecurity measures strengthened.",
      metadata: {
        date: new Date().toISOString().split("T")[0],
        headlines: [
          "AI Medical Breakthrough",
          "New Smartphones",
          "Cybersecurity",
        ],
      },
    },
    {
      pageNumber: 8,
      imageUrl:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCA4MDAgMTAwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjZmZmZmZmIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI5MDAiIGZpbGw9IiNmMGYwZjAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk9yZGVyPC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FbGVjdGlvbiBDYW1wYWduczwvdGV4dD4KPHRleHQgeD0iNDAwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UG9saWN5IFJlZm9ybXM8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iMzEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRyYWRlIEFncmVlbWVudHM8L3RleHQ+Cjwvc3ZnPgo=",
      section: "opinion",
      title: "Opinion & Editorial",
      content:
        "Editorial: The future of digital media. Guest column: Education reform perspectives. Letters to the editor.",
      metadata: {
        date: new Date().toISOString().split("T")[0],
        headlines: [
          "Digital Media Future",
          "Education Reform",
          "Reader Letters",
        ],
      },
    },
  ],
};

// Dummy API functions
export const dummyApi = {
  // Get newspaper for a specific date
  async getNewspaper(date: string): Promise<NewspaperData> {
    await delay(500); // Simulate network delay
    return {
      ...dummyNewspaperData,
      date: date
    };
  },

  // Get all pages for a newspaper
  async getNewspaperPages(date: string): Promise<NewspaperPage[]> {
    await delay(300);
    return dummyNewspaperData.pages;
  },

  // Get specific page
  async getPage(date: string, pageNumber: number): Promise<NewspaperPage | null> {
    await delay(200);
    return dummyNewspaperData.pages.find(p => p.pageNumber === pageNumber) || null;
  },

  // Search pages by section
  async searchPagesBySection(date: string, section: string): Promise<NewspaperPage[]> {
    await delay(400);
    return dummyNewspaperData.pages.filter(p => p.section === section);
  },

  // Get available dates
  async getAvailableDates(): Promise<string[]> {
    await delay(200);
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }
};

