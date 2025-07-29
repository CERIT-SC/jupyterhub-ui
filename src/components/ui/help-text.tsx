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
}

export function HelpText({
  shortDescription,
  tooltip,
  recommended = false,
  className,
}: HelpTextProps) {
  return (
    <div className={cn("flex items-start gap-1.5 mt-1.5", className)}>
      {shortDescription && (
        <p className="text-sm text-muted-foreground flex-1">
          {shortDescription}
          {recommended && (
            <span className="text-blue-600 font-medium ml-1">
              (Recommended)
            </span>
          )}
        </p>
      )}
      {tooltip && (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help flex-shrink-0" />
          </TooltipTrigger>
          <TooltipContent
            align="start"
            avoidCollisions={true}
            className="max-w-80 p-4 text-sm space-y-2"
            side="right"
          >
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
