import * as React from "react";

import { cn } from "@/lib/cn";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { HelpText } from "@/components/ui/help-text";

interface FormFieldProps {
  /** Unique ID for the form field */
  id: string;
  /** Label text for the form field */
  label: React.ReactNode;
  /** Any error message to display */
  error?: string;
  /** Short description text that appears below the field */
  description?: React.ReactNode;
  /** Detailed help text for tooltip */
  tooltip?: React.ReactNode;
  /** Whether this field is recommended */
  recommended?: boolean;
  /** Children (typically form controls) */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
  /** Max width for the field container */
  maxWidth?: string;
}

export function FormField({
  id,
  label,
  error,
  description,
  tooltip,
  recommended = false,
  children,
  className,
  maxWidth = "max-w-xl",
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Mobile layout - stacked vertically */}
      <div className="lg:hidden space-y-2">
        <Label className="font-medium" htmlFor={id}>
          {label}
        </Label>
        <div className={maxWidth}>{children}</div>
        <FormError message={error} />
        {(description || tooltip) && (
          <HelpText
            recommended={recommended}
            shortDescription={description}
            tooltip={tooltip}
          />
        )}
      </div>

      {/* Desktop layout - side by side */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
        <div className="space-y-2">
          <Label className="font-medium" htmlFor={id}>
            {label}
          </Label>
          <div className="max-w-md">{children}</div>
          <FormError message={error} />
        </div>

        {(description || tooltip) && (
          <div className="pt-7">
            {" "}
            {/* Align with the input field */}
            <HelpText
              layout="horizontal"
              recommended={recommended}
              shortDescription={description}
              tooltip={tooltip}
            />
          </div>
        )}
      </div>
    </div>
  );
}
