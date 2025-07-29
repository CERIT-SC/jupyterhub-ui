import React from "react";
import { Play, Square, Trash2, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

interface NotebookServer {
  name: string;
  url: string;
  ready: boolean;
  pending: "spawn" | "stop" | null;
  last_activity: string;
}

interface ServerListProps {
  servers: Record<string, NotebookServer>;
  onStop?: (serverName: string) => void;
  isLoading?: boolean;
}

export function ServerList({ servers, onStop, isLoading }: ServerListProps) {
  const serverEntries = Object.entries(servers);

  if (serverEntries.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p>No servers found.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading overlay that only appears when refreshing */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center z-10">
          <Loading size="sm" />
        </div>
      )}

      <div className="grid gap-4">
        {serverEntries.map(([serverName, server]) => (
          <Card key={serverName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">
                {serverName === "" ? "Default Server" : serverName}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {server.ready ? (
                  <Badge className="bg-green-500" variant="default">
                    <Play className="h-3 w-3 mr-1" />
                    Running
                  </Badge>
                ) : server.pending === "spawn" ? (
                  <Badge variant="secondary">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Starting
                  </Badge>
                ) : server.pending === "stop" ? (
                  <Badge variant="secondary">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Stopping
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Square className="h-3 w-3 mr-1" />
                    Stopped
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  {server.url && (
                    <p className="text-sm text-muted-foreground">
                      URL: {server.url}
                    </p>
                  )}
                  {server.last_activity && (
                    <p className="text-sm text-muted-foreground">
                      Last activity:{" "}
                      {new Date(server.last_activity).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {server.ready && (
                    <Button asChild size="sm">
                      <a
                        href={server.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Access
                      </a>
                    </Button>
                  )}
                  {(server.ready || server.pending) && (
                    <Button
                      disabled={server.pending === "stop"}
                      size="sm"
                      variant="outline"
                      onClick={() => onStop?.(serverName)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
