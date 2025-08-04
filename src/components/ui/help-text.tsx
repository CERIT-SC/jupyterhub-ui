"use client";

import * as React from "react";
import { HelpCircle } from "lucide-react";

import { cn } from "@/lib/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTextProps {
  /** Short description that will be displayed directly on the form */
  shortDescription?: React.ReactNode;
  /** Detailed explanation that will be shown in the tooltip */
  tooltip?: React.ReactNode;
  /** If provided, will display a visual indicator that this field is recommended */
  recommended?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Layout variant for different display contexts */
  layout?: "vertical" | "horizontal";
}

export function HelpText({
  shortDescription,
  tooltip,
  recommended = false,
  className,
  layout = "vertical",
}: HelpTextProps) {
  const isHorizontal = layout === "horizontal";

  return (
    <div
      className={cn(
        "flex items-start gap-1.5",
        isHorizontal ? "mt-0" : "mt-1.5",
        className,
      )}
    >
      {shortDescription && (
        <div
          className={cn(
            "text-sm text-muted-foreground flex-1",
            isHorizontal && "text-base leading-relaxed",
          )}
        >
          {shortDescription}
          {recommended && (
            <span className="text-blue-600 font-medium ml-1">
              (Recommended)
            </span>
          )}
        </div>
      )}
      {tooltip && (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <HelpCircle
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors cursor-help flex-shrink-0",
                isHorizontal ? "h-5 w-5 mt-0.5" : "h-4 w-4",
              )}
            />
          </TooltipTrigger>
          <TooltipContent
            align="start"
            avoidCollisions={true}
            className="max-w-80 p-4 text-sm space-y-2"
            side={isHorizontal ? "left" : "right"}
          >
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
