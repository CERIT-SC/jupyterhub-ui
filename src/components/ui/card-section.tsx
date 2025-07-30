import * as React from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/cn";

interface CardSectionProps {
  /** The title of the section */
  title?: React.ReactNode;
  /** Whether to show a separator above this section */
  withSeparator?: boolean;
  /** Children content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function CardSection({
  title,
  withSeparator = true,
  children,
  className,
}: CardSectionProps) {
  return (
    <div className={cn("py-4", className)}>
      {withSeparator && <Separator className="mb-4" />}
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
