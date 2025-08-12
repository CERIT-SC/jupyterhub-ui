import React from "react";

import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex items-start justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-lg text-[--color-infra-text-secondary]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="ml-auto flex items-center space-x-4">{actions}</div>
      )}
    </div>
  );
}
