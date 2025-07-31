"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

export function SidebarNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }

    return pathname.startsWith(path);
  };

  return (
    <div className="space-y-6 py-2">
      {siteConfig.navigation.map((section, index) => (
        <div key={`${section.section}-${index}`} className="space-y-2">
          <div className="px-2 py-1.5 text-sm font-semibold text-infra-text-primary">
            {section.section}
          </div>
          <div className="space-y-1">
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={`${item.name}-${itemIndex}`}
                  href={item.disabled ? "#" : item.path}
                >
                  <Button
                    className={cn(
                      "w-full justify-start font-normal hover:bg-infra-gray-light/30",
                      active &&
                        "bg-infra-gray-light/50 text-infra-primary font-medium",
                      item.disabled && "opacity-60 pointer-events-none",
                    )}
                    variant={active ? "primary" : "ghost"}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
