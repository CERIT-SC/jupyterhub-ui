"use client";

import React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
      <footer className="w-full border-t border-infra-border bg-white overflow-hidden flex flex-row flex-nowrap justify-between items-center px-20 py-2 text-gray-800 text-sm">
        <div className="flex items-center gap-3">
          <span className="">Powered by</span>
          <a
            href="https://www.e-infra.cz"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="e-INFRA CZ"
            className="inline-flex items-center"
          >
            {/* Red-colored e-INFRA logo via mask */}
            <span
              className="inline-block h-8 w-40 bg-primary
                         [mask-image:url('/e-infra_logo.svg')] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:left_center]
                         [-webkit-mask-image:url('/e-infra_logo.svg')] [-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:left_center]"
              aria-hidden="true"
              title="e-INFRA CZ"
            />
          </a>
        </div>

        <div className="flex items-center gap-2 pl-4">
          <span>Provided by</span>
          <a
            href="https://www.cerit-sc.cz"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="CERIT-SC"
            className="underline"
          >
            CERIT-SC
          </a>
          <span>part of Masaryk University</span>
        </div>
      </footer>
    </div>
  );
}
