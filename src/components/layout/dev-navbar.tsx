"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Code, Terminal } from "lucide-react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function DevNavbar() {
  const pathname = usePathname();

  // Get development links from siteConfig
  const devLinks =
    siteConfig.navigation.flatMap((section) =>
      section.items.filter((item) => item.development),
    ) || [];

  // Add hub link
  const navigationItems = [
    {
      name: "Hub",
      icon: Home,
      path: "/hub/",
      description: "Main application hub",
    },
    {
      name: "Dev",
      icon: Terminal,
      path: "/dev/",
      description: "Main application hub",
    },
    ...devLinks.map((item) => ({
      ...item,
      description:
        item.name === "api tester"
          ? "Test API endpoints"
          : "Component showcase",
    })),
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span className="font-semibold">Development</span>
              <Badge className="text-xs" variant="outline">
                DEV
              </Badge>
            </div>
            <Separator className="h-4" orientation="vertical" />
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <Button
                    key={item.path}
                    asChild
                    className={cn(
                      "relative h-9 px-3",
                      isActive && "bg-primary text-primary-foreground",
                    )}
                    size="sm"
                    variant={isActive ? "default" : "ghost"}
                  >
                    <Link href={item.path}>
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className="text-xs" variant="soft">
              {pathname}
            </Badge>
          </div>
        </div>
      </div>
    </nav>
  );
}
