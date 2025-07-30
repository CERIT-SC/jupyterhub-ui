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
    <div className={cn("space-y-2", maxWidth, className)}>
      <Label className="font-medium" htmlFor={id}>
        {label}
      </Label>
      {children}
      <FormError message={error} />
      {(description || tooltip) && (
        <HelpText
          recommended={recommended}
          shortDescription={description}
          tooltip={tooltip}
        />
      )}
    </div>
  );
}
