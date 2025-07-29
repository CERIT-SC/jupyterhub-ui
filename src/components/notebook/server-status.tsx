import React from "react";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

import { cn } from "@/lib/cn";

export type ServerStatusType = "active" | "inactive" | "loading" | "error";

interface ServerStatusProps {
  status: ServerStatusType;
  message?: string;
  className?: string;
}

export function ServerStatus({
  status,
  message,
  className,
}: ServerStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return (
          <CheckCircle2 className="h-5 w-5 text-[--color-infra-success]" />
        );
      case "inactive":
        return (
          <AlertCircle className="h-5 w-5 text-[--color-infra-text-secondary]" />
        );
      case "loading":
        return (
          <Clock className="h-5 w-5 text-[--color-infra-warning] animate-pulse" />
        );
      case "error":
        return <AlertCircle className="h-5 w-5 text-[--color-infra-error]" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (message) return message;

    switch (status) {
      case "active":
        return "Server is running";
      case "inactive":
        return "Server is stopped";
      case "loading":
        return "Server is updating...";
      case "error":
        return "Connection error";
      default:
        return "";
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {getStatusIcon()}
      <span className="text-sm font-medium">{getStatusText()}</span>
    </div>
  );
}
