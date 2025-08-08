"use client";

import React from "react";
import { X } from "lucide-react";

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
    <div className="h-screen flex flex-col relative">
      {header && (
        <header className="sticky top-0 z-10 border border-infra-border bg-white backdrop-blur-md shadow-sm">
          {header}
        </header>
      )}

      <div className="flex flex-1 relative overflow-hidden">
        {sidebar && (
          <>
            {/* Sidebar */}
            <aside
              className={cn(
                "fixed left-0 border-r h-full w-full border-infra-border bg-white overflow-y-auto transition-all duration-300 ease-in-out z-50",
                "sm:w-64",
                "md:sticky md:w-64 md:p-4 md:pointer-events-auto ",
                sidebarOpen
                  ? "translate-x-0 opacity-100 pointer-events-auto"
                  : "-translate-x-full opacity-0 pointer-events-none",
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
            <div
              aria-label="Close sidebar"
              className={cn(
                "fixed inset-0 bg-white/50 backdrop-blur-sm md:hidden",
                sidebarOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none",
              )}
              role="button"
              tabIndex={0}
              onClick={onSidebarToggle}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  if (onSidebarToggle && sidebarOpen) {
                    onSidebarToggle();
                  }
                }
              }}
            />
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
