import React from "react";
import {
  Activity,
  AlertTriangle,
  Clock,
  ExternalLink,
  HardDrive,
  Info,
  LoaderCircle,
  Play,
  Square,
  Terminal,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/utils";
import { ServerStatus } from "@/services/client/jupyterHub";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NotebookDetailsDialog } from "@/components/hub/notebook-details-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { env } from "next-runtime-env";

export interface NotebookCardProps {
  server: ServerStatus;
  name: string;
  onStart?: () => void;
  onStop?: () => void;
  onSettings?: () => void;
  onRemove?: () => void;
  className?: string;
}

/**
 * Helper function to get status display based on server state
 */
function getStatusInfo(server: ServerStatus): {
  status: string;
  variant: "success" | "outline" | "warning" | "destructive" | "secondary";
  icon: React.ReactNode;
  className?: string;
} {
  if (server.ready) {
    return {
      status: "Running",
      variant: "success",
      icon: <Activity className="h-3 w-3" />,
      className: "bg-green-50 text-green-700 border-green-200",
    };
  }

  if (server.pending === "spawn") {
    return {
      status: "Starting",
      variant: "warning",
      icon: <LoaderCircle className="h-3 w-3 animate-spin" />,
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
  }

  if (server.pending === "stop") {
    return {
      status: "Stopping",
      variant: "warning",
      icon: <LoaderCircle className="h-3 w-3 animate-spin" />,
      className: "bg-orange-50 text-orange-700 border-orange-200",
    };
  }

  if (!server.started) {
    return {
      status: "Stopped",
      variant: "outline",
      icon: <Square className="h-3 w-3" />,
      className: "bg-gray-50 text-gray-700 border-gray-200",
    };
  }

  // Default/unknown state
  return {
    status: "Unknown",
    variant: "secondary",
    icon: <AlertTriangle className="h-3 w-3" />,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  };
}

/**
 * Component to display server information
 */
interface ServerInfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tooltip?: string;
}

function ServerInfoItem({ icon, label, value, tooltip }: ServerInfoItemProps) {
  const content = (
    <div className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export function NotebookCard({ server, name, onStop, onRemove, onStart, className }: NotebookCardProps) {
  const JUPYTERHUB_URL = env("NEXT_PUBLIC_JUPYTERHUB_URL");
  const notbookLink = server.url && JUPYTERHUB_URL ? JUPYTERHUB_URL + server.url : "";

  // Get status information from server
  const statusInfo = getStatusInfo(server);

  // Format timestamps
  const lastActive = server.last_activity ? formatRelativeTime(new Date(server.last_activity)) : "Never";

  const startedTime = server.started ? formatRelativeTime(new Date(server.started)) : "Not started";

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        server.ready
          ? "border-infra-primary/50 hover:shadow-md"
          : server.pending === "stop"
            ? "border-orange-200 opacity-85"
            : server.pending
              ? "border-yellow-200 hover:shadow-md"
              : "border-gray-200 hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{name}</CardTitle>
            <div className="mt-1 flex items-center">
              <Badge className={cn("flex items-center gap-1 text-xs font-normal", statusInfo.className)}>
                {statusInfo.icon}
                {statusInfo.status}
              </Badge>
            </div>
          </div>

          {/* Top-right actions */}
          <TooltipProvider>
            {server.ready && server.url && JUPYTERHUB_URL ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild className="h-8 w-8" size="icon" variant="ghost" aria-label="Open notebook">
                    <Link href={notbookLink} rel="noopener noreferrer" target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open notebook</p>
                </TooltipContent>
              </Tooltip>
            ) : !server.ready && !server.pending ? (
              <AlertDialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button className="h-8 w-8" size="icon" variant="destructive" aria-label="Remove notebook">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove</p>
                  </TooltipContent>
                </Tooltip>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove notebook?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the stopped notebook. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onRemove?.();
                      }}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-2">
        <div className="space-y-0.5">
          <ServerInfoItem icon={<Clock className="h-4 w-4 text-gray-400" />} label="Last activity" value={lastActive} />

          <ServerInfoItem icon={<Terminal className="h-4 w-4 text-gray-400" />} label="Started" value={startedTime} />

          {server.state?.pod_name && (
            <ServerInfoItem
              icon={<HardDrive className="h-4 w-4 text-gray-400" />}
              label="Pod"
              tooltip={server.state.pod_name}
              value={
                <span className="inline-block max-w-[120px] truncate" title={server.state.pod_name}>
                  {server.state.pod_name}
                </span>
              }
            />
          )}

          {server.pending && (
            <div className="pt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-2 w-full animate-pulse rounded-full bg-yellow-400" />
              </div>
              <p className="mt-1 text-center text-xs text-gray-500">
                {server.pending === "spawn" ? "Starting server..." : "Stopping server..."}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2 pt-2">
        <div className="flex">
          {/* No footer Remove button when stopped; action moved to top-right */}
          {server.ready ? (
            <Button className="flex items-center" size="sm" variant="outline" onClick={onStop}>
              <Square className="mr-2 h-4 w-4" /> Stop
            </Button>
          ) : server.pending === "stop" ? (
            <Button disabled className="flex items-center" size="sm" variant="outline">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Stopping...
            </Button>
          ) : server.pending ? (
            <Button className="flex items-center" size="sm" variant="outline" onClick={onStop}>
              <Square className="mr-2 h-4 w-4" /> Stop
            </Button>
          ) : server.stopped ? (
            <Button className="flex items-center" size="sm" variant="outline" onClick={onStart}>
              <Play className="mr-2 h-4 w-4" /> Start
            </Button>
          ) : null}
        </div>

        <NotebookDetailsDialog
          notebook={server}
          notebookName={name}
          trigger={
            <Button size="sm" variant="ghost">
              <Info className="mr-2 h-4 w-4" />
              Details
            </Button>
          }
          onDelete={onRemove}
        />
      </CardFooter>
    </Card>
  );
}
