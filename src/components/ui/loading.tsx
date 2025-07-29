import React from "react";

import { cn } from "@/lib/cn";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function Loading({ size = "md", className, text }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div
        className={cn(
          "animate-spin rounded-full border-solid border-infra-primary border-t-transparent",
          sizeClasses[size],
          className,
        )}
      />
      {text && <p className="mt-3 text-sm text-infra-text-secondary">{text}</p>}
    </div>
  );
}

interface LoadingPageProps {
  text?: string;
  className?: string;
}

export function LoadingPage({ text, className }: LoadingPageProps) {
  return (
    <div
      className={cn(
        "h-[50vh] flex flex-col items-center justify-center",
        className,
      )}
    >
      <Loading size="lg" text={text} />
    </div>
  );
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-infra-surface/80 flex items-center justify-center z-50">
      <div className="bg-infra-surface p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Loading size="lg" text={text} />
      </div>
    </div>
  );
}
