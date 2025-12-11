import React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type SimpleAdvancedToggleProps = {
  isSimple: boolean;
  onChange: (isSimple: boolean) => void;
  className?: string;
  simpleLabel?: string;
  advancedLabel?: string;
};

export function SimpleAdvancedToggle({
  isSimple,
  onChange,
  className,
  simpleLabel = "Simple",
  advancedLabel = "Advanced",
}: SimpleAdvancedToggleProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn("text-sm", isSimple ? "text-foreground font-semibold" : "text-muted-foreground")}
        aria-pressed={isSimple}
      >
        {simpleLabel}
      </button>
      <Switch
        checked={!isSimple}
        onCheckedChange={(checked) => onChange(!checked ? true : false) /* keep boolean for simple */}
        aria-label="Toggle advanced settings"
      />
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn("text-sm", !isSimple ? "text-foreground font-semibold" : "text-muted-foreground")}
        aria-pressed={!isSimple}
      >
        {advancedLabel}
      </button>
    </div>
  );
}
