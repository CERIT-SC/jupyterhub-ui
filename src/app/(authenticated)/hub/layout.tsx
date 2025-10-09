"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Bell, LogOut, Settings, User, UserCircle } from "lucide-react";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { siteConfig } from "@/config/site";
import { AppHeader } from "@/components/layout/app-header";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SidebarNavigation } from "@/components/layout/sidebar-navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (for mobile)
  useEffect(() => {
    const isMobile = window.innerWidth < 768; // md breakpoint

    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    // if (user === null) {
    //   router.push("/login");
    // }
  }, [user]);

  // Set sidebar open by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // md breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return "U";

    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user display name
  const getDisplayName = () => {
    if (!user) return "User";

    return user.name || "User";
  };

  return (
    <DashboardLayout
      header={
        <AppHeader
          actions={
            <>
              <Button size="icon" variant="ghost">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="relative " size="icon" variant="ghost">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 mr-2 bg-white/95 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-9 w-9 border border-infra-gray-light/50">
                      <AvatarImage src={""} />
                      <AvatarFallback className="bg-gradient-to-br from-infra-primary to-infra-violet text-white font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <DropdownMenuLabel className="p-0 font-medium">
                        {getDisplayName()}
                      </DropdownMenuLabel>
                      {user?.name && (
                        <span className="text-xs text-infra-text-secondary truncate max-w-[11rem]">
                          {user.roles?.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:bg-infra-gray-light/30 focus:bg-infra-gray-light/30">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-infra-gray-light/30 focus:bg-infra-gray-light/30">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-infra-error hover:bg-infra-error/10 focus:bg-infra-error/10 focus:text-infra-error"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
          logo={
            <Image
              src="/jupyterhub_logo.svg"
              alt="JupyterHub logo"
              width={32}
              height={32}
              priority
              className="h-8 w-8 rounded-md"
            />
          }
          title={siteConfig.name}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      }
      sidebar={<SidebarNavigation />}
      sidebarOpen={sidebarOpen}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
    >
      {children}
    </DashboardLayout>
  );
}
