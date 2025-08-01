"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchServerProgress } from "@/services/jupyterHub";
import { useAuth } from "@/hooks/useAuth";

type PageState = "starting" | "progress" | "ready" | "failed" | "error";

export default function SpawnProgress() {
  const params = useParams();

  const serverName =
    typeof params.serverName === "string" ? params.serverName : "";

  const { user } = useAuth();

  const [running, setRunning] = useState<boolean>(true);
  const [pageState, setPageState] = useState<PageState>("starting");
  const [messageHistory, setMessageHistory] = useState<string[]>([]);

  const { data, isError, error, isFetched } = useQuery({
    queryKey: ["user", "server", serverName],
    queryFn: () => {
      const username = user?.name;

      return fetchServerProgress(serverName, username);
    },
    enabled: running,
    // Use a very short refetch interval (500ms) while server is starting
    // to get near real-time updates during server initialization
    refetchInterval: running ? 5 : false,
    // Keep fetching even when window is not focused
    refetchIntervalInBackground: true,
    // Don't stale the data quickly so we can see updates
    staleTime: 0,
    // Don't cache the progress data for long
    retry: 3,
    retryDelay: 1000,
  });

  // Store previous progress value to detect changes
  const prevProgressRef = useRef<number>(0);

  // Track message history and update state based on progress
  useEffect(() => {
    if (data) {
      // Check if progress has changed
      if (data.progress !== prevProgressRef.current) {
        // Add progress update to message history
        const progressChange = data.progress - prevProgressRef.current;

        if (progressChange > 0) {
          const timestamp = new Date().toLocaleTimeString();

          setMessageHistory((prev) => [
            ...prev,
            `[${timestamp}] Progress update: ${prevProgressRef.current}% → ${data.progress}% (+${progressChange}%)`,
          ]);
        }
        prevProgressRef.current = data.progress;
      }
      // Update state based on progress and ready/failed status
      if (data.progress === 0) {
        setPageState("starting");
      } else if (data.progress > 0 && data.progress < 100) {
        setPageState("progress");
      } else if (data.progress >= 100) {
        if (data.ready) {
          setPageState("ready");
          setRunning(false);
        } else if (data.failed) {
          setPageState("failed");
          setRunning(false);
        }
      }

      // Add message to history if it's not empty and not already in the list
      if (data.message && data.message.trim() !== "") {
        setMessageHistory((prev) => {
          // Don't add duplicate consecutive messages
          if (prev.length > 0 && prev[prev.length - 1] === data.message) {
            return prev;
          }

          // Include timestamp with message for more detailed history
          const timestamp = new Date().toLocaleTimeString();
          const messageWithTime = `[${timestamp}] ${data.message}`;

          return [...prev, messageWithTime];
        });
      }
    }

    if (isError) {
      setPageState("error");
      setRunning(false);

      // Check if error is a 404 (server doesn't exist)
      const errorObj = error as any;

      if (errorObj?.response?.status === 404) {
        setMessageHistory((prev) => [
          ...prev,
          `Server '${serverName}' does not exist. Please check the server name and try again.`,
        ]);
      }
    }
  }, [data, isError, error, serverName]);

  const getStateIcon = () => {
    switch (pageState) {
      case "ready":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "failed":
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
    }
  };

  const getStateBadge = () => {
    switch (pageState) {
      case "starting":
        return <Badge variant="secondary">Starting</Badge>;
      case "progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "ready":
        return (
          <Badge className="bg-green-500" variant="default">
            Ready
          </Badge>
        );
      case "failed":
        return <Badge variant="warning">Failed</Badge>;
      case "error":
        return <Badge variant="warning">Error</Badge>;
    }
  };

  const getStatusText = () => {
    switch (pageState) {
      case "starting":
        return "Starting server...";
      case "progress":
        return "Server spawn in progress...";
      case "ready":
        return "Server is ready";
      case "failed":
        return "Server spawn failed";
      case "error":
        return "Error fetching server status";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <Link href="/hub/spawn">
          <Button size="sm" variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Spawn
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStateIcon()}
              Server Spawn Progress
            </CardTitle>
            {getStateBadge()}
          </div>
          <p className="text-sm text-muted-foreground">
            Server: <span className="font-mono">{serverName}</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{getStatusText()}</span>
              <span className="text-sm text-muted-foreground">
                {data?.progress || 0}%
              </span>
            </div>
            <Progress
              className={`h-2 ${pageState === "failed" ? "bg-red-200" : ""}`}
              value={data?.progress || 0}
            />
          </div>

          {/* Current Message */}
          {data?.message && (
            <div
              className={`p-3 rounded-lg ${pageState === "failed" ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"}`}
            >
              <p
                className={`text-sm ${pageState === "failed" ? "text-red-800" : "text-blue-800"}`}
              >
                {data.message}
              </p>
            </div>
          )}

          {/* Error Message */}
          {pageState === "error" && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <h3 className="font-medium text-red-800">Error</h3>
              </div>
              <p className="text-red-700">
                {(() => {
                  const errorObj = error as any;

                  if (errorObj?.response?.status === 404) {
                    return `Server '${serverName}' does not exist. Please check the server name and try again.`;
                  }

                  return errorObj?.message || "Failed to fetch server progress";
                })()}
              </p>

              {/* Show JSON response if available */}
              {(error as any)?.response?.data && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-red-800">
                    Response Details
                  </summary>
                  <pre className="mt-2 text-xs bg-white p-2 rounded border border-red-200 overflow-auto max-h-32">
                    {JSON.stringify((error as any).response.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* HTML Message (if available) */}
          {data?.html_message && (
            <div
              dangerouslySetInnerHTML={{ __html: data.html_message }}
              className={`p-3 rounded-lg text-sm ${pageState === "failed" ? "bg-red-50 border border-red-200 text-red-800" : "bg-blue-50 border border-blue-200 text-blue-800"}`}
            />
          )}

          {/* Message History */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Message History</h3>
            <div
              ref={(el) => {
                // Auto-scroll to bottom when new messages are added
                if (el) {
                  el.scrollTop = el.scrollHeight;
                }
              }}
              className="border rounded-lg max-h-48 overflow-y-auto p-2 bg-gray-50"
            >
              {messageHistory.length > 0 ? (
                <div className="space-y-2">
                  {messageHistory.map((message, index) => (
                    <div
                      key={index}
                      className="p-2 text-xs bg-white rounded border border-gray-200"
                    >
                      {(() => {
                        // Try to parse as JSON if message starts with { or [
                        if (
                          (message.startsWith("{") ||
                            message.startsWith("[")) &&
                          (message.endsWith("}") || message.endsWith("]"))
                        ) {
                          try {
                            const jsonObj = JSON.parse(message);

                            return (
                              <details>
                                <summary className="cursor-pointer font-medium">
                                  JSON Response
                                </summary>
                                <pre className="mt-1 overflow-auto max-h-24 text-xs">
                                  {JSON.stringify(jsonObj, null, 2)}
                                </pre>
                              </details>
                            );
                          } catch {
                            // If parsing fails, just display as text
                            return message;
                          }
                        }

                        return message;
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 p-2">No messages yet</p>
              )}
            </div>
          </div>

          {/* Ready State - Show Open Server Button */}
          {pageState === "ready" && data?.url && (
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-medium text-green-800">Server Ready</h3>
              </div>
              <p className="text-green-700 mb-3">
                Your server has been successfully spawned and is ready to use.
              </p>
              <Link
                href={
                  `${process.env.NEXT_PUBLIC_JUPYTERHUB_URL}/hub/` + data.url
                }
              >
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  Open Server
                </Button>
              </Link>
            </div>
          )}

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 text-xs text-muted-foreground">
              <details className="mt-2">
                <summary className="cursor-pointer">Debug Info</summary>
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <p>State: {pageState}</p>
                  <p>Running: {running.toString()}</p>

                  <p>Fetched: {isFetched.toString()}</p>
                  <p>Server Name: {serverName}</p>
                  <p>Username: {user?.name}</p>

                  {isError && (
                    <div className="mt-2">
                      <h4 className="font-medium mb-1">Error Details:</h4>
                      <div className="p-2 bg-red-100 rounded">
                        <p>
                          Status:{" "}
                          {(error as any)?.response?.status || "Unknown"}
                        </p>
                        <p>
                          Message:{" "}
                          {(error as Error)?.message || "Unknown error"}
                        </p>
                        {(error as any)?.response?.data && (
                          <details>
                            <summary className="cursor-pointer mt-1">
                              Response Data
                            </summary>
                            <pre className="mt-1 p-2 bg-white rounded overflow-auto max-h-32">
                              {JSON.stringify(
                                (error as any).response.data,
                                null,
                                2,
                              )}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  )}

                  {data && (
                    <div className="mt-2">
                      <h4 className="font-medium mb-1">Response Data:</h4>
                      <pre className="p-2 bg-blue-50 rounded overflow-auto max-h-40">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
