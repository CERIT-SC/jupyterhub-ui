import React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  title?: string;
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  nav?: React.ReactNode;
  onToggleSidebar?: () => void;
  className?: string;
}

export function AppHeader({
  title = "JupyterHub Client",
  logo,
  actions,
  nav,
  onToggleSidebar,
  className,
}: AppHeaderProps) {
  return (
    <div
      className={cn("h-14 px-4 flex items-center justify-between ", className)}
    >
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button
            className="md:hidden rounded-full"
            size="icon"
            variant="ghost"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex items-center">
          {logo && <span className="mr-2">{logo}</span>}
          <Link
            className="text-xl font-semibold bg-gradient-to-r from-infra-primary to-infra-accent bg-clip-text text-transparent no-underline"
            href="/"
          >
            {title}
          </Link>
        </div>

        {nav && (
          <nav className="hidden md:flex items-center space-x-4 ml-6 border border-gray-200">
            {nav}
          </nav>
        )}
      </div>

      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
}
