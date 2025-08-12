import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

interface CollapsibleCardProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  children: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  isSwitch?: boolean;
}

export function CollapsibleCard({
  title,
  icon,
  isEnabled,
  onToggle,
  children,
  description,
  className,
  isSwitch,
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(isEnabled);

  // Update expanded state when enabled state changes from parent
  React.useEffect(() => {
    setIsExpanded(isEnabled);
  }, [isEnabled]);

  // Handle toggle
  const handleToggle = (checked: boolean) => {
    setIsExpanded(checked);
    onToggle(checked);
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle(!isEnabled);
    }
  };

  return (
    <Card className={cn("p-0 group hover:border-infra-primary", className)}>
      <div
        aria-expanded={isEnabled && isExpanded}
        aria-label={`Toggle ${title} section`}
        className="flex items-center justify-between p-4 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => handleToggle(!isEnabled)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <div>
            <h3 className="font-medium">{title}</h3>
            {description && !isExpanded && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSwitch ? (
            <>
              <div className="text-sm text-muted-foreground">
                {isEnabled ? "On" : "Off"}
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                onClick={(e) => e.stopPropagation()}
              />
            </>
          ) : (
            !isEnabled && <ChevronDown />
          )}

          {isEnabled && (
            <button
              aria-label={isExpanded ? "Collapse section" : "Expand section"}
              className=" rounded-full focus:outline-none focus:ring-2 focus:border-infra-primary/30 "
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {isEnabled && isExpanded && (
        <>
          <Separator />
          <div className="p-4 pt-0">{children}</div>
        </>
      )}
    </Card>
  );
}
