import React, { useContext } from "react";
import {
  Clock,
  Square,
  ExternalLink,
  Terminal,
  AlertTriangle,
  HardDrive,
  Activity,
  Info,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { formatTimeAgo, deleteServer } from "@/services/jupyterHub";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ServerStatus } from "@/services/jupyterHub";
import { NotebookDetailsDialog } from "@/components/notebook/notebook-details-dialog";
import { useAuth } from "@/hooks/useAuth";

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
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
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

export function NotebookCard({
  server,
  name,
  onStart,
  onStop,
  onRemove,
  className,
}: NotebookCardProps) {
  const { user } = useAuth();
  // Get status information from server
  const statusInfo = getStatusInfo(server);

  // Format timestamps
  const lastActive = server.last_activity
    ? formatTimeAgo(new Date(server.last_activity))
    : "Never";

  const startedTime = server.started
    ? formatTimeAgo(new Date(server.started))
    : "Not started";

  // Check for progress information
  const progress = server.progress ? "In progress..." : null;

  return (
    <Card
      className={cn(
        "transition-all overflow-hidden",
        server.ready
          ? "hover:shadow-md border-infra-primary/50"
          : server.pending === "stop"
            ? "opacity-85 border-orange-200"
            : server.pending
              ? "hover:shadow-md border-yellow-200"
              : "hover:shadow-md border-gray-200",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{name}</CardTitle>
            <div className="flex items-center mt-1">
              <Badge
                className={cn(
                  "flex items-center gap-1 text-xs font-normal",
                  statusInfo.className,
                )}
              >
                {statusInfo.icon}
                {statusInfo.status}
              </Badge>
            </div>
          </div>

          {server.ready && server.url && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    className="h-8 w-8"
                    size="icon"
                    variant="ghost"
                  >
                    <Link
                      href={
                        `${process.env.NEXT_PUBLIC_JUPYTERHUB_URL}/hub/` +
                        server.url
                      }
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open notebook</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-2">
        <div className="space-y-0.5">
          <ServerInfoItem
            icon={<Clock className="h-4 w-4 text-gray-400" />}
            label="Last activity"
            value={lastActive}
          />

          <ServerInfoItem
            icon={<Terminal className="h-4 w-4 text-gray-400" />}
            label="Started"
            value={startedTime}
          />

          {server.state?.pod_name && (
            <ServerInfoItem
              icon={<HardDrive className="h-4 w-4 text-gray-400" />}
              label="Pod"
              tooltip={server.state.pod_name}
              value={
                <span
                  className="truncate max-w-[120px] inline-block"
                  title={server.state.pod_name}
                >
                  {server.state.pod_name}
                </span>
              }
            />
          )}

          {server.pending && (
            <div className="pt-2">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-2 bg-yellow-400 rounded-full animate-pulse w-full" />
              </div>
              <p className="text-xs text-center mt-1 text-gray-500">
                {server.pending === "spawn"
                  ? "Starting server..."
                  : "Stopping server..."}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2 pt-2">
        <div className="flex">
          {!server.ready && !server.pending ? (
            <Button
              className="flex items-center"
              size="sm"
              variant="destructive"
              onClick={async () => {
                try {
                  await deleteServer(name, user?.name);
                  if (onRemove) onRemove();
                } catch (error) {
                  console.error("Failed to remove notebook:", error);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Remove
            </Button>
          ) : server.ready ? (
            <Button
              className="flex items-center"
              size="sm"
              variant="outline"
              onClick={onStop}
            >
              <Square className="h-4 w-4 mr-2" /> Stop
            </Button>
          ) : server.pending === "stop" ? (
            <Button
              disabled
              className="flex items-center"
              size="sm"
              variant="outline"
            >
              <LoaderCircle className="h-4 w-4 mr-2 animate-spin" /> Stopping...
            </Button>
          ) : (
            <Button
              className="flex items-center"
              size="sm"
              variant="outline"
              onClick={onStop}
            >
              <Square className="h-4 w-4 mr-2" /> Stop
            </Button>
          )}
        </div>

        <NotebookDetailsDialog
          notebook={server}
          notebookName={name}
          trigger={
            <Button size="sm" variant="ghost">
              <Info className="h-4 w-4 mr-2" />
              Details
            </Button>
          }
          onDelete={async () => {
            try {
              await deleteServer(name, user?.name);
              if (onRemove) onRemove();
            } catch (error) {
              console.error("Failed to remove notebook:", error);
            }
          }}
        />
      </CardFooter>
    </Card>
  );
}
