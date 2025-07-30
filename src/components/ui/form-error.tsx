import * as React from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/cn";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-red-500 mt-1",
        className,
      )}
    >
      <AlertCircle className="h-3 w-3" />
      <span>{message}</span>
    </div>
  );
}
