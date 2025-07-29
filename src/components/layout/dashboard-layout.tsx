"use client";

import React from "react";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
}

export function DashboardLayout({
  children,
  sidebar,
  header,
  className,
  sidebarOpen = true,
  onSidebarToggle,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {header && (
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white backdrop-blur-md shadow-sm">
          {header}
        </header>
      )}

      <div className="flex flex-1 relative overflow-hidden">
        {sidebar && (
          <>
            {/* Sidebar */}
            <aside
              className={cn(
                "border-r border-gray-100 bg-white overflow-y-auto transition-all duration-300 ease-in-out z-50",
                "md:sticky md:w-64 md:p-4 md:opacity-100 md:pointer-events-auto",
                sidebarOpen
                  ? "fixed left-0 w-64  translate-x-0 opacity-100 pointer-events-auto"
                  : "fixed  left-0 w-64  -translate-x-full opacity-0 pointer-events-none",
              )}
            >
              {sidebar}

              {/* Close button - only visible on mobile */}
              <Button
                className="md:hidden absolute top-4 right-4 rounded-full"
                size="icon"
                variant="ghost"
                onClick={onSidebarToggle}
              >
                <X className="h-4 w-4" />
              </Button>
            </aside>
          </>
        )}

        <main
          className={cn(
            "flex-1 p-6 transition-all duration-300 overflow-auto",
            className,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
