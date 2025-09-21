import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Newspaper, Bookmark, TrendingUp, X } from "lucide-react";
import { type NewspaperPage } from "@/lib/dummyApi";
import jawanBharatLogo from "@/assets/jawan-bharat-logo.jpg";

interface SidebarProps {
  selectedSection: string;
  onSectionChange: (section: string) => void;
  onToggleBookmark: (page: number) => void;
  currentPage: number;
  pagesData?: NewspaperPage[];
}

const sections = [
  { id: "front-page", label: "GO TO LANDING PAGE", icon: Newspaper },
  { id: "home", label: "HOME", icon: TrendingUp },
  // { id: "world", label: "World News", icon: Globe },
  // { id: "politics", label: "Politics", icon: Building2 },
  // { id: "sports", label: "Sports", icon: Trophy },
  // { id: "lifestyle", label: "Lifestyle", icon: Heart },
  // { id: "technology", label: "Technology", icon: Zap },
  // { id: "opinion", label: "Opinion", icon: FileText },
];

const quickActions = [
  // { id: "search", label: "Search Articles", icon: Search },
  { id: "bookmarks", label: "My Bookmarks", icon: Bookmark },
  // { id: "archive", label: "Archive", icon: Archive },
  // { id: "settings", label: "Settings", icon: Settings },
];

export function NewspaperSidebar({
  selectedSection,
  onSectionChange,
  onToggleBookmark,
  currentPage,
  pagesData,
}: SidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarContent className="bg-paper">
        {/* Close Button */}
        {!isCollapsed && (
          <div className="flex justify-between p-2">
            <div className="mx-2 my-4">
              <img
                src={jawanBharatLogo}
                alt="logo"
                className="w-44 h-auto bg-transparent"
                style={{ mixBlendMode: "darken" }}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 hover:bg-secondary/50 border border-transparent hover:border-border/50 transition-all duration-200"
              title="Close sidebar"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          </div>
        )}

        <Separator />
        {/* Newspaper Sections */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((section) => (
                <SidebarMenuItem key={section.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(section.id)}
                    className={`
                      ${
                        selectedSection === section.id
                          ? "font-medium font-serif text-accent"
                          : " text-muted-foreground"
                      }
                      transition-smooth font-serif text-muted-foreground 
                    `}
                  >
                    <section.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{section.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}